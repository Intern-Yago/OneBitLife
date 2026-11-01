// Testes Oficiais da Bateria de Calistenia (13 Avaliações Biomecânicas)
export const CALISTHENICS_ASSESSMENT_ITEMS = [
  { id: "pull_up", name: "Barra fixa pronada (Pull-up)", unit: "reps", type: "number", defaultVal: "7", desc: "Tração vertical pronada estrita com amplitude total." },
  { id: "dead_hang", name: "Suspensão na barra (Dead Hang)", unit: "seg", type: "number", defaultVal: "30", desc: "Força de pegada e descompressão espinhal isométrica.", note: "Interrompa se houver desconforto nos dedos ou apoio improvisado." },
  { id: "push_up", name: "Flexão tradicional (Push-up)", unit: "reps", type: "number", defaultVal: "24", desc: "Empurrar horizontal estrito sem arqueamento da lombar." },
  { id: "hollow_body", name: "Hollow Body Hold (Canoa)", unit: "seg", type: "number", defaultVal: "40", desc: "Sustentação isométrica do core com lombar colada no solo." },
  { id: "v_hold", name: "Sustentação em V (V-hold)", unit: "seg", type: "number", defaultVal: "60", desc: "Resistência de flexores do quadril e reto abdominal." },
  { id: "squat", name: "Agachamento livre (Air Squat)", unit: "reps", type: "number", defaultVal: "50", desc: "Força e resistência de membros inferiores até o paralelo." },
  { id: "lunge", name: "Afundo alternado (Lunge)", unit: "reps/perna", type: "number", defaultVal: "15", desc: "Força unilateral e controle dinâmico de passada." },
  { id: "pistol_squat", name: "Pistol Squat (Unilateral)", unit: "status", type: "choice", defaultVal: "Parcial", options: ["Não realiza", "Parcial", "Completo"], desc: "Força unilateral máxima e equilíbrio de membros inferiores." },
  { id: "calf_raise", name: "Elevação unilateral de panturrilha", unit: "reps/perna", type: "number", defaultVal: "20", desc: "Resistência do tríceps sural e estabilidade do tornozelo." },
  { id: "shoulder_mobility", name: "Mobilidade dos ombros", unit: "grau", type: "choice", defaultVal: "Boa", options: ["Limitada", "Regular", "Boa"], desc: "Amplitude articular escapular e torácica." },
  { id: "wrist_mobility", name: "Mobilidade dos punhos", unit: "grau", type: "choice", defaultVal: "Boa", options: ["Limitada", "Regular", "Boa"], desc: "Flexão e extensão segura de punhos para apoio e tração." },
  { id: "ankle_mobility", name: "Mobilidade de tornozelos (Knee-to-Wall)", unit: "grau", type: "choice", defaultVal: "Boa", options: ["Limitada (colado)", "Regular (1/2 polegar)", "Boa (1 polegar+)"], desc: "Dorsiflexão essencial para profundidade de agachamentos." },
  { id: "unilateral_balance", name: "Equilíbrio unilateral", unit: "seg/perna", type: "number", defaultVal: "30", desc: "Estabilidade proprioceptiva com olhos abertos." },
];

// Testes Oficiais da Bateria de Musculação / Academia (12 Força Submáxima + Complementares)
export const GYM_ASSESSMENT_ITEMS = [
  { id: "bench_press", name: "Supino reto com barra", desc: "Força de empurrar horizontal (peitoral, tríceps e deltoide anterior)." },
  { id: "lat_pulldown", name: "Puxada frontal (Lat Pulldown)", desc: "Força de tração vertical e controle da musculatura das costas." },
  { id: "barbell_squat", name: "Agachamento livre com barra", desc: "Força e profundidade dos membros inferiores e cadeia extensora." },
  { id: "deadlift", name: "Levantamento terra (Deadlift)", desc: "Força da cadeia posterior, quadril, costas e pegada." },
  { id: "overhead_press", name: "Desenvolvimento de ombros", desc: "Força de empurrar vertical e estabilidade escapular." },
  { id: "seated_row", name: "Remada baixa / curvada", desc: "Força de tração horizontal e controle escapular." },
  { id: "leg_press", name: "Leg Press 45°", desc: "Força e resistência de sobrecarga de quadríceps e glúteos." },
  { id: "biceps_curl", name: "Rosca direta", desc: "Força e resistência dos flexores de cotovelo." },
  { id: "triceps_pulley", name: "Tríceps na polia", desc: "Força e resistência dos extensores de cotovelo." },
  { id: "plank", name: "Prancha abdominal isométrica", desc: "Resistência e estabilidade do Core sob postura neutra.", isSeconds: true },
  { id: "hip_thrust", name: "Elevação pélvica (Hip Thrust)", desc: "Força de extensão do quadril e ativação máxima de glúteos." },
  { id: "standing_calf", name: "Panturrilha em pé", desc: "Força e resistência mecânica da panturrilha com carga." },
];

