import { Share, Alert, Platform } from "react-native";

export const ACHIEVEMENTS_DATA = [
  {
    id: "first_hack",
    title: "🎯 Primeiro Hack",
    description: "Conclua seu primeiro protocolo no OneBitLife.",
    icon: "🎯",
    tier: "Bronze",
    checkFn: (stats) => (stats.totalChecks || 0) >= 1,
  },
  {
    id: "streak_3",
    title: "⚡ Faísca Neon",
    description: "Mantenha 3 dias de consistência ininterrupta.",
    icon: "⚡",
    tier: "Bronze",
    checkFn: (stats) => (stats.daysLife || 0) >= 3,
  },
  {
    id: "streak_7",
    title: "🔥 Forja de Titânio",
    description: "Alcance uma sequência de 7 dias de disciplina pura.",
    icon: "🔥",
    tier: "Prata",
    checkFn: (stats) => (stats.daysLife || 0) >= 7,
  },
  {
    id: "mind_reader",
    title: "🧠 Cérebro Quântico",
    description: "Complete 10 protocolos no pilar da Mente e Leitura.",
    icon: "🧠",
    tier: "Prata",
    checkFn: (stats) => (stats.mindChecks || 0) >= 10,
  },
  {
    id: "iron_body",
    title: "🦾 Chassi Blindado",
    description: "Complete 10 sessões no pilar do Corpo / Treinos.",
    icon: "🦾",
    tier: "Prata",
    checkFn: (stats) => (stats.bodyChecks || 0) >= 10,
  },
  {
    id: "wealth_builder",
    title: "💎 Magnata do Core",
    description: "Conclua 10 metas no pilar Financeiro e Riqueza.",
    icon: "💎",
    tier: "Prata",
    checkFn: (stats) => (stats.moneyChecks || 0) >= 10,
  },
  {
    id: "zen_master",
    title: "🛡️ Escudo Não Perturbe",
    description: "Finalize 3 sessões completas no Modo Foco / Não Perturbe.",
    icon: "🛡️",
    tier: "Ouro",
    checkFn: (stats) => (stats.zenSessions || 0) >= 3,
  },
  {
    id: "challenge_hunter",
    title: "🎲 Caçador de Side Quests",
    description: "Complete 5 Desafios Diários extras fora da rotina.",
    icon: "🎲",
    tier: "Ouro",
    checkFn: (stats) => (stats.challengesDone || 0) >= 5,
  },
  {
    id: "streak_30",
    title: "👑 Soberano Cyberpunk",
    description: "Atinja 30 dias de evolução constante no OneBitLife.",
    icon: "👑",
    tier: "Cyber Neon",
    checkFn: (stats) => (stats.daysLife || 0) >= 30,
  },
  {
    id: "legend_50",
    title: "🌌 Lenda Cyberpunk",
    description: "Acumule 50 checks lendários e domine o Core.",
    icon: "🌌",
    tier: "Cyber Neon",
    checkFn: (stats) => (stats.totalChecks || 0) >= 50,
  },
];

export const shareAchievement = async (achievement, playerLevel = "Recruta") => {
  try {
    const message = `🏆 Conquista Desbloqueada no OneBitLife!\n\n` +
      `[ ${achievement.icon} ${achievement.title} ] - Categoria: ${achievement.tier}\n` +
      `"${achievement.description}"\n\n` +
      `⚡ Patente: ${playerLevel}\n` +
      `Transforme sua rotina em um RPG de alta performance:\n` +
      `https://github.com/Intern-Yago/OneBitLife`;

    if (Platform.OS === "web") {
      if (navigator.share) {
        await navigator.share({
          title: `🏆 ${achievement.title} - OneBitLife`,
          text: message,
          url: "https://github.com/Intern-Yago/OneBitLife",
        });
      } else {
        await navigator.clipboard.writeText(message);
        Alert.alert("Copiado!", "Texto da conquista copiado para a área de transferência.");
      }
      return;
    }

    await Share.share({
      title: `🏆 Conquista: ${achievement.title}`,
      message,
    });
  } catch (error) {
    console.error("[AchievementsData] Erro ao compartilhar:", error);
  }
};
