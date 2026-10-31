import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CALISTHENICS_ASSESSMENT_ITEMS,
  GYM_ASSESSMENT_ITEMS,
  GYM_COMPLEMENTARY_ITEMS,
  WORKOUT_ROUTINES,
  evaluateCalisthenicsAssessment,
  evaluateGymAssessment,
} from "../../Database/WorkoutData";
import HabitsService from "../../services/HabitsService";
import SoundService from "../../services/SoundService";
import CyberModal from "../Common/CyberModal";

export default function WorkoutTab({ onAddHabit }) {
  const [activeScreen, setActiveScreen] = useState("routine"); // 'routine' | 'assessment'
  const [modality, setModality] = useState("calistenia"); // 'calistenia' | 'academia'
  const [selectedLevel, setSelectedLevel] = useState("intermediario"); // 'iniciante' | 'intermediario' | 'avancado'
  const [completedExercises, setCompletedExercises] = useState({});
  const [restSeconds, setRestSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Estados da Avaliação de Calistenia
  const [calisResults, setCalisResults] = useState({
    pull_up: "7",
    dead_hang: "30",
    push_up: "24",
    hollow_body: "40",
    v_hold: "60",
    squat: "50",
    lunge: "15",
    pistol_squat: "Parcial",
    calf_raise: "20",
    shoulder_mobility: "Boa",
    wrist_mobility: "Boa",
    ankle_mobility: "Boa (1 polegar+)",
    unilateral_balance: "30",
  });

  // Estados da Avaliação de Academia
  const [bodyweight, setBodyweight] = useState("75");
  const [gymExercises, setGymExercises] = useState({
    bench_press_weight: "60",
    bench_press_reps: "8",
    lat_pulldown_weight: "65",
    lat_pulldown_reps: "10",
    barbell_squat_weight: "80",
    barbell_squat_reps: "8",
    deadlift_weight: "100",
    deadlift_reps: "6",
    overhead_press_weight: "40",
    overhead_press_reps: "8",
    seated_row_weight: "60",
    seated_row_reps: "10",
    leg_press_weight: "180",
    leg_press_reps: "12",
    biceps_curl_weight: "26",
    biceps_curl_reps: "10",
    triceps_pulley_weight: "35",
    triceps_pulley_reps: "12",
    plank_seconds: "60",
    hip_thrust_weight: "90",
    hip_thrust_reps: "10",
    standing_calf_weight: "50",
    standing_calf_reps: "15",
  });

  const [assessmentDiagnosis, setAssessmentDiagnosis] = useState(null);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "ENTENDIDO",
    onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
  });

  // Carrega última avaliação salva no SQLite
  useEffect(() => {
    async function loadSavedAssessment() {
      try {
        const saved = await HabitsService.getLatestWorkoutAssessment(modality);
        if (saved && saved.parsedData) {
          if (modality === "calistenia" && saved.parsedData.results) {
            setCalisResults(saved.parsedData.results);
          } else if (modality === "academia" && saved.parsedData.exercises) {
            setGymExercises(saved.parsedData.exercises);
            if (saved.parsedData.bodyweight) setBodyweight(saved.parsedData.bodyweight);
          }
        }
      } catch (err) {
        console.warn("Erro ao buscar avaliação prévia:", err);
      }
    }
    loadSavedAssessment();
  }, [modality]);

  // Timer de Descanso entre séries
  useEffect(() => {
    let interval = null;
    if (timerActive && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            SoundService.playTimerFinish();
            return 0;
          }
          if (prev <= 4) {
            SoundService.playBeep();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, restSeconds]);

  const startRestTimer = (seconds) => {
    SoundService.playClick();
    setRestSeconds(seconds);
    setTimerActive(true);
  };

  const currentRoutine =
    WORKOUT_ROUTINES[modality]?.[selectedLevel] ||
    WORKOUT_ROUTINES.calistenia.intermediario;

  const toggleExerciseCheck = (index) => {
    SoundService.playClick();
    setCompletedExercises((prev) => {
      const next = { ...prev, [index]: !prev[index] };
      if (next[index]) {
        SoundService.playCheck();
      }
      return next;
    });
  };

  const handleRunAssessment = async () => {
    SoundService.playClick();
    let diag = null;
    if (modality === "calistenia") {
      diag = evaluateCalisthenicsAssessment(calisResults);
      await HabitsService.saveWorkoutAssessment("calistenia", diag.score, diag.rank, {
        results: calisResults,
      });
    } else {
      diag = evaluateGymAssessment(bodyweight, gymExercises, {});
      await HabitsService.saveWorkoutAssessment("academia", diag.score, diag.rank, {
        bodyweight,
        exercises: gymExercises,
      });
    }

    setAssessmentDiagnosis(diag);
    setSelectedLevel(diag.levelKey);
    SoundService.playLevelUp();

    setModalConfig({
      visible: true,
      title: "DIAGNÓSTICO BIOMECÂNICO CONCLUÍDO",
      message: `Sua classificação: ${diag.rank}.\nO sistema calibrou automaticamente sua divisão para: ${diag.split}.`,
      type: "success",
      confirmText: "VER TREINO PERSONALIZADO",
      onConfirm: () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
        setActiveScreen("routine");
      },
    });
  };

  const handleForgeRoutineToHabit = () => {
    SoundService.playClick();
    if (onAddHabit) {
      onAddHabit({
        habitName: `Treino: ${currentRoutine.title}`,
        habitArea: "Corpo",
        habitFrequency: "Diário",
        habitType: "timer",
        targetValue: 40,
        unit: "min",
        difficulty: selectedLevel === "avancado" ? "Rank S" : selectedLevel === "intermediario" ? "Rank A" : "Rank B",
        icon: "⚡",
      });
      SoundService.playCheck();

      setModalConfig({
        visible: true,
        title: "TREINO FORJADO COMO META",
        message: `A rotina "${currentRoutine.title}" foi adicionada ao seu Core de Metas diárias!`,
        type: "success",
        confirmText: "CONTINUAR",
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTag}>
          <Text style={styles.headerTagText}>[BIOMECHANICAL ENGINE]</Text>
        </View>
        <Text style={styles.title}>Assistente de Treino & Força</Text>
        <Text style={styles.subtitle}>
          Protocolos calculados por baterias de testes reais para Calistenia e Musculação.
        </Text>
      </View>

      {/* Navegação entre Visualização de Rotina vs Bateria de Avaliação */}
      <View style={styles.screenSwitcher}>
        <TouchableOpacity
          style={[styles.screenTab, activeScreen === "routine" && styles.screenTabActive]}
          onPress={() => {
            SoundService.playClick();
            setActiveScreen("routine");
          }}
        >
          <Text
            style={[
              styles.screenTabText,
              activeScreen === "routine" && styles.screenTabTextActive,
            ]}
          >
            Treino do Dia
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.screenTab, activeScreen === "assessment" && styles.screenTabActive]}
          onPress={() => {
            SoundService.playClick();
            setActiveScreen("assessment");
          }}
        >
          <Text
            style={[
              styles.screenTabText,
              activeScreen === "assessment" && styles.screenTabTextActive,
            ]}
          >
            Bateria de Avaliação
          </Text>
        </TouchableOpacity>
      </View>

      {/* Switcher de Modalidade: Calistenia vs Academia */}
      <View style={styles.modalityRow}>
        <TouchableOpacity
          style={[
            styles.modalityBtn,
            modality === "calistenia" && styles.modalityBtnActive,
          ]}
          onPress={() => {
            SoundService.playClick();
            setModality("calistenia");
          }}
        >
          <Text
            style={[
              styles.modalityBtnText,
              modality === "calistenia" && styles.modalityBtnTextActive,
            ]}
          >
            CALISTENIA (Controle Corporal)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modalityBtn,
            modality === "academia" && styles.modalityBtnActive,
          ]}
          onPress={() => {
            SoundService.playClick();
            setModality("academia");
          }}
        >
          <Text
            style={[
              styles.modalityBtnText,
              modality === "academia" && styles.modalityBtnTextActive,
            ]}
          >
            ACADEMIA (Sobrecarga Externa)
          </Text>
        </TouchableOpacity>
      </View>

      {activeScreen === "routine" ? (
        /* VISÃO: ROTINA DO DIA */
        <>
          {/* Nível do Treino */}
          <View style={styles.levelRow}>
            {["iniciante", "intermediario", "avancado"].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.levelPill,
                  selectedLevel === lvl && styles.levelPillActive,
                ]}
                onPress={() => {
                  SoundService.playClick();
                  setSelectedLevel(lvl);
                }}
              >
                <Text
                  style={[
                    styles.levelText,
                    selectedLevel === lvl && styles.levelTextActive,
                  ]}
                >
                  {lvl.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Banner do Protocolo */}
          <View style={styles.protocolCard}>
            <View style={styles.protocolHeader}>
              <Text style={styles.protocolTitle}>{currentRoutine.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{currentRoutine.frequency}</Text>
              </View>
            </View>
            <Text style={styles.protocolDesc}>{currentRoutine.description}</Text>
          </View>

          {/* Timer de Descanso */}
          <View style={styles.timerCard}>
            <View style={styles.timerHeader}>
              <Text style={styles.timerTitle}>Cronômetro de Recuperação Articular</Text>
              <Text style={styles.timerDisplay}>
                {String(Math.floor(restSeconds / 60)).padStart(2, "0")}:
                {String(restSeconds % 60).padStart(2, "0")}
              </Text>
            </View>

            <View style={styles.timerButtons}>
              <TouchableOpacity
                style={styles.timerBtn}
                onPress={() => startRestTimer(60)}
              >
                <Text style={styles.timerBtnText}>60s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timerBtn}
                onPress={() => startRestTimer(75)}
              >
                <Text style={styles.timerBtnText}>75s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timerBtn}
                onPress={() => startRestTimer(90)}
              >
                <Text style={styles.timerBtnText}>90s</Text>
              </TouchableOpacity>
              {timerActive && (
                <TouchableOpacity
                  style={styles.timerCancelBtn}
                  onPress={() => {
                    SoundService.playClick();
                    setTimerActive(false);
                    setRestSeconds(0);
                  }}
                >
                  <Text style={styles.timerCancelText}>Zerar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Checklist de Exercícios */}
          <View style={styles.exercisesList}>
            <Text style={styles.sectionTitle}>Séries & Execução do Dia:</Text>
            {currentRoutine.exercises.map((ex, index) => {
              const isDone = !!completedExercises[index];
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.exerciseCard, isDone && styles.exerciseCardDone]}
                  onPress={() => toggleExerciseCheck(index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.exerciseHeader}>
                    <Text
                      style={[
                        styles.exerciseName,
                        isDone && styles.exerciseNameDone,
                      ]}
                    >
                      {ex.name}
                    </Text>
                    <View
                      style={[
                        styles.checkbox,
                        isDone && styles.checkboxDone,
                      ]}
                    >
                      <Text style={styles.checkboxText}>{isDone ? "✓" : ""}</Text>
                    </View>
                  </View>

                  <Text style={styles.exerciseMeta}>
                    {ex.sets} séries × {ex.reps}
                  </Text>
                  <Text style={styles.exerciseTip}>{ex.tip}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botões de Ação */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.forgeHabitBtn}
              onPress={handleForgeRoutineToHabit}
            >
              <Text style={styles.forgeHabitText}>
                + Forjar Este Treino no Meu Core Diário
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reassessBtn}
              onPress={() => setActiveScreen("assessment")}
            >
              <Text style={styles.reassessText}>
                Fazer Bateria de Avaliação Completa ↗
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        /* VISÃO: BATERIA DE AVALIAÇÃO FÍSICA */
        <View style={styles.assessmentContainer}>
          <View style={styles.assessmentIntroCard}>
            <Text style={styles.assessmentIntroTitle}>
              {modality === "calistenia"
                ? "Bateria de 13 Avaliações — Calistenia"
                : "Bateria de Força Submáxima — Academia"}
            </Text>
            <Text style={styles.assessmentIntroDesc}>
              {modality === "calistenia"
                ? "Insira o número exato de repetições e tempos isométricos. O sistema calcula seu índice gravitacional e ajusta o volume."
                : "Considere peso corporal e cargas submáximas reais. Não force 1RM perigoso; o sistema utiliza equações biométricas de estimativa segura."}
            </Text>
          </View>

          {modality === "calistenia" ? (
            /* FORMULÁRIO DE 13 AVALIAÇÕES CALISTENIA */
            <View style={styles.testItemsGrid}>
              {CALISTHENICS_ASSESSMENT_ITEMS.map((item) => (
                <View key={item.id} style={styles.testCard}>
                  <View style={styles.testHeaderRow}>
                    <Text style={styles.testName}>{item.name}</Text>
                    <Text style={styles.testUnit}>[{item.unit}]</Text>
                  </View>
                  <Text style={styles.testDesc}>{item.desc}</Text>
                  {item.note && (
                    <Text style={styles.testNote}>{item.note}</Text>
                  )}

                  {item.type === "choice" ? (
                    <View style={styles.choiceRow}>
                      {item.options.map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          style={[
                            styles.choiceBtn,
                            calisResults[item.id] === opt && styles.choiceBtnActive,
                          ]}
                          onPress={() => {
                            SoundService.playClick();
                            setCalisResults((prev) => ({ ...prev, [item.id]: opt }));
                          }}
                        >
                          <Text
                            style={[
                              styles.choiceBtnText,
                              calisResults[item.id] === opt && styles.choiceBtnTextActive,
                            ]}
                          >
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.inputStepperRow}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => {
                          SoundService.playClick();
                          const val = Math.max(0, (Number(calisResults[item.id]) || 0) - 1);
                          setCalisResults((prev) => ({ ...prev, [item.id]: String(val) }));
                        }}
                      >
                        <Text style={styles.stepperText}>-</Text>
                      </TouchableOpacity>

                      <TextInput
                        style={styles.stepperInput}
                        keyboardType="numeric"
                        value={String(calisResults[item.id] || "0")}
                        onChangeText={(txt) => {
                          const sanitized = txt.replace(/[^0-9]/g, "");
                          setCalisResults((prev) => ({ ...prev, [item.id]: sanitized }));
                        }}
                      />

                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => {
                          SoundService.playClick();
                          const val = (Number(calisResults[item.id]) || 0) + 1;
                          setCalisResults((prev) => ({ ...prev, [item.id]: String(val) }));
                        }}
                      >
                        <Text style={styles.stepperText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            /* FORMULÁRIO DE ACADEMIA */
            <View style={styles.testItemsGrid}>
              {/* Peso Corporal */}
              <View style={[styles.testCard, { borderColor: "#00F0FF" }]}>
                <Text style={styles.testName}>Peso Corporal do Atleta (kg)</Text>
                <Text style={styles.testDesc}>
                  Indispensável para cálculo da relação de força relativa (1RM / Peso).
                </Text>
                <TextInput
                  style={styles.bodyweightInput}
                  keyboardType="numeric"
                  value={bodyweight}
                  onChangeText={(txt) => setBodyweight(txt.replace(/[^0-9.]/g, ""))}
                  placeholder="Ex: 75"
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* 12 Exercícios de Força Submáxima */}
              {GYM_ASSESSMENT_ITEMS.map((item) => {
                const weightKey = `${item.id}_weight`;
                const repsKey = `${item.id}_reps`;
                return (
                  <View key={item.id} style={styles.testCard}>
                    <Text style={styles.testName}>{item.name}</Text>
                    <Text style={styles.testDesc}>{item.desc}</Text>

                    {item.isSeconds ? (
                      <View style={styles.gymInputRow}>
                        <Text style={styles.inputLabel}>Segundos com postura correta:</Text>
                        <TextInput
                          style={styles.gymInput}
                          keyboardType="numeric"
                          value={gymExercises.plank_seconds || "60"}
                          onChangeText={(txt) =>
                            setGymExercises((prev) => ({
                              ...prev,
                              plank_seconds: txt.replace(/[^0-9]/g, ""),
                            }))
                          }
                        />
                      </View>
                    ) : (
                      <View style={styles.gymDualInputRow}>
                        <View style={styles.gymInputHalf}>
                          <Text style={styles.inputLabel}>Carga (kg):</Text>
                          <TextInput
                            style={styles.gymInput}
                            keyboardType="numeric"
                            value={String(gymExercises[weightKey] || "0")}
                            onChangeText={(txt) =>
                              setGymExercises((prev) => ({
                                ...prev,
                                [weightKey]: txt.replace(/[^0-9.]/g, ""),
                              }))
                            }
                          />
                        </View>

                        <Text style={styles.multiplierX}>×</Text>

                        <View style={styles.gymInputHalf}>
                          <Text style={styles.inputLabel}>Repetições:</Text>
                          <TextInput
                            style={styles.gymInput}
                            keyboardType="numeric"
                            value={String(gymExercises[repsKey] || "0")}
                            onChangeText={(txt) =>
                              setGymExercises((prev) => ({
                                ...prev,
                                [repsKey]: txt.replace(/[^0-9]/g, ""),
                              }))
                            }
                          />
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Botão de Enviar Avaliação */}
          <TouchableOpacity
            style={styles.submitAssessmentBtn}
            onPress={handleRunAssessment}
          >
            <Text style={styles.submitAssessmentText}>
              Calcular Diagnóstico & Calibrar Treino
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cyber Modal */}
      <CyberModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#080C14",
  },
  header: {
    marginBottom: 14,
  },
  headerTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "rgba(255, 51, 102, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 51, 102, 0.3)",
    marginBottom: 6,
  },
  headerTagText: {
    fontSize: 10,
    color: "#FF3366",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    color: "#94A3B8",
    lineHeight: 18,
  },
  screenSwitcher: {
    flexDirection: "row",
    backgroundColor: "#0D131F",
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  screenTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 8,
  },
  screenTabActive: {
    backgroundColor: "rgba(0, 240, 255, 0.15)",
    borderWidth: 1,
    borderColor: "#00F0FF",
  },
  screenTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  screenTabTextActive: {
    color: "#00F0FF",
    fontWeight: "800",
  },
  modalityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  modalityBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#0D131F",
    alignItems: "center",
  },
  modalityBtnActive: {
    borderColor: "#FF3366",
    backgroundColor: "rgba(255, 51, 102, 0.12)",
  },
  modalityBtnText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
  },
  modalityBtnTextActive: {
    color: "#FF3366",
  },
  levelRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  levelPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#0D131F",
    alignItems: "center",
  },
  levelPillActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.1)",
  },
  levelText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  levelTextActive: {
    color: "#00F0FF",
    fontWeight: "800",
  },
  protocolCard: {
    backgroundColor: "#0D131F",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 14,
  },
  protocolHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  protocolTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#F8FAFC",
    flex: 1,
  },
  badge: {
    backgroundColor: "rgba(0, 240, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
  },
  badgeText: {
    fontSize: 10,
    color: "#00F0FF",
    fontWeight: "700",
  },
  protocolDesc: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 17,
  },
  timerCard: {
    backgroundColor: "rgba(0, 240, 255, 0.04)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.25)",
    marginBottom: 14,
  },
  timerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  timerTitle: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  timerDisplay: {
    fontSize: 16,
    fontWeight: "800",
    color: "#00F0FF",
    fontFamily: "monospace",
  },
  timerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  timerBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#0D131F",
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
    alignItems: "center",
  },
  timerBtnText: {
    fontSize: 12,
    color: "#00F0FF",
    fontWeight: "700",
  },
  timerCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 51, 102, 0.15)",
    borderWidth: 1,
    borderColor: "#FF3366",
    alignItems: "center",
  },
  timerCancelText: {
    fontSize: 12,
    color: "#FF3366",
    fontWeight: "700",
  },
  exercisesList: {
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  exerciseCard: {
    backgroundColor: "#0D131F",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  exerciseCardDone: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
    flex: 1,
  },
  exerciseNameDone: {
    color: "#10B981",
    textDecorationLine: "line-through",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    borderColor: "#10B981",
    backgroundColor: "#10B981",
  },
  checkboxText: {
    color: "#05080F",
    fontSize: 12,
    fontWeight: "900",
  },
  exerciseMeta: {
    fontSize: 12,
    color: "#00F0FF",
    fontWeight: "700",
    marginBottom: 4,
  },
  exerciseTip: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
  },
  actionButtonsContainer: {
    gap: 10,
    paddingBottom: 40,
  },
  forgeHabitBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 51, 102, 0.15)",
    borderWidth: 1,
    borderColor: "#FF3366",
    alignItems: "center",
  },
  forgeHabitText: {
    color: "#FF3366",
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  reassessBtn: {
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#0D131F",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
  },
  reassessText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  assessmentContainer: {
    paddingBottom: 40,
  },
  assessmentIntroCard: {
    backgroundColor: "#0D131F",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.25)",
    marginBottom: 16,
  },
  assessmentIntroTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 6,
  },
  assessmentIntroDesc: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 17,
  },
  testItemsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  testCard: {
    backgroundColor: "#0D131F",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  testHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  testName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#F8FAFC",
    flex: 1,
  },
  testUnit: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
  },
  testDesc: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 10,
  },
  testNote: {
    fontSize: 11,
    color: "#F59E0B",
    fontStyle: "italic",
    marginBottom: 8,
  },
  choiceRow: {
    flexDirection: "row",
    gap: 6,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    alignItems: "center",
  },
  choiceBtnActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.15)",
  },
  choiceBtnText: {
    fontSize: 10.5,
    color: "#64748B",
    fontWeight: "600",
  },
  choiceBtnTextActive: {
    color: "#00F0FF",
    fontWeight: "700",
  },
  inputStepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepperBtn: {
    width: 40,
    height: 38,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
  },
  stepperInput: {
    flex: 1,
    height: 38,
    backgroundColor: "#080C14",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
    color: "#00F0FF",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },
  bodyweightInput: {
    height: 42,
    backgroundColor: "#080C14",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00F0FF",
    color: "#00F0FF",
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "700",
  },
  gymDualInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gymInputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },
  multiplierX: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 14,
  },
  gymInput: {
    height: 38,
    backgroundColor: "#080C14",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    color: "#F8FAFC",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
  },
  gymInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  submitAssessmentBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#00F0FF",
    alignItems: "center",
  },
  submitAssessmentText: {
    color: "#05080F",
    fontSize: 13.5,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
