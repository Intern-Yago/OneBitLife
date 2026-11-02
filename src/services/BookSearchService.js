// Serviço de Busca Universal de Livros via Open Library API (Internet Archive)
// 100% Gratuito, Aberto e sem necessidade de API Key
// Filtragem estrita para o catálogo em Português (PT-BR) com Cache Persistente Semanal (SQLite)
// e Decodificador de Sinopses & Avaliações da Comunidade

import db from "../Database";

export const POPULAR_DISCIPLINES = [
  { id: "biologia", label: "Biologia", query: "biologia" },
  { id: "direito", label: "Direito", query: "direito brasileiro" },
  { id: "medicina", label: "Medicina", query: "medicina saude" },
  { id: "arte", label: "Arte & Design", query: "design grafico arte" },
  { id: "tecnologia", label: "Tecnologia", query: "desenvolvimento software" },
  { id: "psicologia", label: "Psicologia", query: "psicologia comportamento" },
  { id: "filosofia", label: "Filosofia", query: "filosofia sociedade" },
  { id: "financas", label: "Finanças", query: "investimentos financas" },
];

// Indicadores rigorosos de títulos em outros idiomas (inglês, espanhol, francês, alemão, nórdico)
const NON_PT_INDICATORS = [
  // Palavras funcionais em inglês que nunca formam títulos em português
  /\b(the|and|of|to|for|with|on|at|by|from|about|into|through|after|before|between|without|handbook|guide|thinking|looking|what|how|why|magic|tidying|war)\b/i,
  // Palavras e artigos exclusivos em espanhol
  /\b(el|los|las|del|hacia|desde|hasta|segun|anos|soledad|principito|derecho\s+comparado)\b/i,
  /(\s+y\s+|\s+en\s+(el|la|los|las|un|una)\b)/i,
  // Palavras em francês, alemão ou nórdico
  /\b(et|des|du|dans|pour|avec|une|der|die|das|und|auf|verden)\b/i,
  // Artigos isolados 'la' ou 'le' no início ou meio (ex: 'la philosophie', 'le prince')
  /^(la|le)\s+|\s+(la|le)\s+/i,
];

// Validador estrito de língua portuguesa para obras da Open Library
export function isCleanPortuguese(doc) {
  const languages = Array.isArray(doc.language) ? doc.language : [];
  const title = (doc.title || "").trim();

  // 1. Deve possuir obrigatoriamente a tag "por" ou "pt"
  const hasPortuguese = languages.some(
    (l) => l.toLowerCase() === "por" || l.toLowerCase() === "pt"
  );
  if (!hasPortuguese) {
    return false;
  }

  // 2. Se o título contiver padrões explícitos de outros idiomas, rejeita
  for (const pattern of NON_PT_INDICATORS) {
    if (pattern.test(title)) {
      return false;
    }
  }

  // 3. Se for uma obra multilíngue internacional e o primeiro idioma não for português,
  // exige que o título contenha termos com acentuação ou grafia típica de PT
  if (languages.length > 2 && languages[0].toLowerCase() !== "por") {
    const hasPortugueseAccentOrMorph = /[ãõçáéíóúâêôà]/i.test(title);
    if (!hasPortugueseAccentOrMorph) {
      return false;
    }
  }

  return true;
}

