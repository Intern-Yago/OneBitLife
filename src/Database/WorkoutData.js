export const WORKOUT_ROUTINES = {
  calistenia: {
    iniciante: {
      id: "calistenia_iniciante",
      title: "Protocolo Calistenia • Fundação",
      level: "Iniciante",
      modality: "Calistenia",
      frequency: "3x por semana (Full Body)",
      restSeconds: 60,
      description: "Construção de força básica articular, controle do peso corporal e resistência neuromuscular.",
      exercises: [
        { name: "Flexão de Braços (ou nos Joelhos)", sets: 3, reps: "8-12 reps", tip: "Mantenha o abdômen contraído e cotovelos a 45 graus." },
        { name: "Agachamento Livre (Air Squat)", sets: 3, reps: "15-20 reps", tip: "Desça com os calcanhares colados no chão até 90 graus." },
        { name: "Remada Invertida (ou Puxada na Mesa/Barra Baixa)", sets: 3, reps: "8-10 reps", tip: "Puxe o peito em direção à barra mantendo o corpo reto." },
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
      title: "Protocolo Calistenia • Nível Ciborgue",
      level: "Avançado",
      modality: "Calistenia",
      frequency: "5x por semana (Push / Pull / Legs)",
      restSeconds: 90,
      description: "Força explosiva, alavancas estáticas e movimentos de alta complexidade motora.",
      exercises: [
        { name: "Muscle-up (ou Transição com Elástico)", sets: 4, reps: "4-6 reps", tip: "Tração explosiva puxando a barra até o esterno antes da transição." },
        { name: "Pistol Squat (Agachamento Unilateral)", sets: 4, reps: "6-8 reps/perna", tip: "Desça com equilíbrio total sem deixar o calcanhar levantar." },
        { name: "Flexão Plantando Bananeira (Handstand Push-up)", sets: 4, reps: "5-8 reps", tip: "Apoiado na parede ou livre, desça a cabeça controladamente." },
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
      title: "Protocolo Musculação • Hipertrofia & Força",
      level: "Intermediário",
      modality: "Academia",
      frequency: "4x por semana (Upper / Lower)",
      restSeconds: 75,
      description: "Sobrecarga progressiva em exercícios compostos, volume calibrado e hipertrofia densa.",
      exercises: [
        { name: "Agachamento Livre com Barra (Barbell Squat)", sets: 4, reps: "8-10 reps", tip: "Inspire na descida, quebre o paralelo e suba empurrando o chão." },
        { name: "Supino Reto com Barra", sets: 4, reps: "8-10 reps", tip: "Pés firmes no chão, aduza as escápulas e toque o meio do peito." },
        { name: "Remada Curvada com Barra (Barbell Row)", sets: 4, reps: "8-10 reps", tip: "Coluna travada a 45 graus, puxe a barra no umbigo." },
        { name: "Desenvolvimento de Ombros com Halteres (Shoulder Press)", sets: 3, reps: "10-12 reps", tip: "Evite hiperestender a lombar durante o impulso." },
        { name: "Stiff com Halteres ou Barra", sets: 3, reps: "10-12 reps", tip: "Sinta o posterior de coxa esticar sem arredondar as costas." },
      ],
    },
    avancado: {
      id: "academia_avancado",
      title: "Protocolo Musculação • Força Cyberpunk",
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

export const getWorkoutRoutine = (modality = "calistenia", level = "iniciante") => {
  const modKey = modality.toLowerCase().includes("aca") ? "academia" : "calistenia";
  const lvlKey = level.toLowerCase().includes("avan")
    ? "avancado"
    : level.toLowerCase().includes("inter")
    ? "intermediario"
    : "iniciante";

  return WORKOUT_ROUTINES[modKey][lvlKey] || WORKOUT_ROUTINES.calistenia.iniciante;
};