// Avaliações complementares de academia
export const GYM_COMPLEMENTARY_ITEMS = [
  { id: "gym_shoulder_mob", name: "Mobilidade de ombros", measure: "Amplitude articular", options: ["Limitada", "Regular", "Boa"] },
  { id: "gym_ankle_mob", name: "Mobilidade de tornozelos", measure: "Dorsiflexão e apoio", options: ["Limitada", "Regular", "Boa"] },
  { id: "gym_hip_mob", name: "Mobilidade de quadril", measure: "Amplitude e controle", options: ["Limitada", "Regular", "Boa"] },
  { id: "gym_balance", name: "Equilíbrio unilateral", measure: "Estabilidade proprioceptiva", options: ["Instável", "Regular", "Excelente"] },
  { id: "gym_hamstrings", name: "Flexibilidade posterior", measure: "Posteriores de coxa", options: ["Encurtado", "Regular", "Flexível"] },
  { id: "gym_cardio", name: "Teste cardiovascular", measure: "Resistência aeróbica", options: ["Sedentário", "Moderado", "Excelente"] },
];

// Algoritmo de Estimativa de 1RM Seguro (Fórmula Submáxima de Brzycki)
// 1RM = Carga / (1.0278 - (0.0278 * Reps)) ou Carga * (1 + Reps / 30)
export function estimate1RM(weightKg, reps) {
  const w = Number(weightKg) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;
  return Math.round(w * (1 + r / 30));
}

// Diagnóstico da Bateria de Calistenia
export function evaluateCalisthenicsAssessment(results) {
  const pullUps = Number(results.pull_up) || 0;
  const pushUps = Number(results.push_up) || 0;
  const deadHang = Number(results.dead_hang) || 0;
  const squat = Number(results.squat) || 0;
  const vHold = Number(results.v_hold) || 0;
  const pistol = results.pistol_squat || "Não realiza";

  let score = 0;
  score += pullUps * 4;
  score += pushUps * 1.5;
  score += (deadHang / 10) * 3;
  score += squat * 0.8;
  score += (vHold / 10) * 2;
  if (pistol === "Completo") score += 25;
  else if (pistol === "Parcial") score += 12;

  let rank = "Iniciante (Adaptação Articular)";
  let split = "Full Body (3x/semana)";
  let levelKey = "iniciante";
  let restSeconds = 60;

  if (score >= 120 && pullUps >= 10 && pushUps >= 30) {
    rank = "Avançado (Nível Titã)";
    split = "Push / Pull / Legs (5x/semana)";
    levelKey = "avancado";
    restSeconds = 90;
  } else if (score >= 60 && pullUps >= 5 && pushUps >= 15) {
    rank = "Intermediário (Domínio Corporal)";
    split = "Upper / Lower (4x/semana)";
    levelKey = "intermediario";
    restSeconds = 75;
  }

  const diagnosis = [
    `Pontuação Biomecânica: ${Math.round(score)} pontos`,
    `Patente Calistênica: ${rank}`,
    `Divisão Recomendada: ${split}`,
    deadHang >= 30
      ? "Pegada e descompressão eficientes (evite apoios com quinas agressivas)."
      : "Atenção ao desenvolvimento da sustentação isométrica e força palmar.",
    results.ankle_mobility && results.ankle_mobility.includes("Limitada")
      ? "Alerta: Mobilidade de tornozelo limitada. Inclua aquecimentos Knee-to-Wall antes dos agachamentos."
      : "Mobilidade e alinhamento articular aptos para progressões de volume.",
  ];

  return { score: Math.round(score), rank, split, levelKey, restSeconds, diagnosis };
}

