import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DefaultButton from "../../components/Common/DefaultButton";
import LifeStatus from "../../components/Common/LifeStatus";
import CreateHabit from "../../components/Home/CreateHabit";
import EditHabit from "../../components/Home/EditHabit";
import StatusBar from "../../components/Home/StatusBar";
import ChangeNavigationService from "../../services/ChangeNavigationService";
import CheckService from "../../services/CheckService";
import HabitsService from "../../services/HabitsService";
import db from "../../Database";

export default function Home({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [mindHabits, setMindHabits] = useState([]);
  const [moneyHabits, setMoneyHabits] = useState([]);
  const [bodyHabits, setBodyHabits] = useState([]);
  const [funHabits, setFunHabits] = useState([]);

  const [robotDaysLife, setRobotDaysLife] = useState();
  const [checks, setChecks] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const getPlayerLevel = (totalChecks) => {
    const count = Number(totalChecks) || 0;
    if (count < 10) {
      return { level: 1, title: "Cyber Recruta", badgeColor: "#90B7F3" };
    } else if (count < 25) {
      return { level: 2, title: "Operador Neon", badgeColor: "#85BB65" };
    } else if (count < 50) {
      return { level: 3, title: "Guardião do Core", badgeColor: "#FE7F23" };
    } else if (count < 100) {
      return { level: 4, title: "Mestre dos Hábitos", badgeColor: "#9b59b6" };
    } else {
      return { level: 5, title: "Lenda Cyberpunk", badgeColor: "#FFD700" };
    }
  };

  const playerLevel = getPlayerLevel(checks);

  const totalMindChecks = mindHabits.reduce((acc, h) => acc + (h.habitChecks || 0), 0);
  const totalMoneyChecks = moneyHabits.reduce((acc, h) => acc + (h.habitChecks || 0), 0);
  const totalBodyChecks = bodyHabits.reduce((acc, h) => acc + (h.habitChecks || 0), 0);
  const totalFunChecks = funHabits.reduce((acc, h) => acc + (h.habitChecks || 0), 0);

  const achievementsList = [
    {
      id: "first_check",
      title: "🎯 Primeiro Hack",
      description: "Complete 1 check em qualquer hábito",
      unlocked: checks >= 1,
    },
    {
      id: "streak_5",
      title: "⚡ Carga de Neon",
      description: "Acumule 5 checks no total",
      unlocked: checks >= 5,
    },
    {
      id: "streak_25",
      title: "🛡️ Proteção do Core",
      description: "Chegue a 25 checks acumulados",
      unlocked: checks >= 25,
    },
    {
      id: "streak_50",
      title: "👑 Supremo Cyberpunk",
      description: "Conquiste 50 checks lendários",
      unlocked: checks >= 50,
    },
    {
      id: "mind_master",
      title: "🧠 Mente Brilhante",
      description: "Complete 10 checks na área da Mente",
      unlocked: totalMindChecks >= 10,
    },
    {
      id: "money_master",
      title: "💰 Magnata Tecnológico",
      description: "Complete 10 checks em Financeiro",
      unlocked: totalMoneyChecks >= 10,
    },
  ];

  function handleNavExplanation() {
    navigation.navigate("AppExplanation");
  }

  function handleGameOver() {
    navigation.navigate("Start");
    db.transaction((tx) => {
      tx.executeSql("DROP TABLE habits;");
      tx.executeSql("DROP TABLE change_navigation;");
    });
  }

  const loadAllHabits = () => {
    HabitsService.findByArea("Mente").then((mind) => setMindHabits(mind));
    HabitsService.findByArea("Financeiro").then((money) => setMoneyHabits(money));
    HabitsService.findByArea("Corpo").then((body) => setBodyHabits(body));
    HabitsService.findByArea("Humor").then((fun) => setFunHabits(fun));
  };

  useEffect(() => {
    loadAllHabits();

    ChangeNavigationService.checkShowHome(1)
      .then((showHome) => {
        if (showHome && showHome.appStartData) {
          const parts = showHome.appStartData.split("-");
          const startDate = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
          );
          startDate.setHours(0, 0, 0, 0);
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          const diffTime = todayDate.getTime() - startDate.getTime();
          const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 3600 * 24)) + 1);
          setRobotDaysLife(diffDays.toString().padStart(2, "0"));
        }
      })
      .catch((err) => console.log(err));
  }, [route.params]);

  useEffect(() => {
    const allHabits = [...mindHabits, ...moneyHabits, ...bodyHabits, ...funHabits];

    allHabits.forEach((h) => {
      CheckService.removeCheck(h);
      CheckService.checkStatus(h);
    });

    const totalChecks = allHabits.reduce((acc, h) => acc + (h.habitChecks || 0), 0);
    setChecks(totalChecks);

    const hasDeadHabit = allHabits.some((h) => h.progressBar === 0);
    setGameOver(hasDeadHabit);
  }, [mindHabits, moneyHabits, bodyHabits, funHabits]);

  const getAvgProgress = (habits) => {
    if (!habits || habits.length === 0) return 1;
    const sum = habits.reduce((acc, h) => acc + (h.progressBar !== undefined ? h.progressBar : 1), 0);
    return sum / habits.length;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center" }}>
          {!gameOver ? (
            <View style={{ alignItems: "center", marginTop: 10 }}>
              <Text style={styles.dailyChecks}>
                HP {robotDaysLife || "01"} {robotDaysLife === "01" ? "dia" : "dias"} | [ {checks} {checks === 1 ? "Check" : "Checks"} ]
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowAchievements(true)}
                style={[styles.levelBadge, { borderColor: playerLevel.badgeColor }]}
              >
                <Text style={[styles.levelText, { color: playerLevel.badgeColor }]}>
                  Nível {playerLevel.level} • {playerLevel.title}  🏆
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.gameOverTitle}>⚠️ Game Over ⚠️</Text>
          )}

          <LifeStatus
            mindHabit={mindHabits[0]}
            moneyHabit={moneyHabits[0]}
            bodyHabit={bodyHabits[0]}
            funHabit={funHabits[0]}
          />

          <StatusBar
            mindHabit={getAvgProgress(mindHabits)}
            moneyHabit={getAvgProgress(moneyHabits)}
            bodyHabit={getAvgProgress(bodyHabits)}
            funHabit={getAvgProgress(funHabits)}
          />

          {!gameOver ? (
            <View style={{ width: "100%", alignItems: "center" }}>
              {/* SEÇÃO MENTE */}
              <View style={styles.areaSection}>
                <Text style={[styles.areaTitle, { color: "#90B7F3" }]}>🧠 Mente ({mindHabits.length})</Text>
                {mindHabits.map((h) => (
                  <EditHabit key={h.id || h.habitName} habit={h} checkColor="#90B7F3" />
                ))}
                <CreateHabit habitArea="Mente" borderColor="#90B7F3" />
              </View>

              {/* SEÇÃO FINANCEIRO */}
              <View style={styles.areaSection}>
                <Text style={[styles.areaTitle, { color: "#85BB65" }]}>💰 Financeiro ({moneyHabits.length})</Text>
                {moneyHabits.map((h) => (
                  <EditHabit key={h.id || h.habitName} habit={h} checkColor="#85BB65" />
                ))}
                <CreateHabit habitArea="Financeiro" borderColor="#85BB65" />
              </View>

              {/* SEÇÃO CORPO */}
              <View style={styles.areaSection}>
                <Text style={[styles.areaTitle, { color: "#FF0044" }]}>🦾 Corpo ({bodyHabits.length})</Text>
                {bodyHabits.map((h) => (
                  <EditHabit key={h.id || h.habitName} habit={h} checkColor="#FF0044" />
                ))}
                <CreateHabit habitArea="Corpo" borderColor="#FF0044" />
              </View>

              {/* SEÇÃO HUMOR */}
              <View style={styles.areaSection}>
                <Text style={[styles.areaTitle, { color: "#FE7F23" }]}>😄 Humor ({funHabits.length})</Text>
                {funHabits.map((h) => (
                  <EditHabit key={h.id || h.habitName} habit={h} checkColor="#FE7F23" />
                ))}
                <CreateHabit habitArea="Humor" borderColor="#FE7F23" />
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setShowAchievements(true)}
                >
                  <Text style={styles.actionBtnText}>🏆 Ver Conquistas & Painel Cyber</Text>
                </TouchableOpacity>

                <Text
                  style={styles.explanationText}
                  onPress={handleNavExplanation}
                >
                  Ver explicações novamente
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ marginVertical: 40 }}>
              <DefaultButton
                buttonText={"Resetar o Game"}
                handlePress={handleGameOver}
                width={250}
                height={50}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL DE CONQUISTAS */}
      <Modal
        visible={showAchievements}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAchievements(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🏆 Painel de Conquistas</Text>
            <Text style={styles.modalSubtitle}>Nível Atual: {playerLevel.title}</Text>

            <ScrollView style={{ maxHeight: 340, width: "100%" }}>
              {achievementsList.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.achievementCard,
                    item.unlocked && styles.achievementUnlocked,
                  ]}
                >
                  <Text style={styles.achievementTitle}>{item.title}</Text>
                  <Text style={styles.achievementDesc}>{item.description}</Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      { color: item.unlocked ? "#85BB65" : "#777777" },
                    ]}
                  >
                    {item.unlocked ? "✓ CONQUISTADO" : "🔒 BLOQUEADO"}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowAchievements(false)}
            >
              <Text style={styles.closeBtnText}>Fechar Painel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(21, 21, 21, 0.98)",
  },
  dailyChecks: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },
  explanationText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 15,
    paddingBottom: 20,
  },
  areaSection: {
    marginVertical: 8,
    alignItems: "center",
    width: "100%",
  },
  areaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginLeft: 30,
    marginBottom: 4,
  },
  actionsContainer: {
    alignItems: "center",
    marginTop: 15,
  },
  actionBtn: {
    backgroundColor: "rgba(144, 183, 243, 0.15)",
    borderWidth: 1,
    borderColor: "#90B7F3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  actionBtnText: {
    color: "#90B7F3",
    fontWeight: "bold",
    fontSize: 14,
  },
  gameOverTitle: {
    marginVertical: 25,
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF0044",
  },
  levelBadge: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  levelText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#90B7F3",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  modalSubtitle: {
    color: "#90B7F3",
    fontSize: 14,
    marginBottom: 15,
  },
  achievementCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  achievementUnlocked: {
    borderColor: "#85BB65",
    backgroundColor: "rgba(133, 187, 101, 0.1)",
  },
  achievementTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  achievementDesc: {
    color: "#BBBBBB",
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 6,
  },
  closeBtn: {
    marginTop: 15,
    backgroundColor: "#90B7F3",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeBtnText: {
    color: "#151515",
    fontWeight: "bold",
    fontSize: 15,
  },
});