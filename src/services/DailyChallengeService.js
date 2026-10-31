import HabitsService from "./HabitsService";
import SoundService from "./SoundService";

const CHALLENGE_POOL = [
  // Categoria: Bio / Físico
  {
    category: "Bio Boost ⚡",
    title: "Choque Criogênico",
    description: "Tome seu banho normal, mas termine com 1 minuto completo de água fria.",
    xpReward: 50,
  },
  {
    category: "Bio Boost ⚡",
    title: "Respiração 4-7-8",
    description: "Faça 4 ciclos de respiração consciente (inspire 4s, segure 7s, solte 8s).",
    xpReward: 40,
  },
  {
    category: "Bio Boost ⚡",
    title: "Postura de Titã",
    description: "Passe 5 minutos fazendo alongamento de coluna e peitoral ao acordar.",
    xpReward: 45,
  },
  {
    category: "Bio Boost ⚡",
    title: "Banho de Fótons",
    description: "Tome 10 minutos de sol matinal direto nos olhos e pele sem óculos escuros.",
    xpReward: 45,
  },

  // Categoria: Mente / Foco
  {
    category: "Mind Hack 🧠",
    title: "Detox Digital Absoluto",
    description: "Fique 20 minutos seguidos sem encostar no celular, computador ou televisão.",
    xpReward: 50,
  },
  {
    category: "Mind Hack 🧠",
    title: "Curiosidade Quântica",
    description: "Pesquise e aprenda sobre 1 assunto científico ou histórico fora da sua área.",
    xpReward: 45,
  },
  {
    category: "Mind Hack 🧠",
    title: "Mesa Minimalista",
    description: "Limpe e organize completamente sua mesa de trabalho/estudos antes de começar.",
    xpReward: 40,
  },
  {
    category: "Mind Hack 🧠",
    title: "Monk Morning",
    description: "Passe a primeira hora após acordar sem abrir nenhuma rede social.",
    xpReward: 60,
  },

  // Categoria: Finanças / Riqueza
  {
    category: "Capital Pulse 💎",
    title: "Raio-X de Gastos",
    description: "Abra o aplicativo do banco e anote cada centavo gasto nas últimas 24 horas.",
    xpReward: 50,
  },
  {
    category: "Capital Pulse 💎",
    title: "Caçador de Assinaturas",
    description: "Verifique todas as suas assinaturas mensais e identifique 1 que não usa.",
    xpReward: 50,
  },
  {
    category: "Capital Pulse 💎",
    title: "Educação Financeira Express",
    description: "Leia 1 artigo ou assista a um vídeo sobre Fundos Imobiliários ou Tesouro Direto.",
    xpReward: 45,
  },
  {
    category: "Capital Pulse 💎",
    title: "Pacto de Consumo Consciente",
    description: "Passe o dia de hoje sem realizar nenhuma compra por impulso ou não essencial.",
    xpReward: 55,
  },

  // Categoria: Humor / Conexão Humana
  {
    category: "Sincronia Humana 😄",
    title: "Mensagem Inesperada",
    description: "Envie uma mensagem genuína para um amigo ou familiar que você não fala há semanas.",
    xpReward: 50,
  },
  {
    category: "Sincronia Humana 😄",
    title: "Tríade da Gratidão",
    description: "Escreva em um papel 3 coisas específicas pelas quais você é grato hoje.",
    xpReward: 40,
  },
  {
    category: "Sincronia Humana 😄",
    title: "Presença Total",
    description: "Durante a sua próxima refeição, coma sem olhar para nenhuma tela ou celular.",
    xpReward: 45,
  },
  {
    category: "Sincronia Humana 😄",
    title: "Elogio Real",
    description: "Faça um elogio sincero e específico para alguém do seu convívio hoje.",
    xpReward: 45,
  },
];

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayChallenges = async () => {
  const todayStr = getTodayDateString();
  try {
    const existing = await HabitsService.getDailyChallenges(todayStr);
    if (existing && existing.length > 0) {
      return existing;
    }

    // Gerar 2 desafios baseados na data (seed estável por dia)
    const dayNumber = new Date().getDate() + new Date().getMonth() * 31;
    const index1 = dayNumber % CHALLENGE_POOL.length;
    const index2 = (dayNumber + 7) % CHALLENGE_POOL.length;

    const challenge1 = {
      ...CHALLENGE_POOL[index1],
      challengeDate: todayStr,
      completed: 0,
    };
    const challenge2 = {
      ...CHALLENGE_POOL[index2],
      challengeDate: todayStr,
      completed: 0,
    };

    const id1 = await HabitsService.insertDailyChallenge(challenge1);
    const id2 = await HabitsService.insertDailyChallenge(challenge2);

    return [
      { id: id1, ...challenge1 },
      { id: id2, ...challenge2 },
    ];
  } catch (error) {
    console.error("[DailyChallengeService] Erro ao carregar desafios:", error);
    return [];
  }
};

const completeChallenge = async (challengeId) => {
  try {
    await HabitsService.completeDailyChallenge(challengeId);
    SoundService.playCheck();
    return true;
  } catch (error) {
    console.error("[DailyChallengeService] Erro ao completar desafio:", error);
    return false;
  }
};

export default {
  getTodayChallenges,
  completeChallenge,
  getTodayDateString,
};
