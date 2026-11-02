import React, { useEffect, useState, useCallback } from "react";
import {
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
import CyberModal from "../../components/Common/CyberModal";

import ChangeNavigationService from "../../services/ChangeNavigationService";
import CheckService from "../../services/CheckService";
import HabitsService from "../../services/HabitsService";
import SoundService from "../../services/SoundService";
import Svg, { Path, Circle, Line } from "react-native-svg";

function TabIcon({ id, color, size = 20 }) {
  switch (id) {
    case "hoje":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 11l3 3L22 4"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "treinos":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "livros":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "foco":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="14" r="8" stroke={color} strokeWidth="2.2" />
          <Line x1="12" y1="10" x2="12" y2="14" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <Line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <Line x1="9" y1="2" x2="15" y2="2" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );
    case "perfil":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2.2" />
        </Svg>
      );
    default:
      return null;
  }
}

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
  const [gameOver, setGameOver] = useState(false);

  // Estatísticas Unificadas de XP do Jogador
  const [playerStats, setPlayerStats] = useState({
    totalXP: 0,
    habitChecksTotal: 0,
    habitXPTotal: 0,
    completedChallengesCount: 0,
    challengeXPTotal: 0,
    mindXP: 0,
    moneyXP: 0,
    bodyXP: 0,
    funXP: 0,
    mindChecks: 0,
    moneyChecks: 0,
    bodyChecks: 0,
    funChecks: 0,
  });

  // Modal de Foco acionado diretamente de uma meta
  const [focusedHabit, setFocusedHabit] = useState(null);

  // Cyber Modal state
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "ENTENDIDO",
    cancelText: null,
    onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
    onCancel: null,
  });

  const loadAllHabits = async () => {
    try {
      const initialList = await HabitsService.getAllHabits();

      // Avalia a rotina e fome de cada hábito se os dias se passaram
      for (const h of initialList) {
        await CheckService.removeCheck(h);
        await CheckService.checkStatus(h);
      }

      // Lê a lista com o progresso e estado de fome devidamente atualizados
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

      // Cálculo de XP Unificado (Hábitos + Desafios Diários)
      const stats = await HabitsService.getPlayerStats();
      setPlayerStats(stats);

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

  const getAreaProgress = (habits) => {
    if (!habits || habits.length === 0) return 1;
    return Math.min(
      ...habits.map((h) => (h.progressBar !== undefined ? h.progressBar : 1))
    );
  };

  const getTamagotchiState = () => {
    if (gameOver) {
      return {
        label: "SISTEMA OFFLINE • ENERGIA ESGOTADA",
        color: "#FF3366",
        bg: "rgba(255, 51, 102, 0.12)",
        borderColor: "rgba(255, 51, 102, 0.3)",
      };
    }
    if (allHabits.length === 0) {
      return {
        label: "MODO ESPERA • FORJE UMA META PARA ATIVAR O VÍNCULO VITAL",
        color: "#00F0FF",
        bg: "rgba(0, 240, 255, 0.08)",
        borderColor: "rgba(0, 240, 255, 0.25)",
      };
    }
    const minMind = getAreaProgress(mindHabits);
    const minMoney = getAreaProgress(moneyHabits);
    const minBody = getAreaProgress(bodyHabits);
    const minFun = getAreaProgress(funHabits);
    const overallMin = Math.min(minMind, minMoney, minBody, minFun);

    if (overallMin <= 0.25) {
      return {
        label: "ENERGIA CRÍTICA • NUTRIR ROTINAS IMEDIATAMENTE",
        color: "#FE7F23",
        bg: "rgba(254, 127, 35, 0.12)",
        borderColor: "rgba(254, 127, 35, 0.3)",
      };
    }
    if (overallMin <= 0.5) {
      return {
        label: "FOME DETECTADA • CONCLUA SUAS METAS DO DIA",
        color: "#F59E0B",
        bg: "rgba(245, 158, 11, 0.12)",
        borderColor: "rgba(245, 158, 11, 0.3)",
      };
    }
    return {
      label: "CORE ALIMENTADO • 100% OPERACIONAL",
      color: "#00F0FF",
      bg: "rgba(0, 240, 255, 0.08)",
      borderColor: "rgba(0, 240, 255, 0.25)",
    };
  };

  const tamagotchiState = getTamagotchiState();

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

  const handleAddRoutineFromTab = async (routineObj) => {
    try {
      await HabitsService.createHabit({
        ...routineObj,
        lastCheck: new Date().toISOString().slice(0, 10),
        daysWithoutChecks: 0,
        progressBar: 1,
        habitIsChecked: 0,
        habitChecks: 0,
        currentValue: 0,
        streak: 0,
      });
      await loadAllHabits();
    } catch (err) {
      console.error("Erro ao adicionar rotina:", err);
    }
  };

  const handleResetAvatar = () => {
    SoundService.playClick();
    setModalConfig({
      visible: true,
      title: "RESTAURAR SAÚDE DO AVATAR",
      message: "Deseja restaurar as barras de vida do avatar para 100% mantendo todas as suas metas e seu histórico acumulado?",
      type: "warning",
      confirmText: "RESTAURAR ENERGIA",
      cancelText: "CANCELAR",
      onCancel: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      onConfirm: async () => {
        try {
          await HabitsService.resetAllProgress();
          setGameOver(false);
          await loadAllHabits();
          SoundService.playLevelUp();
          setModalConfig({
            visible: true,
            title: "SISTEMA RESTAURADO",
            message: "Avatar recuperado com sucesso. O Core está operando com energia total!",
            type: "success",
            confirmText: "CONTINUAR",
            onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
          });
        } catch (err) {
          console.error(err);
        }
      },
    });
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
                <Text style={styles.checksPill}>[ {playerStats.totalXP} XP ]</Text>
              </View>
              <View style={styles.hudRight}>
                <Text style={styles.effLabel}>Eficiência do Core:</Text>
                <Text style={styles.effPercent}>{efficiency}%</Text>
              </View>
            </View>

            {/* ROBÔ DE LOTTIE E BARRAS DE STATUS */}
            <View style={{ alignItems: "center" }}>
              <LifeStatus
                mindHabit={mindHabits}
                moneyHabit={moneyHabits}
                bodyHabit={bodyHabits}
                funHabit={funHabits}
              />

              {/* BADGE DE MONITORAMENTO VITAL DO CORE (TAMAGOTCHI) */}
              <View
                style={[
                  styles.tamagotchiBadge,
                  {
                    backgroundColor: tamagotchiState.bg,
                    borderColor: tamagotchiState.borderColor,
                  },
                ]}
              >
                <View
                  style={[
                    styles.tamagotchiDot,
                    { backgroundColor: tamagotchiState.color },
                  ]}
                />
                <Text
                  style={[
                    styles.tamagotchiText,
                    { color: tamagotchiState.color },
                  ]}
                >
                  {tamagotchiState.label}
                </Text>
              </View>

              <StatusBar
                mindHabit={getAreaProgress(mindHabits)}
                moneyHabit={getAreaProgress(moneyHabits)}
                bodyHabit={getAreaProgress(bodyHabits)}
                funHabit={getAreaProgress(funHabits)}
              />
            </View>

            {/* SE O AVATAR MORREU */}
            {gameOver && (
              <View style={styles.gameOverBanner}>
                <Text style={styles.gameOverTitle}>Energia Crítica Esgotada</Text>
                <Text style={styles.gameOverDesc}>
                  Uma ou mais metas expiraram. Restaure a saúde do avatar para continuar!
                </Text>
                <TouchableOpacity
                  style={styles.gameOverRecoverBtn}
                  onPress={handleResetAvatar}
                >
                  <Text style={styles.gameOverRecoverText}>
                    Restaurar Energia do Avatar
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TERMINAL DE DESAFIOS DIÁRIOS (SIDE QUESTS) */}
            <DailyChallengesCard
              onChallengeDone={async () => {
                SoundService.playCheck();
                await loadAllHabits();
              }}
            />

            {/* SEÇÃO: QUESTS ATIVAS DE HOJE */}
            <View style={styles.questsHeaderRow}>
              <Text style={styles.questsSectionTitle}>
                Quests de Hoje ({activeHabits.length})
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
                    ? "Nenhum protocolo forjado ainda"
                    : "Todas as quests de hoje concluídas"}
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
                  Protocolos Cumpridos Hoje ({completedHabits.length})
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
          <WorkoutTab onAddHabit={handleAddRoutineFromTab} />
        )}

        {currentTab === "livros" && (
          <BooksTab onAddHabit={handleAddRoutineFromTab} />
        )}

        {currentTab === "foco" && (
          <FocusTab
            onSessionDone={async () => {
              SoundService.playCheck();
              await loadAllHabits();
            }}
          />
        )}

        {currentTab === "perfil" && (
          <ProfileTab
            totalXP={playerStats.totalXP}
            checks={playerStats.totalXP}
            daysLife={robotDaysLife}
            mindChecks={playerStats.mindXP}
            moneyChecks={playerStats.moneyXP}
            bodyChecks={playerStats.bodyXP}
            funChecks={playerStats.funXP}
            rawHabitChecks={playerStats.habitChecksTotal}
            challengesDone={playerStats.completedChallengesCount}
            onResetLife={handleResetAvatar}
          />
        )}
      </View>

      {/* BARRA DE NAVEGAÇÃO INFERIOR (BOTTOM TAB BAR) */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(10, insets.bottom) }]}>
        {[
          { id: "hoje", label: "Hoje" },
          { id: "treinos", label: "Treinos" },
          { id: "livros", label: "Livros" },
          { id: "foco", label: "Foco" },
          { id: "perfil", label: "Perfil" },
        ].map((tab) => {
          const isSel = currentTab === tab.id;
          const color = isSel ? "#00F0FF" : "#64748B";
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, isSel && styles.tabBtnActive]}
              onPress={() => handleTabChange(tab.id)}
            >
              <TabIcon id={tab.id} color={color} size={20} />
              <Text style={[styles.tabLabel, isSel && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* MODAL FOCO / TIMER ACIONADO DE UMA META */}
      {focusedHabit && (
        <Modal
          visible={!!focusedHabit}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setFocusedHabit(null)}
        >
          <View style={[styles.modalContainer, { paddingTop: insets.top + 20 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHabitArea}>
                  [{focusedHabit.habitArea.toUpperCase()}]
                </Text>
                <Text style={styles.modalHabitName}>
                  {focusedHabit.habitName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setFocusedHabit(null)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>Fechar ✕</Text>
              </TouchableOpacity>
            </View>

            <FocusTab
              initialMinutes={
                focusedHabit.habitType === "timer"
                  ? focusedHabit.targetValue || 25
                  : 25
              }
              onSessionDone={async () => {
                await HabitsService.changeProgress({
                  habitArea: focusedHabit.habitArea,
                  progressBar: 1,
                  habitChecks: (focusedHabit.habitChecks || 0) + 1,
                  lastCheck: new Date().toISOString().slice(0, 10),
                  daysWithoutChecks: 0,
                  habitIsChecked: 1,
                  currentValue: focusedHabit.targetValue || 25,
                  streak: (focusedHabit.streak || 0) + 1,
                });
                setFocusedHabit(null);
                loadAllHabits();
              }}
            />
          </View>
        </Modal>
      )}

      {/* Cyber Modal */}
      <CyberModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080C14",
  },
  tabContentContainer: {
    flex: 1,
  },
  scrollPadding: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0D131F",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.2)",
    marginBottom: 10,
  },
  hudLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hpText: {
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  checksPill: {
    backgroundColor: "rgba(0, 240, 255, 0.12)",
    color: "#00F0FF",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
  },
  hudRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  effLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },
  effPercent: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "900",
  },
  tamagotchiBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 2,
    marginBottom: 8,
  },
  tamagotchiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  tamagotchiText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  gameOverBanner: {
    backgroundColor: "rgba(255, 51, 102, 0.12)",
    borderWidth: 1.5,
    borderColor: "#FF3366",
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    alignItems: "center",
  },
  gameOverTitle: {
    color: "#FF3366",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  gameOverDesc: {
    color: "#CBD5E1",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 10,
  },
  gameOverRecoverBtn: {
    backgroundColor: "#FF3366",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  gameOverRecoverText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  questsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 10,
  },
  questsSectionTitle: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  newQuestBtn: {
    backgroundColor: "rgba(0, 240, 255, 0.12)",
    borderWidth: 1,
    borderColor: "#00F0FF",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  newQuestBtnText: {
    color: "#00F0FF",
    fontWeight: "800",
    fontSize: 11.5,
  },
  emptyStateBox: {
    backgroundColor: "#0D131F",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 6,
  },
  emptyStateTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptyStateSub: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
  },
  completedSection: {
    marginTop: 14,
  },
  completedSectionTitle: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#0A0E17",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  tabBtnActive: {
    backgroundColor: "rgba(0, 240, 255, 0.08)",
  },
  tabLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  tabLabelActive: {
    color: "#00F0FF",
    fontWeight: "800",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#080C14",
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 10,
  },
  modalHabitArea: {
    color: "#00F0FF",
    fontSize: 11,
    fontWeight: "700",
  },
  modalHabitName: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
  },
  modalCloseBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  modalCloseText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "700",
  },
});
