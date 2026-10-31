import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LifeStatus from "../../components/Common/LifeStatus";
import StatusBar from "../../components/Home/StatusBar";
import QuestCard from "../../components/Home/QuestCard";
import DailyChallengesCard from "../../components/Home/DailyChallengesCard";
import WorkoutTab from "../../components/WorkoutTab";
import BooksTab from "../../components/BooksTab";
import FocusTab from "../../components/FocusTab";
import ProfileTab from "../../components/ProfileTab";

import ChangeNavigationService from "../../services/ChangeNavigationService";
import CheckService from "../../services/CheckService";
import HabitsService from "../../services/HabitsService";
import SoundService from "../../services/SoundService";

export default function Home({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [currentTab, setCurrentTab] = useState("hoje"); // "hoje", "treinos", "livros", "foco", "perfil"
  const [allHabits, setAllHabits] = useState([]);
  const [mindHabits, setMindHabits] = useState([]);
  const [moneyHabits, setMoneyHabits] = useState([]);
  const [bodyHabits, setBodyHabits] = useState([]);
  const [funHabits, setFunHabits] = useState([]);

  const [robotDaysLife, setRobotDaysLife] = useState("01");
  const [checks, setChecks] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Modal de Foco acionado diretamente de uma meta
  const [focusedHabit, setFocusedHabit] = useState(null);

  const loadAllHabits = async () => {
    try {
      const list = await HabitsService.getAllHabits();
      setAllHabits(list);

      const mind = list.filter((h) => h.habitArea === "Mente");
      const money = list.filter((h) => h.habitArea === "Financeiro");
      const body = list.filter((h) => h.habitArea === "Corpo");
      const fun = list.filter((h) => h.habitArea === "Humor");

      setMindHabits(mind);
      setMoneyHabits(money);
      setBodyHabits(body);
      setFunHabits(fun);

      list.forEach((h) => {
        CheckService.removeCheck(h);
        CheckService.checkStatus(h);
      });

      const totalChecks = list.reduce(
        (acc, h) => acc + (h.habitChecks || 0),
        0
      );
      setChecks(totalChecks);

      const hasDeadHabit = list.some((h) => h.progressBar === 0);
      setGameOver(hasDeadHabit);
    } catch (err) {
      console.log("[Home] Erro ao carregar hábitos:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAllHabits();
    }, [route.params])
  );

  useEffect(() => {
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
          const diffDays = Math.max(
            1,
            Math.floor(diffTime / (1000 * 3600 * 24)) + 1
          );
          setRobotDaysLife(diffDays.toString().padStart(2, "0"));
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const getAvgProgress = (habits) => {
    if (!habits || habits.length === 0) return 1;
    const sum = habits.reduce(
      (acc, h) => acc + (h.progressBar !== undefined ? h.progressBar : 1),
      0
    );
    return sum / habits.length;
  };

  const activeHabits = allHabits.filter((h) => (h.habitIsChecked || 0) === 0);
  const completedHabits = allHabits.filter((h) => (h.habitIsChecked || 0) === 1);
  const efficiency =
    allHabits.length > 0
      ? Math.round((completedHabits.length / allHabits.length) * 100)
      : 100;

  const handleCreateNewHabit = () => {
    SoundService.playClick();
    navigation.navigate("HabitPage", { create: true });
  };

  const handleResetAvatar = () => {
    SoundService.playClick();
    Alert.alert(
      "⚡ Restaurar Avatar (Recovery)",
      "Deseja restaurar as barras de vida do avatar para 100% mantendo todas as suas metas?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          onPress: async () => {
            await HabitsService.resetAllProgress();
            setGameOver(false);
            loadAllHabits();
            SoundService.playLevelUp();
            Alert.alert("OneBitLife", "Avatar restaurado com sucesso! Mantenha a disciplina.");
          },
        },
      ]
    );
  };

  const handleTabChange = (tab) => {
    SoundService.playClick();
    setCurrentTab(tab);
  };

  const handleStartTimerForHabit = (habit) => {
    setFocusedHabit(habit);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* CONTEÚDO PRINCIPAL DE CADA ABA */}
      <View style={styles.tabContentContainer}>
        {currentTab === "hoje" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollPadding}
          >
            {/* CABEÇALHO DO AVATAR & HP */}
            <View style={styles.topHud}>
              <View style={styles.hudLeft}>
                <Text style={styles.hpText}>
                  HP {robotDaysLife} {robotDaysLife === "01" ? "dia" : "dias"}
                </Text>
                <Text style={styles.checksPill}>[ {checks} Checks ]</Text>
              </View>
              <View style={styles.hudRight}>
                <Text style={styles.effLabel}>Eficiência do Core:</Text>
                <Text style={styles.effPercent}>{efficiency}%</Text>
              </View>
            </View>

            {/* ROBÔ DE LOTTIE E BARRAS DE STATUS */}
            <View style={{ alignItems: "center" }}>
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
            </View>

            {/* SE O AVATAR MORREU */}
            {gameOver && (
              <View style={styles.gameOverBanner}>
                <Text style={styles.gameOverTitle}>⚠️ Energia Crítica Esgotada</Text>
                <Text style={styles.gameOverDesc}>
                  Uma ou mais metas expiraram. Restaure a saúde do avatar para continuar!
                </Text>
                <TouchableOpacity
                  style={styles.gameOverRecoverBtn}
                  onPress={handleResetAvatar}
                >
                  <Text style={styles.gameOverRecoverText}>
                    ⚡ Restaurar Energia do Avatar
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TERMINAL DE DESAFIOS DIÁRIOS (SIDE QUESTS) */}
            <DailyChallengesCard
              onChallengeDone={() => {
                setChecks((c) => c + 1);
              }}
            />

            {/* SEÇÃO: QUESTS ATIVAS DE HOJE */}
            <View style={styles.questsHeaderRow}>
              <Text style={styles.questsSectionTitle}>
                🎯 Quests de Hoje ({activeHabits.length})
              </Text>
              <TouchableOpacity
                style={styles.newQuestBtn}
                onPress={handleCreateNewHabit}
              >
                <Text style={styles.newQuestBtnText}>+ Forjar Meta</Text>
              </TouchableOpacity>
            </View>

            {activeHabits.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateTitle}>
                  {allHabits.length === 0
                    ? "Nenhum protocolo forjado ainda!"
                    : "🎉 Todas as quests de hoje concluídas!"}
                </Text>
                <Text style={styles.emptyStateSub}>
                  {allHabits.length === 0
                    ? "Toque em '+ Forjar Meta' ou adicione rotinas nas abas de Treinos e Livros."
                    : "Sistemas vitais operando em nível máximo. Excelente disciplina!"}
                </Text>
              </View>
            ) : (
              activeHabits.map((habit) => (
                <QuestCard
                  key={habit.id || habit.habitName}
                  habit={habit}
                  onRefresh={loadAllHabits}
                  onStartTimer={handleStartTimerForHabit}
                />
              ))
            )}

            {/* SEÇÃO: QUESTS CONCLUÍDAS HOJE */}
            {completedHabits.length > 0 && (
              <View style={styles.completedSection}>
                <Text style={styles.completedSectionTitle}>
                  ⚡ Protocolos Cumpridos Hoje ({completedHabits.length})
                </Text>
                {completedHabits.map((habit) => (
                  <QuestCard
                    key={habit.id || habit.habitName}
                    habit={habit}
                    onRefresh={loadAllHabits}
                    onStartTimer={handleStartTimerForHabit}
                  />
                ))}
              </View>
            )}

            <View style={{ height: 30 }} />
          </ScrollView>
        )}

        {currentTab === "treinos" && (
          <WorkoutTab onHabitAdded={loadAllHabits} />
        )}

        {currentTab === "livros" && (
          <BooksTab onHabitAdded={loadAllHabits} />
        )}

        {currentTab === "foco" && (
          <FocusTab
            onSessionDone={() => {
              setChecks((c) => c + 1);
            }}
          />
        )}

        {currentTab === "perfil" && (
          <ProfileTab
            checks={checks}
            daysLife={robotDaysLife}
            mindChecks={mindHabits.reduce((acc, h) => acc + (h.habitChecks || 0), 0)}
            moneyChecks={moneyHabits.reduce((acc, h) => acc + (h.habitChecks || 0), 0)}
            bodyChecks={bodyHabits.reduce((acc, h) => acc + (h.habitChecks || 0), 0)}
            funChecks={funHabits.reduce((acc, h) => acc + (h.habitChecks || 0), 0)}
            onResetLife={handleResetAvatar}
          />
        )}
      </View>

      {/* BARRA DE NAVEGAÇÃO INFERIOR (BOTTOM TAB BAR) */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(10, insets.bottom) }]}>
        {[
          { id: "hoje", icon: "🏠", label: "Hoje" },
          { id: "treinos", icon: "🦾", label: "Treinos" },
          { id: "livros", icon: "📚", label: "Livros" },
          { id: "foco", icon: "⏱️", label: "Foco" },
          { id: "perfil", icon: "👤", label: "Perfil" },
        ].map((tab) => {
          const isSel = currentTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, isSel && styles.tabBtnActive]}
              onPress={() => handleTabChange(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isSel && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* MODAL DE FOCO DISPARADO DE UM CARD */}
      {focusedHabit && (
        <Modal
          visible={!!focusedHabit}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setFocusedHabit(null)}
        >
          <View style={[styles.focusModalWrapper, { paddingTop: insets.top }]}>
            <TouchableOpacity
              style={styles.focusModalCloseBtn}
              onPress={() => setFocusedHabit(null)}
            >
              <Text style={styles.focusModalCloseText}>‹ Fechar Sessão</Text>
            </TouchableOpacity>
            <FocusTab
              habitName={focusedHabit?.habitName}
              initialMinutes={Number(focusedHabit?.targetValue) || 25}
              onSessionDone={() => {
                setChecks((c) => c + 1);
                loadAllHabits();
                setFocusedHabit(null);
              }}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0E14",
  },
  tabContentContainer: {
    flex: 1,
  },
  scrollPadding: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  topHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#121824",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    marginBottom: 8,
  },
  hudLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  hpText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  checksPill: {
    color: "#00F0FF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 8,
  },
  hudRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  effLabel: {
    color: "#888888",
    fontSize: 12,
    marginRight: 6,
  },
  effPercent: {
    color: "#10B981",
    fontSize: 15,
    fontWeight: "bold",
  },
  gameOverBanner: {
    backgroundColor: "rgba(255, 51, 102, 0.12)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FF3366",
    marginVertical: 12,
    alignItems: "center",
  },
  gameOverTitle: {
    color: "#FF3366",
    fontSize: 18,
    fontWeight: "bold",
  },
  gameOverDesc: {
    color: "#DDDDDD",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  gameOverRecoverBtn: {
    backgroundColor: "#FF3366",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  gameOverRecoverText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  questsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  questsSectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  newQuestBtn: {
    backgroundColor: "#00F0FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newQuestBtnText: {
    color: "#0B0E14",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyStateBox: {
    backgroundColor: "#121824",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  emptyStateTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyStateSub: {
    color: "#888888",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  completedSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    paddingTop: 14,
  },
  completedSectionTitle: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#0D111A",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: 8,
    justifyContent: "space-around",
  },
  tabBtn: {
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#00F0FF",
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    color: "#666666",
    fontSize: 11,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: "#00F0FF",
    fontWeight: "bold",
  },
  focusModalWrapper: {
    flex: 1,
    backgroundColor: "#0B0E14",
  },
  focusModalCloseBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  focusModalCloseText: {
    color: "#00F0FF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