// Diagnóstico da Bateria de Academia (Considerando Peso Corporal e Cargas Submáximas)
export function evaluateGymAssessment(bodyweightKg, exercises, complementaries) {
  const bw = Number(bodyweightKg) || 75;

  const bench1RM = estimate1RM(exercises.bench_press_weight, exercises.bench_press_reps);
  const squat1RM = estimate1RM(exercises.barbell_squat_weight, exercises.barbell_squat_reps);
  const deadlift1RM = estimate1RM(exercises.deadlift_weight, exercises.deadlift_reps);
  const lat1RM = estimate1RM(exercises.lat_pulldown_weight, exercises.lat_pulldown_reps);

  // Relação de Força Relativa (1RM / Peso Corporal)
  const benchRatio = bw > 0 ? (bench1RM / bw).toFixed(2) : 0;
  const squatRatio = bw > 0 ? (squat1RM / bw).toFixed(2) : 0;
  const deadliftRatio = bw > 0 ? (deadlift1RM / bw).toFixed(2) : 0;

  let gymScore = (bench1RM * 1.0) + (squat1RM * 0.9) + (deadlift1RM * 0.8) + (lat1RM * 0.7);

  let rank = "Iniciante (Construção de Base Neuromuscular)";
  let split = "Full Body / ABC (3x a 4x/semana)";
  let levelKey = "iniciante";
  let restSeconds = 60;

  if (benchRatio >= 1.2 && squatRatio >= 1.6 && deadliftRatio >= 1.9) {
    rank = "Avançado (Sobrecarga de Alta Densidade)";
    split = "Push / Pull / Legs (5x a 6x/semana)";
    levelKey = "avancado";
    restSeconds = 90;
  } else if (benchRatio >= 0.75 || squatRatio >= 1.0 || deadliftRatio >= 1.2) {
    rank = "Intermediário (Sobrecarga Progressiva)";
    split = "Upper / Lower (4x/semana)";
    levelKey = "intermediario";
    restSeconds = 75;
  }

  const diagnosis = [
    `Peso Corporal Base: ${bw} kg`,
    `Supino Reto Est. 1RM: ${bench1RM} kg (${benchRatio}x peso corporal)`,
    `Agachamento Livre Est. 1RM: ${squat1RM} kg (${squatRatio}x peso corporal)`,
    `Levantamento Terra Est. 1RM: ${deadlift1RM} kg (${deadliftRatio}x peso corporal)`,
    `Classificação Geral: ${rank}`,
    `Estrutura de Treino Ideal: ${split}`,
  ];

  return {
    score: Math.round(gymScore),
    rank,
    split,
    levelKey,
    restSeconds,
    benchRatio,
    squatRatio,
    deadliftRatio,
    diagnosis,
  };
}

