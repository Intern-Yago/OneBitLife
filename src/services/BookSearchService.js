// Serviço de Busca Universal de Livros via Open Library API (Internet Archive)
// 100% Gratuito, Aberto e sem necessidade de API Key
// Filtragem estrita para o catálogo em Português (PT-BR) com Cache Persistente Semanal (SQLite)

import db from "../Database";

export const POPULAR_DISCIPLINES = [
  { id: "biologia", label: "Biologia", query: "biologia" },
  { id: "direito", label: "Direito", query: "direito brasileiro" },
  { id: "medicina", label: "Medicina", query: "medicina saude" },
  { id: "arte", label: "Arte & Design", query: "arte design" },
  { id: "tecnologia", label: "Tecnologia", query: "programacao tecnologia" },
  { id: "psicologia", label: "Psicologia", query: "psicologia comportamento" },
  { id: "filosofia", label: "Filosofia", query: "filosofia" },
  { id: "financas", label: "Finanças", query: "financas investimentos" },
];

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
  }

  async searchBooks(query, limit = 12, forceRefresh = false) {
    const cleanQuery = (query || "").trim();
    if (!cleanQuery) return [];

    const cacheKey = `${cleanQuery.toLowerCase()}_pt_${limit}`;

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

    // 3. Se não houver cache válido (ou se for busca específica nova), faz a requisição à Open Library
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
        cleanQuery
      )}&language=por&limit=${limit * 2}&fields=key,title,author_name,first_publish_year,number_of_pages_median,cover_i,subject,language`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawDocs = data.docs || [];

      // Filtro estrito client-side para assegurar apenas obras em língua portuguesa
      const docs = rawDocs
        .filter((doc) => {
          if (Array.isArray(doc.language) && doc.language.length > 0) {
            return doc.language.some(
              (lang) =>
                lang.toLowerCase() === "por" || lang.toLowerCase() === "pt"
            );
          }
          return true;
        })
        .slice(0, limit);

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

        return {
          id: doc.key ? doc.key.replace(/\//g, "_") : `ol_${Math.random()}`,
          title,
          author,
          year,
          pages: pages || "N/A",
          coverUrl,
          buyUrl,
          openLibraryUrl: doc.key ? `https://openlibrary.org${doc.key}` : null,
          category: cleanQuery.toUpperCase(),
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

  async clearPersistentCache() {
    this.memoryCache.clear();
    return new Promise((resolve) => {
      try {
        db.transaction((tx) => {
          tx.executeSql("DELETE FROM book_search_cache;", [], () => resolve(true), () => resolve(false));
        });
      } catch (_) {
        resolve(false);
      }
    });
  }
}

export default new BookSearchService();
