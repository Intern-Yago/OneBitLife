import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import HabitsService from "../../../services/HabitsService";
import SoundService from "../../../services/SoundService";
import CheckService from "../../../services/CheckService";
import ProtocolIcon from "../../Common/ProtocolIcon";

export default function QuestCard({ habit, onRefresh, onStartTimer }) {
  const navigation = useNavigation();
  const [isChecked, setIsChecked] = useState(habit?.habitIsChecked === 1);
  const [counterValue, setCounterValue] = useState(habit?.currentValue || 0);

  const checkData = new Date();
  const month = `${checkData.getMonth() + 1}`.padStart(2, "0");
  const day = `${checkData.getDate()}`.padStart(2, "0");
  const formatDate = `${checkData.getFullYear()}-${month}-${day}`;

  const isTimer = habit?.habitType === "timer";
  const isCounter = habit?.habitType === "counter";
  const targetVal = habit?.targetValue || 1;

  const getAreaColor = (area) => {
    switch (area) {
      case "Mente": return "#00F0FF";
      case "Financeiro": return "#10B981";
      case "Corpo": return "#FF3366";
      case "Humor": return "#F59E0B";
      default: return "#00F0FF";
    }
  };

  const accentColor = getAreaColor(habit?.habitArea);

  const handleEdit = () => {
    SoundService.playClick();
    navigation.navigate("HabitPage", {
      create: false,
      habit,
    });
  };

  const handleToggleCheck = async () => {
    if (!isChecked) {
      SoundService.playCheck();
      setIsChecked(true);
      await CheckService.checkHabit({
        id: habit?.id,
        habitArea: habit?.habitArea,
        habitName: habit?.habitName,
        lastCheck: formatDate,
        habitIsChecked: 1,
        habitChecks: (habit?.habitChecks || 0) + 1,
      });
      if (onRefresh) onRefresh();
    } else {
      SoundService.playClick();
      setIsChecked(false);
      await CheckService.removeCheckHabit({
        id: habit?.id,
        habitIsChecked: 0,
        habitArea: habit?.habitArea,
        habitName: habit?.habitName,
      });
      if (onRefresh) onRefresh();
    }
  };

  const handleIncrementCounter = async (delta) => {
    SoundService.playClick();
    const nextVal = Math.max(0, counterValue + delta);
    setCounterValue(nextVal);
    await HabitsService.updateCounterProgress(habit.id, nextVal, targetVal);

    if (nextVal >= targetVal && !isChecked) {
      SoundService.playCheck();
      setIsChecked(true);
    } else if (nextVal < targetVal && isChecked) {
      setIsChecked(false);
    }
    if (onRefresh) onRefresh();
  };

  const handleTriggerTimer = () => {
    SoundService.playClick();
    if (onStartTimer) {
      onStartTimer(habit);
    }
  };

  return (
    <View
      style={[
        styles.card,
        isChecked && styles.cardChecked,
        { borderLeftColor: accentColor },
      ]}
    >
      <TouchableOpacity
        style={styles.cardInfo}
        onPress={handleEdit}
        activeOpacity={0.8}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconBox}>
            <ProtocolIcon name={habit?.icon} color={accentColor} size={20} />
          </View>
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                isChecked && styles.titleChecked,
              ]}
              numberOfLines={2}
            >
              {habit?.habitName}
            </Text>
            <View style={styles.badgesRow}>
              <Text style={[styles.badge, { color: accentColor }]}>
                {habit?.habitArea}
              </Text>
              <Text style={styles.badgeMuted}>• {habit?.habitFrequency}</Text>
              {habit?.difficulty && (
                <Text style={styles.badgeDifficulty}>
                  [{habit.difficulty}]
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Informações de Notificação ou Progresso */}
        <View style={styles.footerRow}>
          {habit?.habitHasNotification === 1 && (
            <View style={styles.notifBadge}>
              <ProtocolIcon name="clock" size={11} color="#64748B" />
              <Text style={styles.notifText}>
                {" "}{habit?.habitNotificationTime || "12:00"}
              </Text>
            </View>
          )}

          {isCounter && (
            <Text style={styles.counterText}>
              Progresso: {counterValue} / {targetVal} {habit?.unit || ""}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* AÇÕES DINÂMICAS CONFORME O TIPO */}
      <View style={styles.actionColumn}>
        {isTimer ? (
          <TouchableOpacity
            style={[
              styles.timerBtn,
              isChecked ? styles.timerBtnDone : { borderColor: accentColor },
            ]}
            onPress={isChecked ? handleToggleCheck : handleTriggerTimer}
          >
            <Text style={[styles.timerBtnText, { color: isChecked ? "#10B981" : accentColor }]}>
              {isChecked ? "✓ Feito" : "▶ Focar"}
            </Text>
          </TouchableOpacity>
        ) : isCounter ? (
          <View style={styles.counterControlRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => handleIncrementCounter(-1)}
            >
              <Text style={styles.stepperText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stepperBtn, { borderColor: accentColor }]}
              onPress={() => handleIncrementCounter(1)}
            >
              <Text style={[styles.stepperText, { color: accentColor }]}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.checkBtn,
              isChecked
                ? [styles.checkBtnActive, { backgroundColor: accentColor }]
                : { borderColor: accentColor },
            ]}
            onPress={handleToggleCheck}
          >
            {isChecked && <Text style={styles.checkIcon}>✓</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#121824",
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderLeftWidth: 4,
  },
  cardChecked: {
    opacity: 0.65,
    backgroundColor: "#0D111A",
    borderColor: "rgba(255, 255, 255, 0.03)",
  },
  cardInfo: {
    flex: 1,
    paddingRight: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: "#0D131F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  titleChecked: {
    textDecorationLine: "line-through",
    color: "#888888",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  badgeMuted: {
    color: "#888888",
    fontSize: 11,
    marginLeft: 6,
  },
  badgeDifficulty: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 6,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },
  notifBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  notifText: {
    color: "#AAAAAA",
    fontSize: 11,
  },
  counterText: {
    color: "#00F0FF",
    fontSize: 11,
    fontWeight: "600",
  },
  actionColumn: {
    alignItems: "center",
    justifyContent: "center",
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkBtnActive: {
    borderColor: "transparent",
  },
  checkIcon: {
    color: "#0B0E14",
    fontWeight: "900",
    fontSize: 18,
  },
  timerBtn: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0, 240, 255, 0.08)",
  },
  timerBtnDone: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  timerBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  counterControlRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#444444",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  stepperText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
