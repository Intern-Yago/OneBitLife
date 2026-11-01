// Serviço de Busca Universal de Livros via Open Library API (Internet Archive)
// 100% Gratuito, Aberto e sem necessidade de API Key

export const POPULAR_DISCIPLINES = [
  { id: "biologia", label: "Biologia", query: "biologia" },
  { id: "direito", label: "Direito", query: "direito" },
  { id: "medicina", label: "Medicina", query: "medicina" },
  { id: "arte", label: "Arte & Design", query: "historia da arte" },
  { id: "tecnologia", label: "Tecnologia", query: "programacao software" },
  { id: "psicologia", label: "Psicologia", query: "psicologia" },
  { id: "filosofia", label: "Filosofia", query: "filosofia" },
  { id: "financas", label: "Finanças", query: "financas investimentos" },
];

class BookSearchService {
  constructor() {
    this.cache = new Map();
  }

  async searchBooks(query, limit = 12) {
    const cleanQuery = (query || "").trim();
    if (!cleanQuery) return [];

    const cacheKey = `${cleanQuery.toLowerCase()}_${limit}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
        cleanQuery
      )}&limit=${limit}&fields=key,title,author_name,first_publish_year,number_of_pages_median,cover_i,subject`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const docs = data.docs || [];

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
            icon: "⚡",
          },
        };
      });

      this.cache.set(cacheKey, formatted);
      return formatted;
    } catch (err) {
      console.warn("[BookSearchService] Erro na busca de livros:", err.message);
      return [];
    }
  }
}

export default new BookSearchService();
