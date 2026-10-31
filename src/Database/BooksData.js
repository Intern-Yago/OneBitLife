export const BOOK_CATEGORIES = [
  { id: "ALL", label: "Todos", code: "[TODOS]" },
  { id: "TECH", label: "Tecnologia & Dev", code: "[TECH]" },
  { id: "POLITICS", label: "Política & Filosofia", code: "[SOCIEDADE]" },
  { id: "MIND", label: "Mente & Hábitos", code: "[MENTE]" },
  { id: "WEALTH", label: "Finanças & Riqueza", code: "[WEALTH]" },
];

export const BOOKS_CATALOG = [
  // --- TECNOLOGIA & ENGENHARIA DE SOFTWARE ---
  {
    id: "clean-code",
    title: "Código Limpo (Clean Code)",
    author: "Robert C. Martin (Uncle Bob)",
    category: "TECH",
    tag: "Tecnologia",
    pages: 425,
    buyUrl: "https://www.amazon.com.br/s?k=Codigo+Limpo+Robert+Martin",
    takeaways: [
      "Nomes com intenção clara eliminam a necessidade de comentários redundantes.",
      "Funções devem ser pequenas e fazer apenas uma única coisa muito bem.",
      "Regra do Escoteiro: Deixe o código mais limpo do que quando você o encontrou.",
    ],
    actionRoutine: {
      habitName: "Ler Clean Code (15 min)",
      habitArea: "Mente",
      habitFrequency: "Diário",
      habitType: "timer",
      targetValue: 15,
      unit: "min",
      difficulty: "Rank A",
      icon: "⚡",
    },
  },
  {
    id: "pragmatic-programmer",
    title: "O Programador Pragmático",
    author: "Andrew Hunt & David Thomas",
    category: "TECH",
    tag: "Tecnologia",
    pages: 352,
    buyUrl: "https://www.amazon.com.br/s?k=O+Programador+Pragmatico",
    takeaways: [
      "Princípio DRY (Don't Repeat Yourself): cada conhecimento deve ter representação única.",
      "Invista regularmente na sua carteira de conhecimento como em ativos financeiros.",
      "Software não se constrói como prédios rígidos; ele cresce e se cultiva como jardinagem.",
    ],
    actionRoutine: {
      habitName: "Estudo Programador Pragmático",
      habitArea: "Mente",
      habitFrequency: "Diário",
      habitType: "timer",
      targetValue: 20,
      unit: "min",
      difficulty: "Rank A",
      icon: "⚡",
    },
  },
  {
    id: "data-intensive-apps",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    category: "TECH",
    tag: "Tecnologia",
    pages: 616,
    buyUrl: "https://www.amazon.com.br/s?k=Designing+Data-Intensive+Applications+Kleppmann",
    takeaways: [
      "Confiabilidade, escalabilidade e manutenibilidade são os pilares de sistemas modernos.",
      "Compreensão profunda dos trade-offs entre consistência, latência e particionamento (CAP).",
      "Modelos de dados e linguagens de consulta moldam a arquitetura inteira do software.",
    ],
    actionRoutine: {
      habitName: "Estudo de Arquitetura Kleppmann",
      habitArea: "Mente",
      habitFrequency: "Diário",
      habitType: "counter",
      targetValue: 10,
      unit: "págs",
      difficulty: "Rank S",
      icon: "⚡",
    },
  },
  {
    id: "refactoring",
    title: "Refatoração: Aperfeiçoando o Design de Código",
    author: "Martin Fowler",
    category: "TECH",
    tag: "Tecnologia",
    pages: 448,
    buyUrl: "https://www.amazon.com.br/s?k=Refatoracao+Martin+Fowler",
    takeaways: [
      "Qualquer tolo pode escrever código que um computador entenda. Bons programadores escrevem código para humanos.",
      "Identifique 'bad smells' no código e aplique transformações pequenas e seguras com testes.",
      "Refatoração contínua mantém a velocidade de entrega sustentável ao longo dos anos.",
    ],
    actionRoutine: {
      habitName: "Leitura de Refatoração (Fowler)",
      habitArea: "Mente",
      habitFrequency: "Diário",
      habitType: "timer",
      targetValue: 15,
      unit: "min",
      difficulty: "Rank B",
      icon: "⚡",
    },
  },

  // --- POLÍTICA, FILOSOFIA & SOCIEDADE ---
  {
    id: "o-capital-manifesto",
    title: "O Capital & Manifesto Comunista",
    author: "Karl Marx & Friedrich Engels",
    category: "POLITICS",
    tag: "Economia Política",
    pages: 360,
    buyUrl: "https://www.amazon.com.br/s?k=Manifesto+Comunista+Karl+Marx",
    takeaways: [
      "Análise do materialismo histórico e da luta de classes como motor das transformações sociais.",
      "A teoria do valor-trabalho e a dinâmica da mais-valia na produção industrial e acumulação de capital.",
      "Crítica estrutural das contradições internas e crises cíclicas dos modos de produção modernos.",
    ],
    actionRoutine: {
      habitName: "Estudo Crítico: Teoria Marxista",
      habitArea: "Mente",
      habitFrequency: "Diário",
      habitType: "timer",
      targetValue: 20,
      unit: "min",
      difficulty: "Rank A",
      icon: "⚡",
    },
  },
  {
    id: "riqueza-das-nacoes",
    title: "A Riqueza das Nações",
    author: "Adam Smith",
    category: "POLITICS",
    tag: "Liberalismo Econômico",
    pages: 576,
    buyUrl: "https://www.amazon.com.br/s?k=A+Riqueza+das+Nacoes+Adam+Smith",
    takeaways: [
      "A divisão do trabalho como a maior alavanca de produtividade e especialização humana.",
      "O conceito de coordenação descentralizada dos mercados guiados pelo autointeresse produtivo.",
      "Diferença entre valor de uso e valor de troca na formação de preços e trocas voluntárias.",
    ],
    actionRoutine: {
      habitName: "Estudo Adam Smith: Mercados",
      habitArea: "Mente",
      habitFrequency: "Diário",
      habitType: "counter",
      targetValue: 10,
      unit: "págs",
      difficulty: "Rank A",
      icon: "⚡",
    },
  },
  {
    id: "o-principe",
    title: "O Príncipe",
    author: "Nicolau Maquiavel",
    category: "POLITICS",
    tag: "Filosofia Política",
    pages: 160,
    buyUrl: "https://www.amazon.com.br/s?k=O+Principe+Maquiavel",
    takeaways: [
      "Realismo político: entender o mundo como ele é de fato, não como deveria ser idealmente.",
      "Equilíbrio estratégico entre a Fortuna (circunstâncias externas) e a Virtù (habilidade e agência).",
      "Um líder deve buscar a solidez estrutural e evitar o desprezo e a volatilidade das massas.",
    ],
    actionRoutine: {
      habitName: "Leitura de Estratégia: O Príncipe",
      habitArea: "Mente",
      habitFrequency: "Diário",
      habitType: "timer",
      targetValue: 15,
      unit: "min",
      difficulty: "Rank B",
      icon: "⚡",
    },
  },
  {
    id: "sociedade-aberta",
    title: "A Sociedade Aberta e Seus Inimigos",
    author: "Karl Popper",
    category: "POLITICS",
    tag: "Epistemologia & Política",
    pages: 480,
    buyUrl: "https://www.amazon.com.br/s?k=A+Sociedade+Aberta+e+Seus+Inimigos+Popper",
    takeaways: [
      "Defesa inegociável da democracia crítica contra regimes autoritários e certezas dogmáticas.",
      "Falibilismo: nenhuma autoridade detém a verdade absoluta; o progresso surge da refutação de erros.",
      "Engenharia social gradual (passo a passo) é superior a revoluções utópicas que sacrificam gerações.",
    ],
    actionRoutine: {
      habitName: "Leitura Karl Popper: Sociedade Aberta",
      habitArea: "Mente",
      habitFrequency: "Diário",
      habitType: "counter",
      targetValue: 8,
      unit: "págs",
      difficulty: "Rank S",
      icon: "⚡",
    },
  },

  // --- MENTE, FOCO & HÁBITOS ---
  {
    id: "habitos-atomicos",
    title: "Hábitos Atômicos",
    author: "James Clear",
    category: "MIND",
    tag: "Comportamento",
    pages: 320,
    buyUrl: "https://www.amazon.com.br/s?k=Habitos+Atomicos+James+Clear",
    takeaways: [
      "1% de melhora a cada dia resulta em 37 vezes de evolução ao final de um ano.",
      "Não foque apenas em metas, construa sistemas e mude sua identidade.",
      "As 4 leis da mudança: torne-o claro, atraente, fácil e satisfatório.",
    ],
    actionRoutine: {
      habitName: "Leitura Hábitos Atômicos (10 págs)",
      habitArea: "Mente",
      habitFrequency: "Diário",
      habitType: "counter",
      targetValue: 10,
      unit: "págs",
      difficulty: "Rank B",
      icon: "⚡",
    },
  },
  {
    id: "deep-work",
    title: "Trabalho Focado (Deep Work)",
    author: "Cal Newport",
    category: "MIND",
    tag: "Produtividade",
    pages: 296,
    buyUrl: "https://www.amazon.com.br/s?k=Trabalho+Focado+Cal+Newport",
    takeaways: [
      "A habilidade de foco profundo é cada vez mais rara e simultaneamente mais valiosa no mercado.",
      "Multitarefa destrói a densidade neural do trabalho através do resíduo de atenção.",
      "Programe blocos inegociáveis de concentração sem celular, notificações ou abas abertas.",
    ],
    actionRoutine: {
      habitName: "Sessão Deep Work (45 min)",
      habitArea: "Mente",
      habitFrequency: "Diário",
      habitType: "timer",
      targetValue: 45,
      unit: "min",
      difficulty: "Rank A",
      icon: "⚡",
    },
  },
  {
    id: "mindset",
    title: "Mindset: A Nova Psicologia do Sucesso",
    author: "Carol S. Dweck",
    category: "MIND",
    tag: "Psicologia",
    pages: 312,
    buyUrl: "https://www.amazon.com.br/s?k=Mindset+Carol+Dweck",
    takeaways: [
      "Mindset Fixo vê talento como estático; Mindset de Crescimento vê esforço como o motor da habilidade.",
      "O fracasso não é uma sentença de identidade, mas um dado de calibração para a próxima tentativa.",
      "O poder da palavra 'ainda': 'Eu não sei fazer isso... AINDA'.",
    ],
    actionRoutine: {
      habitName: "Reflexão de Mindset (15 min)",
      habitArea: "Humor",
      habitFrequency: "Diário",
      habitType: "timer",
      targetValue: 15,
      unit: "min",
      difficulty: "Rank B",
      icon: "⚡",
    },
  },

  // --- FINANÇAS & RIQUEZA ---
  {
    id: "psicologia-financeira",
    title: "A Psicologia Financeira",
    author: "Morgan Housel",
    category: "WEALTH",
    tag: "Finanças",
    pages: 304,
    buyUrl: "https://www.amazon.com.br/s?k=A+Psicologia+Financeira+Morgan+Housel",
    takeaways: [
      "O sucesso financeiro tem menos a ver com inteligência matemática e mais com seu comportamento emocional.",
      "Riqueza é o que você não vê: são os carros não comprados e os luxos evitados para ter liberdade.",
      "Margem de segurança é o segredo para sobreviver aos imprevistos e deixar os juros compostos agirem.",
    ],
    actionRoutine: {
      habitName: "Revisão Orçamentária e Housel",
      habitArea: "Financeiro",
      habitFrequency: "Diário",
      habitType: "check",
      targetValue: 1,
      unit: "check",
      difficulty: "Rank B",
      icon: "⚡",
    },
  },
  {
    id: "pai-rico-pai-pobre",
    title: "Pai Rico, Pai Pobre",
    author: "Robert T. Kiyosaki",
    category: "WEALTH",
    tag: "Educação Financeira",
    pages: 336,
    buyUrl: "https://www.amazon.com.br/s?k=Pai+Rico+Pai+Pobre+Kiyosaki",
    takeaways: [
      "Os ricos adquirem ativos (que colocam dinheiro no bolso); os outros adquirem passivos pensando que são ativos.",
      "Não trabalhe apenas por dinheiro; aprenda a fazer o dinheiro e os sistemas trabalharem para você.",
      "A corrida dos ratos é gerada pelo medo e pela ganância; a saída é a literacia financeira.",
    ],
    actionRoutine: {
      habitName: "Estudo Ativos vs Passivos",
      habitArea: "Financeiro",
      habitFrequency: "Diário",
      habitType: "timer",
      targetValue: 20,
      unit: "min",
      difficulty: "Rank B",
      icon: "⚡",
    },
  },
  {
    id: "homem-mais-rico-babilonia",
    title: "O Homem Mais Rico da Babilônia",
    author: "George S. Clason",
    category: "WEALTH",
    tag: "Princípios Antigos",
    pages: 160,
    buyUrl: "https://www.amazon.com.br/s?k=O+Homem+Mais+Rico+da+Babilonia",
    takeaways: [
      "Pague a si mesmo primeiro: reserve no mínimo 10% de tudo o que você ganha antes de qualquer despesa.",
      "Consulte homens sábios e invista seu tesouro apenas onde ele estiver seguro contra perdas aventureiras.",
      "Faça com que cada moeda de ouro trabalhe para você como um escravo leal, gerando filhos e netos de rendimento.",
    ],
    actionRoutine: {
      habitName: "Reserva de 10% & Leitura Clason",
      habitArea: "Financeiro",
      habitFrequency: "Semanal",
      habitType: "check",
      targetValue: 1,
      unit: "check",
      difficulty: "Rank B",
      icon: "⚡",
    },
  },
];

// Helper para calcular a recomendação da semana (rotação dinâmica semanal sem repetição)
export function getWeeklyFeaturedBooks() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);

  // Seleciona 4 livros destacados da semana cobrindo cada categoria
  const techBooks = BOOKS_CATALOG.filter((b) => b.category === "TECH");
  const politicsBooks = BOOKS_CATALOG.filter((b) => b.category === "POLITICS");
  const mindBooks = BOOKS_CATALOG.filter((b) => b.category === "MIND");
  const wealthBooks = BOOKS_CATALOG.filter((b) => b.category === "WEALTH");

  const pickTech = techBooks[weekNumber % techBooks.length];
  const pickPolitics = politicsBooks[weekNumber % politicsBooks.length];
  const pickMind = mindBooks[weekNumber % mindBooks.length];
  const pickWealth = wealthBooks[weekNumber % wealthBooks.length];

  return {
    weekNumber,
    featured: [pickTech, pickPolitics, pickMind, pickWealth].filter(Boolean),
  };
}
