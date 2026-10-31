import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { getWorkoutRoutine } from "../../Database/WorkoutData";
import HabitsService from "../../services/HabitsService";
import SoundService from "../../services/SoundService";

export default function WorkoutTab({ onHabitAdded }) {
  const [modality, setModality] = useState("calistenia");
  const [level, setLevel] = useState("iniciante");
  const [completedExercises, setCompletedExercises] = useState({});

  // Cronômetro de Descanso
  const [restTime, setRestTime] = useState(60);
  const [currentTimer, setCurrentTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  const routine = getWorkoutRoutine(modality, level);

  useEffect(() => {
    setRestTime(routine.restSeconds || 60);
    setCurrentTimer(routine.restSeconds || 60);
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [modality, level]);

  // Efeito do cronômetro
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setCurrentTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            SoundService.playTimerFinish();
            Alert.alert("⚡ Descanso Finalizado!", "Hora da próxima série!");
            return restTime;
          }
          if (prev === 4 || prev === 3 || prev === 2) {
            SoundService.playBeep();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, restTime]);

  const toggleTimer = () => {
    SoundService.playClick();
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    SoundService.playClick();
    setIsTimerRunning(false);
    setCurrentTimer(restTime);
  };

  const toggleExerciseCheck = (index) => {
    SoundService.playClick();
    setCompletedExercises((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAddRoutineToHabits = async () => {
    try {
      SoundService.playCheck();
      await HabitsService.createHabit({
        habitArea: "Corpo",
        habitName: `Treino: ${routine.title}`,
        habitFrequency: routine.frequency.includes("3x") ? "Semanal" : "Diário",
        habitHasNotification: 0,
        habitNotificationFrequency: "Diário",
        habitNotificationTime: "18:00",
        lastCheck: new Date().toISOString().slice(0, 10),
        daysWithoutChecks: 0,
        progressBar: 1,
        habitIsChecked: 0,
        habitChecks: 0,
        habitType: "timer",
        targetValue: 45,
        unit: "min",
        difficulty: level === "avancado" ? "Rank S" : level === "intermediario" ? "Rank A" : "Rank B",
        icon: modality === "calistenia" ? "🦾" : "🏋️",
        streak: 0,
      });

      Alert.alert(
        "Protocolo Ativado!",
        `O treino "${routine.title}" foi adicionado com sucesso à sua rotina do Corpo!`
      );
      if (onHabitAdded) onHabitAdded();
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível adicionar o treino.");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionHeader}>🦾 Assistente de Treino Cyber</Text>
      <Text style={styles.sectionSub}>
        Selecione sua modalidade e nível para calcular a ficha biomecânica ideal.
      </Text>

      {/* SELETOR DE MODALIDADE */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            modality === "calistenia" && styles.toggleBtnActive,
          ]}
          onPress={() => {
            SoundService.playClick();
            setModality("calistenia");
          }}
        >
          <Text
            style={[
              styles.toggleBtnText,
              modality === "calistenia" && styles.toggleBtnTextActive,
            ]}
          >
            🦾 Calistenia (Corpo)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            modality === "academia" && styles.toggleBtnActive,
          ]}
          onPress={() => {
            SoundService.playClick();
            setModality("academia");
          }}
        >
          <Text
            style={[
              styles.toggleBtnText,
              modality === "academia" && styles.toggleBtnTextActive,
            ]}
          >
            🏋️ Academia (Pesos)
          </Text>
        </TouchableOpacity>
      </View>

      {/* SELETOR DE NÍVEL */}
      <View style={styles.levelRow}>
        {["iniciante", "intermediario", "avancado"].map((lvl) => {
          const isSel = level === lvl;
          const label =
            lvl === "iniciante"
              ? "Iniciante"
              : lvl === "intermediario"
              ? "Intermediário"
              : "Avançado";
          return (
            <TouchableOpacity
              key={lvl}
              style={[styles.levelBtn, isSel && styles.levelBtnActive]}
              onPress={() => {
                SoundService.playClick();
                setLevel(lvl);
              }}
            >
              <Text
                style={[styles.levelBtnText, isSel && styles.levelBtnTextActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CARD DA ROTINA */}
      <View style={styles.routineCard}>
        <View style={styles.routineHeader}>
          <Text style={styles.routineTitle}>{routine.title}</Text>
          <Text style={styles.routineFrequency}>{routine.frequency}</Text>
        </View>
        <Text style={styles.routineDesc}>{routine.description}</Text>

        {/* CRONÔMETRO DE DESCANSO EMBUTIDO */}
        <View style={styles.timerBox}>
          <View>
            <Text style={styles.timerLabel}>⏱️ Cronômetro de Descanso</Text>
            <Text style={styles.timerDisplay}>
              {Math.floor(currentTimer / 60)}:
              {`${currentTimer % 60}`.padStart(2, "0")}
            </Text>
          </View>
          <View style={styles.timerBtnsRow}>
            <TouchableOpacity
              style={[
                styles.timerActionBtn,
                isTimerRunning && styles.timerPauseBtn,
              ]}
              onPress={toggleTimer}
            >
              <Text style={styles.timerActionText}>
                {isTimerRunning ? "Pausar" : "Iniciar"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timerResetBtn} onPress={resetTimer}>
              <Text style={styles.timerResetText}>Zerar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LISTA DE EXERCÍCIOS */}
        <Text style={styles.exercisesTitle}>📋 Exercícios do Ciclo:</Text>
        {routine.exercises.map((ex, idx) => {
          const isDone = !!completedExercises[idx];
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.exItem, isDone && styles.exItemDone]}
              onPress={() => toggleExerciseCheck(idx)}
              activeOpacity={0.8}
            >
              <View style={styles.exInfo}>
                <Text style={[styles.exName, isDone && styles.exNameDone]}>
                  {idx + 1}. {ex.name}
                </Text>
                <Text style={styles.exSpecs}>
                  {ex.sets} séries × {ex.reps}
                </Text>
                <Text style={styles.exTip}>💡 {ex.tip}</Text>
              </View>
              <View style={[styles.exCheck, isDone && styles.exCheckDone]}>
                {isDone && <Text style={styles.exCheckIcon}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* BOTÃO ADICIONAR À ROTINA */}
        <TouchableOpacity
          style={styles.addRoutineBtn}
          onPress={handleAddRoutineToHabits}
        >
          <Text style={styles.addRoutineBtnText}>
            ⚡ Adicionar este Treino aos Hábitos do Corpo
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  sectionSub: {
    color: "#888888",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#121824",
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: "#FF3366",
  },
  toggleBtnText: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "bold",
  },
  toggleBtnTextActive: {
    color: "#FFFFFF",
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  levelBtn: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: "#121824",
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  levelBtnActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.12)",
  },
  levelBtnText: {
    color: "#AAAAAA",
    fontSize: 12,
    fontWeight: "600",
  },
  levelBtnTextActive: {
    color: "#00F0FF",
    fontWeight: "bold",
  },
  routineCard: {
    backgroundColor: "#121824",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 51, 102, 0.25)",
    marginBottom: 40,
  },
  routineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routineTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  routineFrequency: {
    color: "#FF3366",
    fontSize: 11,
    fontWeight: "bold",
    backgroundColor: "rgba(255, 51, 102, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  routineDesc: {
    color: "#BBBBBB",
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  timerBox: {
    backgroundColor: "#0B0E14",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.2)",
  },
  timerLabel: {
    color: "#00F0FF",
    fontSize: 11,
    fontWeight: "bold",
  },
  timerDisplay: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 2,
    letterSpacing: 1,
  },
  timerBtnsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerActionBtn: {
    backgroundColor: "#00F0FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  timerPauseBtn: {
    backgroundColor: "#F59E0B",
  },
  timerActionText: {
    color: "#0B0E14",
    fontWeight: "bold",
    fontSize: 12,
  },
  timerResetBtn: {
    borderWidth: 1,
    borderColor: "#444444",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timerResetText: {
    color: "#888888",
    fontSize: 12,
  },
  exercisesTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 8,
  },
  exItem: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  exItemDone: {
    opacity: 0.6,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  exInfo: {
    flex: 1,
    paddingRight: 10,
  },
  exName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  exNameDone: {
    textDecorationLine: "line-through",
    color: "#888888",
  },
  exSpecs: {
    color: "#FF3366",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  exTip: {
    color: "#888888",
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  exCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FF3366",
    alignItems: "center",
    justifyContent: "center",
  },
  exCheckDone: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  exCheckIcon: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  addRoutineBtn: {
    backgroundColor: "#FF3366",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },
  addRoutineBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