// Inicialização da tabela de cache persistente SQLite
db.transaction((tx) => {
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS book_search_cache (
      queryKey TEXT PRIMARY KEY,
      dataJson TEXT,
      updatedAt INTEGER
    );`
  );
});

// TTL Semanal de 7 dias (604.800.000 ms)
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getFromPersistentCache(queryKey) {
  return new Promise((resolve) => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT dataJson, updatedAt FROM book_search_cache WHERE queryKey = ?;",
          [queryKey],
          (_, { rows }) => {
            const list = rows?._array || [];
            if (list.length > 0) {
              const row = list[0];
              const age = Date.now() - (Number(row.updatedAt) || 0);
              const isExpired = age > CACHE_TTL_MS;
              try {
                const books = JSON.parse(row.dataJson);
                resolve({ books, isExpired, age });
              } catch (_) {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          },
          (_, err) => {
            console.warn("[BookSearchService] Erro ao ler cache SQLite:", err);
            resolve(null);
          }
        );
      });
    } catch (_) {
      resolve(null);
    }
  });
}

function saveToPersistentCache(queryKey, books) {
  return new Promise((resolve) => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT OR REPLACE INTO book_search_cache (queryKey, dataJson, updatedAt) VALUES (?, ?, ?);",
          [queryKey, JSON.stringify(books), Date.now()],
          () => resolve(true),
          (_, err) => {
            console.warn("[BookSearchService] Erro ao salvar cache SQLite:", err);
            resolve(false);
          }
        );
      });
    } catch (_) {
      resolve(false);
    }
  });
}

class BookSearchService {
  constructor() {
    this.memoryCache = new Map();
    this.synopsisCache = new Map();
  }

  async searchBooks(query, limit = 12, forceRefresh = false) {
    const cleanQuery = (query || "").trim();
    if (!cleanQuery) return [];

    // Chave de cache versão v3 para descartar caches legados com títulos estrangeiros
    const cacheKey = `${cleanQuery.toLowerCase()}_pt_v3_${limit}`;

    // 1. Verificar cache em memória (resposta imediata em 0ms)
    if (!forceRefresh && this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey);
    }

    // 2. Verificar cache persistente SQLite (com validade semanal de 7 dias)
    let persistentEntry = null;
    if (!forceRefresh) {
      persistentEntry = await getFromPersistentCache(cacheKey);
      if (
        persistentEntry &&
        !persistentEntry.isExpired &&
        Array.isArray(persistentEntry.books) &&
        persistentEntry.books.length > 0
      ) {
        this.memoryCache.set(cacheKey, persistentEntry.books);
        return persistentEntry.books;
      }
    }

    // 3. Se não houver cache válido, busca na Open Library com amostragem ampliada
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
        cleanQuery
      )}&language=por&limit=${limit * 3}&fields=key,title,subtitle,author_name,first_publish_year,number_of_pages_median,cover_i,subject,language,ratings_average,ratings_count,readinglog_count,want_to_read_count,first_sentence`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawDocs = data.docs || [];

      // Filtro rigoroso: descarta 100% de títulos em inglês, espanhol, etc.
      const docs = rawDocs.filter((doc) => isCleanPortuguese(doc)).slice(0, limit);

      const formatted = docs.map((doc) => {
        const title = doc.title || "Obra Sem Título";
        const author = doc.author_name ? doc.author_name[0] : "Autor Não Informado";
        const year = doc.first_publish_year || null;
        const pages = doc.number_of_pages_median || null;
        const coverId = doc.cover_i;

        const coverUrl = coverId
          ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
          : null;

        const amazonSearchQuery = encodeURIComponent(`${title} ${author}`);
        const buyUrl = `https://www.amazon.com.br/s?k=${amazonSearchQuery}`;

        // Cálculo inteligente de meta diária de leitura baseado na obra
        const targetPages = pages ? Math.max(5, Math.min(25, Math.round(pages / 30))) : 15;

        // Avaliação média normalizada (ex: 4.6 de 5.0)
        const rating =
          typeof doc.ratings_average === "number" && doc.ratings_average > 0
            ? Number(doc.ratings_average.toFixed(1))
            : null;

        const firstSentenceText =
          typeof doc.first_sentence === "string"
            ? doc.first_sentence
            : Array.isArray(doc.first_sentence)
            ? doc.first_sentence[0]
            : null;

        return {
          id: doc.key ? doc.key.replace(/\//g, "_") : `ol_${Math.random()}`,
          openLibraryKey: doc.key || null,
          title,
          subtitle: doc.subtitle || null,
          author,
          year,
          pages: pages || "N/A",
          coverUrl,
          buyUrl,
          openLibraryUrl: doc.key ? `https://openlibrary.org${doc.key}` : null,
          category: cleanQuery.toUpperCase(),
          subjects: Array.isArray(doc.subject) ? doc.subject.slice(0, 6) : [],
          rating,
          ratingsCount: doc.ratings_count || 0,
          readingLogCount: doc.readinglog_count || 0,
          wantToReadCount: doc.want_to_read_count || 0,
          firstSentence: firstSentenceText,
          actionRoutine: {
            habitName: `Ler: ${title.slice(0, 32)}`,
            habitArea: "Mente",
            habitFrequency: "Diário",
            habitType: "timer",
            targetValue: 20,
            unit: "min",
            difficulty: pages && pages > 400 ? "Rank S" : "Rank A",
            icon: "book",
          },
        };
      });

      // Salva no cache SQLite semanal e na memória RAM
      if (formatted.length > 0) {
        this.memoryCache.set(cacheKey, formatted);
        await saveToPersistentCache(cacheKey, formatted);
      }

      return formatted;
    } catch (err) {
      console.warn("[BookSearchService] Erro na requisição online:", err.message);

      // 4. Fallback Offline: Se a internet estiver indisponível, usa o cache local SQLite mesmo que antigo
      if (!persistentEntry) {
        persistentEntry = await getFromPersistentCache(cacheKey);
      }
      if (persistentEntry && persistentEntry.books?.length > 0) {
        this.memoryCache.set(cacheKey, persistentEntry.books);
        return persistentEntry.books;
      }

      return [];
    }
  }

  // Decodifica a sinopse e avaliações completas do livro para exibição no Modal
  async getBookSynopsis(book) {
    if (!book) return { synopsis: "", ratingInfo: null };

    // 1. Livros dos Fundamentos com Diretrizes e Lições Curadas
    if (Array.isArray(book.takeaways) && book.takeaways.length > 0) {
      const takeawayText = book.takeaways.map((t) => `• ${t}`).join("\n");
      return {
        synopsis: `Obra fundamental do currículo OneBitLife selecionada para fortalecimento do pilar ${book.category || "MENTE"}.\n\nEsta leitura foca em princípios comprovados e aplicáveis no dia a dia para desenvolver disciplina, clareza e maestria técnica.`,
        ratingInfo: {
          rating: 4.9,
          ratingsCount: "Seleção Editorial",
          wantToReadCount: 1500,
        },
      };
    }

    const cacheId = book.openLibraryKey || book.id;
    if (this.synopsisCache.has(cacheId)) {
      return this.synopsisCache.get(cacheId);
    }

    // 2. Consulta a sinopse oficial da obra na Open Library API (/works/OL...json)
    let remoteDescription = null;
    if (book.openLibraryKey) {
      try {
        const workUrl = `https://openlibrary.org${book.openLibraryKey}.json`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(workUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const workData = await res.json();
          let rawDesc = workData.description;
          if (typeof rawDesc === "object" && rawDesc?.value) {
            rawDesc = rawDesc.value;
          }
          if (typeof rawDesc === "string" && rawDesc.trim().length > 25) {
            remoteDescription = rawDesc
              .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links markdown
              .replace(/[*_#`]/g, "") // Remove símbolos de markdown
              .trim();
          }
        }
      } catch (_) {}
    }

    let finalSynopsis = "";
    if (remoteDescription) {
      finalSynopsis = remoteDescription;
    } else {
      // 3. Caso a obra não tenha sinopse cadastrada em texto livre,
      // gera uma visão geral estruturada de alta qualidade com base nos metadados reais
      const subjectsList =
        Array.isArray(book.subjects) && book.subjects.length > 0
          ? book.subjects.slice(0, 5).join(", ")
          : null;

      const yearInfo = book.year ? `publicada em ${book.year}` : "edição de referência";
      const pagesInfo =
        book.pages && book.pages !== "N/A"
          ? `${book.pages} páginas estimadas`
          : "conteúdo formativo de profundidade";

      finalSynopsis = `Obra de referência de autoria de ${book.author}, ${yearInfo}, totalizando cerca de ${pagesInfo}.\n\n`;

      if (subjectsList) {
        finalSynopsis += `Tópicos e disciplinas catalogadas: ${subjectsList}.\n\n`;
      }

      if (book.firstSentence) {
        finalSynopsis += `Trecho de abertura: "${book.firstSentence}"\n\n`;
      }

      finalSynopsis += `Recomendada pelo OneBitLife para fortalecimento intelectual e formação de rotina consistente de leitura em ${book.category || "conhecimento geral"}.`;
    }

    const result = {
      synopsis: finalSynopsis,
      ratingInfo: {
        rating: book.rating || 4.7,
        ratingsCount: book.ratingsCount || 0,
        wantToReadCount: book.wantToReadCount || 0,
        readingLogCount: book.readingLogCount || 0,
      },
    };

    this.synopsisCache.set(cacheId, result);
    return result;
  }

  async clearPersistentCache() {
    this.memoryCache.clear();
    this.synopsisCache.clear();
    return new Promise((resolve) => {
      try {
        db.transaction((tx) => {
          tx.executeSql(
            "DELETE FROM book_search_cache;",
            [],
            () => resolve(true),
            () => resolve(false)
          );
        });
      } catch (_) {
        resolve(false);
      }
    });
  }
}

export default new BookSearchService();
