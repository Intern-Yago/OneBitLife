import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
} from "react-native";
import SoundService from "../../services/SoundService";

const FOCUS_QUOTES = [
  "A mente é tudo. O que você pensa, você se torna.",
  "Foco não é dizer sim para uma coisa, mas dizer não a centenas de outras.",
  "A disciplina é a ponte entre suas metas e suas realizações.",
  "Em meio ao caos de notificações, o homem focado é imperador.",
  "A dor da disciplina pesa gramas; a dor do arrependimento pesa toneladas.",
  "Sua energia flui para onde sua atenção se dirige.",
];

export default function FocusTab({ initialMinutes = 25, habitName = null, onSessionDone }) {
  const [selectedMinutes, setSelectedMinutes] = useState(initialMinutes);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isZenActive, setIsZenActive] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const timerRef = useRef(null);
  const exitHoldRef = useRef(null);

  useEffect(() => {
    setRemainingSeconds(selectedMinutes * 60);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [selectedMinutes]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsZenActive(false);
            SoundService.playTimerFinish();
            Alert.alert(
              "🏆 Sessão de Foco Concluída!",
              habitName
                ? `Parabéns! Você completou ${selectedMinutes} minutos no protocolo "${habitName}". +35 XP!`
                : `Parabéns! Sessão de ${selectedMinutes} minutos concluída com sucesso. +35 XP!`
            );
            if (onSessionDone) onSessionDone();
            return selectedMinutes * 60;
          }

          if (prev % 60 === 0) {
            setCurrentQuoteIndex((q) => (q + 1) % FOCUS_QUOTES.length);
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
  }, [isRunning, selectedMinutes, habitName]);

  const handleToggleTimer = () => {
    SoundService.playClick();
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    SoundService.playClick();
    setIsRunning(false);
    setRemainingSeconds(selectedMinutes * 60);
  };

  const handleStartZenMode = () => {
    SoundService.playClick();
    setIsRunning(true);
    setIsZenActive(true);
  };

  const handleHoldExitStart = () => {
    exitHoldRef.current = setTimeout(() => {
      SoundService.playClick();
      setIsRunning(false);
      setIsZenActive(false);
      Alert.alert("Foco Interrompido", "Modo Não Perturbe desativado.");
    }, 1500);
  };

  const handleHoldExitEnd = () => {
    if (exitHoldRef.current) clearTimeout(exitHoldRef.current);
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>⏱️ Cronômetro Pomodoro & Foco</Text>
      <Text style={styles.sectionSub}>
        Elimine o ruído digital e ative o estado de fluxo com o Modo Não Perturbe.
      </Text>

      {habitName && (
        <View style={styles.habitBadge}>
          <Text style={styles.habitBadgeText}>Focando em: {habitName}</Text>
        </View>
      )}

      {/* PRESETS DE TEMPO */}
      <View style={styles.presetsRow}>
        {[15, 25, 30, 45, 60].map((min) => {
          const isSel = selectedMinutes === min;
          return (
            <TouchableOpacity
              key={min}
              style={[styles.presetBtn, isSel && styles.presetBtnActive]}
              onPress={() => {
                SoundService.playClick();
                setSelectedMinutes(min);
              }}
            >
              <Text
                style={[
                  styles.presetBtnText,
                  isSel && styles.presetBtnTextActive,
                ]}
              >
                {min}m
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* DISCO CENTRAL DO TIMER */}
      <View style={styles.clockCircle}>
        <Text style={styles.clockDigits}>{timeFormatted}</Text>
        <Text style={styles.clockStatus}>
          {isRunning ? "⚡ FOCO PROFUNDO ATIVO" : "PAUSADO"}
        </Text>
      </View>

      {/* BOTÕES DE CONTROLE */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.mainActionBtn, isRunning && styles.pauseActionBtn]}
          onPress={handleToggleTimer}
        >
          <Text style={styles.mainActionText}>
            {isRunning ? "Pausar Foco" : "Iniciar Timer"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleResetTimer}>
          <Text style={styles.resetBtnText}>Zerar</Text>
        </TouchableOpacity>
      </View>

      {/* BOTÃO MODO NÃO PERTURBE */}
      <TouchableOpacity
        style={styles.zenModeBtn}
        onPress={handleStartZenMode}
        activeOpacity={0.8}
      >
        <Text style={styles.zenModeBtnIcon}>🛡️</Text>
        <View style={styles.zenModeBtnTexts}>
          <Text style={styles.zenModeBtnTitle}>
            Entrar em Modo Não Perturbe (Cyber Zen)
          </Text>
          <Text style={styles.zenModeBtnDesc}>
            Imersão visual total, tela cheia e bloqueio de distrações.
          </Text>
        </View>
      </TouchableOpacity>

      {/* MODAL FULLSCREEN MODO NÃO PERTURBE */}
      <Modal
        visible={isZenActive}
        animationType="fade"
        transparent={false}
        onRequestClose={() => {}}
      >
        <View style={styles.zenModalContainer}>
          <View style={styles.zenHeader}>
            <Text style={styles.zenBadge}>🛡️ MODO NÃO PERTURBE ATIVO</Text>
            {habitName && (
              <Text style={styles.zenHabitTitle}>{habitName}</Text>
            )}
          </View>

          <View style={styles.zenClockBox}>
            <Text style={styles.zenClockDigits}>{timeFormatted}</Text>
            <Text style={styles.zenClockSub}>MANTENHA A ATENÇÃO</Text>
          </View>

          <View style={styles.zenQuoteBox}>
            <Text style={styles.zenQuoteText}>
              "{FOCUS_QUOTES[currentQuoteIndex]}"
            </Text>
          </View>

          {/* BOTÃO SEGURE PARA SAIR */}
          <TouchableOpacity
            style={styles.holdExitBtn}
            onPressIn={handleHoldExitStart}
            onPressOut={handleHoldExitEnd}
            activeOpacity={0.7}
          >
            <Text style={styles.holdExitText}>
              Segure por 2s para interromper
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  sectionHeader: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    alignSelf: "flex-start",
  },
  sectionSub: {
    color: "#888888",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  habitBadge: {
    backgroundColor: "rgba(0, 240, 255, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00F0FF",
    marginBottom: 14,
    alignSelf: "flex-start",
  },
  habitBadgeText: {
    color: "#00F0FF",
    fontSize: 12,
    fontWeight: "bold",
  },
  presetsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  presetBtn: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: "#121824",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  presetBtnActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.15)",
  },
  presetBtnText: {
    color: "#AAAAAA",
    fontSize: 13,
    fontWeight: "600",
  },
  presetBtnTextActive: {
    color: "#00F0FF",
    fontWeight: "bold",
  },
  clockCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#121824",
    borderWidth: 3,
    borderColor: "#00F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
  },
  clockDigits: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  clockStatus: {
    color: "#00F0FF",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 8,
    letterSpacing: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  mainActionBtn: {
    flex: 2,
    backgroundColor: "#00F0FF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },
  pauseActionBtn: {
    backgroundColor: "#F59E0B",
  },
  mainActionText: {
    color: "#0B0E14",
    fontSize: 15,
    fontWeight: "bold",
  },
  resetBtn: {
    flex: 1,
    backgroundColor: "#121824",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  resetBtnText: {
    color: "#888888",
    fontSize: 14,
    fontWeight: "600",
  },
  zenModeBtn: {
    backgroundColor: "rgba(18, 24, 36, 0.9)",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#00F0FF",
    padding: 14,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  zenModeBtnIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  zenModeBtnTexts: {
    flex: 1,
  },
  zenModeBtnTitle: {
    color: "#00F0FF",
    fontSize: 14,
    fontWeight: "bold",
  },
  zenModeBtnDesc: {
    color: "#888888",
    fontSize: 11,
    marginTop: 2,
  },
  // ESTILOS DO MODO ZEN
  zenModalContainer: {
    flex: 1,
    backgroundColor: "#080A0F",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  zenHeader: {
    alignItems: "center",
  },
  zenBadge: {
    color: "#00F0FF",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  zenHabitTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 6,
  },
  zenClockBox: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: "rgba(0, 240, 255, 0.4)",
    backgroundColor: "rgba(0, 240, 255, 0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  zenClockDigits: {
    color: "#FFFFFF",
    fontSize: 58,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  zenClockSub: {
    color: "#00F0FF",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 8,
    letterSpacing: 2,
  },
  zenQuoteBox: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  zenQuoteText: {
    color: "#AAAAAA",
    fontSize: 15,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
  },
  holdExitBtn: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  holdExitText: {
    color: "#777777",
    fontSize: 12,
  },
});