export const WORKOUT_ROUTINES = {
  calistenia: {
    iniciante: {
      id: "calistenia_iniciante",
      title: "Protocolo Calistenia • Fundação & Mobilidade",
      level: "Iniciante",
      modality: "Calistenia",
      frequency: "3x por semana (Full Body)",
      restSeconds: 60,
      description: "Construção de força básica articular, controle do peso corporal e resistência neuromuscular.",
      exercises: [
        { name: "Flexão de Braços (ou nos Joelhos)", sets: 3, reps: "8-12 reps", tip: "Mantenha o abdômen contraído e cotovelos a 45 graus." },
        { name: "Agachamento Livre (Air Squat)", sets: 3, reps: "15-20 reps", tip: "Desça com os calcanhares colados no chão até 90 graus." },
        { name: "Remada Invertida (Barra Baixa)", sets: 3, reps: "8-10 reps", tip: "Puxe o peito em direção à barra mantendo o corpo reto." },
        { name: "Prancha Abdominal Isométrica", sets: 3, reps: "30-45 seg", tip: "Mantenha glúteos e abdômen ativos sem arquear a lombar." },
        { name: "Elevação Pélvica (Ponte de Glúteo)", sets: 3, reps: "15 reps", tip: "Aperte o glúteo no topo do movimento por 2 segundos." },
      ],
    },
    intermediario: {
      id: "calistenia_intermediario",
      title: "Protocolo Calistenia • Domínio Gravitacional",
      level: "Intermediário",
      modality: "Calistenia",
      frequency: "4x por semana (Upper / Lower)",
      restSeconds: 75,
      description: "Avanço em tração vertical, empurrar com profundidade e estabilidade do Core avançado.",
      exercises: [
        { name: "Barra Fixa Pronada (Pull-up)", sets: 4, reps: "6-10 reps", tip: "Amplitude completa: estenda tudo embaixo e passe o queixo da barra." },
        { name: "Mergulho em Paralelas (Dips)", sets: 4, reps: "8-12 reps", tip: "Incline levemente o tronco à frente para focar no peitoral e tríceps." },
        { name: "Flexão Diamante (Diamond Push-up)", sets: 3, reps: "10-15 reps", tip: "Mãos juntas sob o centro do peitoral, cotovelos próximos." },
        { name: "Agachamento Búlgaro (Bulgarian Split Squat)", sets: 3, reps: "10-12 reps/perna", tip: "Pé de trás apoiado em cadeira ou banco, desça com tronco firme." },
        { name: "Hollow Body Hold (Canoa Abdominal)", sets: 3, reps: "45 seg", tip: "Pressione a lombar 100% colada no chão com pernas e braços estendidos." },
      ],
    },
    avancado: {
      id: "calistenia_avancado",
      title: "Protocolo Calistenia • Nível Titã Cyber",
      level: "Avançado",
      modality: "Calistenia",
      frequency: "5x por semana (Push / Pull / Legs)",
      restSeconds: 90,
      description: "Força explosiva, alavancas estáticas e movimentos de alta complexidade motora.",
      exercises: [
        { name: "Muscle-up (ou Transição Controlada)", sets: 4, reps: "4-6 reps", tip: "Tração explosiva puxando a barra até o esterno antes da transição." },
        { name: "Pistol Squat (Agachamento Unilateral)", sets: 4, reps: "6-8 reps/perna", tip: "Desça com equilíbrio total sem deixar o calcanhar levantar." },
        { name: "Handstand Push-up (ou Pike Push-up)", sets: 4, reps: "5-8 reps", tip: "Apoiado na parede ou livre, desça a cabeça controladamente." },
        { name: "Barra Fixa com Pegada Supinada (Chin-up)", sets: 4, reps: "10-12 reps", tip: "Foco na contração máxima de dorsais e bíceps." },
        { name: "Dragon Flag ou Toes to Bar", sets: 3, reps: "8-10 reps", tip: "Movimento controlado pelo Core sem embalo pendular." },
      ],
    },
  },
  academia: {
    iniciante: {
      id: "academia_iniciante",
      title: "Protocolo Musculação • Adaptação do Core",
      level: "Iniciante",
      modality: "Academia",
      frequency: "3x por semana (Full Body / ABC)",
      restSeconds: 60,
      description: "Familiarização com máquinas e pesos livres, alinhamento postural e hipertrofia inicial.",
      exercises: [
        { name: "Leg Press 45º", sets: 3, reps: "12-15 reps", tip: "Mantenha a lombar bem apoiada no encosto sem arredondar." },
        { name: "Puxada Frontal no Pulley (Lat Pulldown)", sets: 3, reps: "10-12 reps", tip: "Puxe a barra em direção ao peito com as escápulas fechadas." },
        { name: "Supino Reto com Halteres", sets: 3, reps: "10-12 reps", tip: "Controle a descida em 2 segundos e empurre com estabilidade." },
        { name: "Elevação Lateral com Halteres", sets: 3, reps: "12-15 reps", tip: "Cotovelos levemente flexionados, eleve até a linha do ombro." },
        { name: "Prancha Abdominal", sets: 3, reps: "30-45 seg", tip: "Mantenha o corpo em linha reta e respiração constante." },
      ],
    },
    intermediario: {
      id: "academia_intermediario",
      title: "Protocolo Musculação • Hipertrofia & Força Submáxima",
      level: "Intermediário",
      modality: "Academia",
      frequency: "4x por semana (Upper / Lower)",
      restSeconds: 75,
      description: "Sobrecarga progressiva em exercícios compostos, volume calibrado e hipertrofia densa.",
      exercises: [
        { name: "Agachamento Livre com Barra (Barbell Squat)", sets: 4, reps: "8-10 reps", tip: "Inspire na descida, quebre o paralelo e suba empurrando o chão." },
        { name: "Supino Reto com Barra", sets: 4, reps: "8-10 reps", tip: "Pés firmes no chão, aduza as escápulas e toque o meio do peito." },
        { name: "Remada Baixa / Curvada (Barbell Row)", sets: 4, reps: "8-10 reps", tip: "Coluna travada a 45 graus, puxe a barra no umbigo." },
        { name: "Desenvolvimento de Ombros (Shoulder Press)", sets: 3, reps: "10-12 reps", tip: "Evite hiperestender a lombar durante o impulso." },
        { name: "Stiff com Halteres ou Barra", sets: 3, reps: "10-12 reps", tip: "Sinta o posterior de coxa esticar sem arredondar as costas." },
      ],
    },
    avancado: {
      id: "academia_avancado",
      title: "Protocolo Musculação • Força & Sobrecarga Cyberpunk",
      level: "Avançado",
      modality: "Academia",
      frequency: "5x ou 6x por semana (Push / Pull / Legs)",
      restSeconds: 90,
      description: "Treinamento de alta intensidade, técnicas de falha mecânica e densidade muscular máxima.",
      exercises: [
        { name: "Levantamento Terra (Deadlift)", sets: 4, reps: "5-6 reps", tip: "Dorsais travados, barra colada na tíbia e impulso com as pernas." },
        { name: "Supino Inclinado com Halteres Pesados", sets: 4, reps: "6-8 reps", tip: "Banco inclinado em 30 graus para foco no peitoral superior." },
        { name: "Barra Fixa com Carga Extra (Weighted Pull-up)", sets: 4, reps: "6-8 reps", tip: "Prenda halteres ou anilha no cinto para sobrecarga real." },
        { name: "Agachamento Hack ou Búlgaro Pesado", sets: 4, reps: "8-10 reps", tip: "Descida cadenciada em 3 segundos até o ponto máximo." },
        { name: "Elevação Pélvica com Barra (Hip Thrust)", sets: 4, reps: "8-10 reps", tip: "Trave 2 segundos na contração máxima de pico de glúteo." },
      ],
    },
  },
};
