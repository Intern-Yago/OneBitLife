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

  const [mindHabit, setMindHabit] = useState();
  const [moneyHabit, setMoneyHabit] = useState();
  const [bodyHabit, setBodyHabit] = useState();
  const [funHabit, setFunHabit] = useState();

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
      description: "Complete 10 checks em Mente",
      unlocked: (mindHabit?.habitChecks || 0) >= 10,
    },
    {
      id: "money_master",
      title: "💰 Magnata Tecnológico",
      description: "Complete 10 checks em Financeiro",
      unlocked: (moneyHabit?.habitChecks || 0) >= 10,
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

  const excludeArea = route.params?.excludeArea;

  useEffect(() => {
    HabitsService.findByArea("Mente").then((mind) => setMindHabit(mind[0]));
    HabitsService.findByArea("Financeiro").then((money) => setMoneyHabit(money[0]));
    HabitsService.findByArea("Corpo").then((body) => setBodyHabit(body[0]));
    HabitsService.findByArea("Humor").then((fun) => setFunHabit(fun[0]));

    if (excludeArea) {
      if (excludeArea === "Mente") setMindHabit(null);
      if (excludeArea === "Financeiro") setMoneyHabit(null);
      if (excludeArea === "Corpo") setBodyHabit(null);
      if (excludeArea === "Humor") setFunHabit(null);
    }

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
    CheckService.removeCheck(mindHabit, moneyHabit, bodyHabit, funHabit);
    CheckService.checkStatus(mindHabit, moneyHabit, bodyHabit, funHabit);

    const mindChecks = mindHabit ? mindHabit.habitChecks || 0 : 0;
    const moneyChecks = moneyHabit ? moneyHabit.habitChecks || 0 : 0;
    const bodyChecks = bodyHabit ? bodyHabit.habitChecks || 0 : 0;
    const funChecks = funHabit ? funHabit.habitChecks || 0 : 0;

    setChecks(mindChecks + moneyChecks + bodyChecks + funChecks);

    if (
      mindHabit?.progressBar === 0 ||
      moneyHabit?.progressBar === 0 ||
      bodyHabit?.progressBar === 0 ||
      funHabit?.progressBar === 0
    ) {
      setGameOver(true);
    } else {
      setGameOver(false);
    }
  }, [mindHabit, moneyHabit, bodyHabit, funHabit]);

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
            mindHabit={mindHabit}
            moneyHabit={moneyHabit}
            bodyHabit={bodyHabit}
            funHabit={funHabit}
          />

          <StatusBar
            mindHabit={mindHabit?.progressBar}
            moneyHabit={moneyHabit?.progressBar}
            bodyHabit={bodyHabit?.progressBar}
            funHabit={funHabit?.progressBar}
          />

          {!gameOver ? (
            <View>
              {mindHabit ? (
                <EditHabit habit={mindHabit} checkColor="#90B7F3" />
              ) : (
                <CreateHabit habitArea="Mente" borderColor="#90B7F3" />
              )}
              {moneyHabit ? (
                <EditHabit habit={moneyHabit} checkColor="#85BB65" />
              ) : (
                <CreateHabit habitArea="Financeiro" borderColor="#85BB65" />
              )}
              {bodyHabit ? (
                <EditHabit habit={bodyHabit} checkColor="#FF0044" />
              ) : (
                <CreateHabit habitArea="Corpo" borderColor="#FF0044" />
              )}
              {funHabit ? (
                <EditHabit habit={funHabit} checkColor="#FE7F23" />
              ) : (
                <CreateHabit habitArea="Humor" borderColor="#FE7F23" />
              )}

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

            <ScrollView style={{ maxHeight: 320, width: "100%" }}>
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
  actionsContainer: {
    alignItems: "center",
    marginTop: 10,
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