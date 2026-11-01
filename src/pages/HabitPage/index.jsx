import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

import HabitsService from "../../services/HabitsService";
import NotificationService from "../../services/NotificationService";
import SoundService from "../../services/SoundService";
import CyberModal from "../../components/Common/CyberModal";

const ICONS = ["⚡", "◆", "▲", "●", "★", "■", "✦", "◈", "◇"];

const WEEKDAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const WEEKDAYS_SHORT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

const PRESET_SUGGESTIONS = {
  Mente: [
    "Leitura Técnica (20 min)",
    "Estudo de Código",
    "Meditação / Foco",
    "Escrita & Reflexão",
  ],
  Financeiro: [
    "Revisão de Gastos",
    "Aporte de Investimento",
    "Ler Notícias de Mercado",
    "Organizar Contas",
  ],
  Corpo: [
    "Treino Físico (40 min)",
    "Beber 2.5L de Água",
    "Alongamento & Mobilidade",
    "Caminhada / Corrida",
  ],
  Humor: [
    "Diário de Gratidão",
    "Detox Noturno de Telas",
    "Conversa com Amigo",
    "Momento de Lazer Offline",
  ],
};

const AUTO_TEMPLATES = [
  // Mente
  { name: "Leitura Focada de Livro", area: "Mente", type: "timer", target: "20", unit: "min", diff: "Rank A", icon: "⚡", freq: "Diário" },
  { name: "Estudo de Programação & Lógica", area: "Mente", type: "timer", target: "30", unit: "min", diff: "Rank A", icon: "⚡", freq: "Diário" },
  { name: "Meditação & Respiração Consciente", area: "Mente", type: "timer", target: "10", unit: "min", diff: "Rank B", icon: "⚡", freq: "Diário" },
  { name: "Revisão dos Objetivos da Semana", area: "Mente", type: "check", target: "1", unit: "check", diff: "Rank B", icon: "⚡", freq: "Semanal" },

  // Financeiro
  { name: "Registrar Gastos e Entradas", area: "Financeiro", type: "check", target: "1", unit: "check", diff: "Rank B", icon: "⚡", freq: "Diário" },
  { name: "Economia e Aporte Diário", area: "Financeiro", type: "counter", target: "20", unit: "R$", diff: "Rank B", icon: "⚡", freq: "Diário" },
  { name: "Estudo de Finanças & Alocação", area: "Financeiro", type: "timer", target: "15", unit: "min", diff: "Rank A", icon: "⚡", freq: "Diário" },
  { name: "Auditoria Mensal do Patrimônio", area: "Financeiro", type: "check", target: "1", unit: "check", diff: "Rank S", icon: "⚡", freq: "Mensal" },

  // Corpo
  { name: "Treino Físico (Calistenia/Academia)", area: "Corpo", type: "timer", target: "40", unit: "min", diff: "Rank A", icon: "⚡", freq: "Diário" },
  { name: "Hidratação Essencial (2.5L)", area: "Corpo", type: "counter", target: "2500", unit: "ml", diff: "Rank B", icon: "⚡", freq: "Diário" },
  { name: "Caminhada Rápida (6.000 Passos)", area: "Corpo", type: "counter", target: "6000", unit: "passos", diff: "Rank B", icon: "⚡", freq: "Diário" },
  { name: "Alongamento & Mobilidade Matinal", area: "Corpo", type: "timer", target: "15", unit: "min", diff: "Rank B", icon: "⚡", freq: "Diário" },

  // Humor
  { name: "Diário Noturno & 3 Gratidões", area: "Humor", type: "check", target: "1", unit: "check", diff: "Rank C", icon: "⚡", freq: "Diário" },
  { name: "Detox de Telas Pré-Sono", area: "Humor", type: "timer", target: "45", unit: "min", diff: "Rank B", icon: "⚡", freq: "Diário" },
  { name: "Conversa com Amigo / Família", area: "Humor", type: "check", target: "1", unit: "check", diff: "Rank B", icon: "⚡", freq: "Diário" },
  { name: "Pausa Criativa sem Distrações", area: "Humor", type: "timer", target: "20", unit: "min", diff: "Rank B", icon: "⚡", freq: "Diário" },
];

export default function HabitPage({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { create, habit } = route.params || {};

  // Form States
  const [habitArea, setHabitArea] = useState(habit?.habitArea || "Mente");
  const [habitName, setHabitName] = useState(habit?.habitName || "");
  const [frequency, setFrequency] = useState(habit?.habitFrequency || "Diário");
  const [selectedWeekday, setSelectedWeekday] = useState(
    habit?.habitNotificationFrequency || "Segunda-feira"
  );
  const [habitType, setHabitType] = useState(habit?.habitType || "check");
  const [targetValue, setTargetValue] = useState(
    habit?.targetValue ? String(habit.targetValue) : "1"
  );
  const [unit, setUnit] = useState(habit?.unit || "");
  const [difficulty, setDifficulty] = useState(habit?.difficulty || "Rank B");
  const [selectedIcon, setSelectedIcon] = useState(habit?.icon || "⚡");

  // Notificações
  const [hasNotification, setHasNotification] = useState(
    habit?.habitHasNotification === 1 || false
  );
  const [notificationTime, setNotificationTime] = useState(
    habit?.habitNotificationTime || "08:00"
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Modal HUD State
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

  // Alerta de Sobrecarga Cognitiva (se já existirem muitas metas ativas)
  useEffect(() => {
    async function checkOverload() {
      if (!create) return;
      try {
        const list = await HabitsService.getAllHabits();
        if (list.length >= 6) {
          setModalConfig({
            visible: true,
            title: "ALERTA DE SOBRECARGA COGNITIVA",
            message: `Você já possui ${list.length} metas ativas no seu Core. O método de Hábitos Atômicos recomenda manter no máximo 5 a 6 rotinas diárias para evitar esgotamento de força de vontade e abandono. Deseja prosseguir com mais esta meta?`,
            type: "warning",
            confirmText: "PROSSEGUIR COM DISCIPLINA",
            cancelText: "REVISAR METAS",
            onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
            onCancel: () => {
              setModalConfig((prev) => ({ ...prev, visible: false }));
              navigation.goBack();
            },
          });
        }
      } catch (_) {}
    }
    checkOverload();
  }, [create]);

  useEffect(() => {
    if (habitType === "timer" && !habit?.targetValue) {
      setTargetValue("25");
      setUnit("min");
    } else if (habitType === "counter" && !habit?.targetValue) {
      setTargetValue("2000");
      setUnit("ml");
    }
  }, [habitType]);

  const handleAreaChange = (area) => {
    SoundService.playClick();
    setHabitArea(area);
  };

  const handleSuggestionPress = (text) => {
    SoundService.playClick();
    setHabitName(text);
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      const h = selectedDate.getHours().toString().padStart(2, "0");
      const m = selectedDate.getMinutes().toString().padStart(2, "0");
      setNotificationTime(`${h}:${m}`);
    }
  };

  const handleTestNotification = async () => {
    SoundService.playClick();
    try {
      await NotificationService.sendTestNotification(habitName || "Meta de Teste");
      setModalConfig({
        visible: true,
        title: "DISPARO DE NOTIFICAÇÃO",
        message: "Notificação de teste enviada! Verifique a barra superior do seu dispositivo.",
        type: "success",
        confirmText: "OK",
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    } catch (_) {
      setModalConfig({
        visible: true,
        title: "ERRO DE NOTIFICAÇÃO",
        message: "Não foi possível disparar a notificação de teste.",
        type: "danger",
        confirmText: "FECHAR",
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  // Gerador Inteligente Automático (sem repetições)
  const handleAutoGenerate = async () => {
    SoundService.playClick();
    try {
      const existing = await HabitsService.getAllHabits();
      const existingNames = new Set(
        existing.map((h) => (h.habitName || "").toLowerCase().trim())
      );

      let available = AUTO_TEMPLATES.filter(
        (t) => t.area === habitArea && !existingNames.has(t.name.toLowerCase().trim())
      );

      if (available.length === 0) {
        available = AUTO_TEMPLATES.filter(
          (t) => !existingNames.has(t.name.toLowerCase().trim())
        );
      }

      if (available.length === 0) {
        setModalConfig({
          visible: true,
          title: "ROTINAS ESGOTADAS",
          message: "Você já cobriu todas as rotinas pré-calibradas do sistema! Digite um nome customizado para esta nova meta.",
          type: "info",
          confirmText: "ENTENDIDO",
          onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
        });
        return;
      }

      const pick = available[Math.floor(Math.random() * available.length)];
      setHabitArea(pick.area);
      setHabitName(pick.name);
      setHabitType(pick.type);
      setTargetValue(pick.target);
      setUnit(pick.unit);
      setDifficulty(pick.diff);
      setSelectedIcon(pick.icon);
      setFrequency(pick.freq);

      SoundService.playCheck();
    } catch (err) {
      console.warn("Erro ao gerar automático:", err);
    }
  };

  const handleSave = async () => {
    const sanitizedName = habitName.trim().replace(/[\x00-\x1F\x7F]/g, "").slice(0, 80);
    if (!sanitizedName) {
      setModalConfig({
        visible: true,
        title: "NOME OBRIGATÓRIO",
        message: "Por favor, digite um nome ou use o botão 'Gerar Automático' para definir sua meta.",
        type: "warning",
        confirmText: "PREENCHER NOME",
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    try {
      SoundService.playCheck();
      let scheduledNotifId = habit?.notificationId || "";

      if (hasNotification) {
        scheduledNotifId = await NotificationService.createNotification(
          sanitizedName,
          frequency,
          frequency === "Semanal" ? selectedWeekday : "Diário",
          notificationTime,
          habit?.id
        );
      } else if (habit?.notificationId) {
        await NotificationService.deleteNotification(habit.notificationId);
        scheduledNotifId = "";
      }

      const sanitizedTarget = Math.max(1, Math.min(99999, parseFloat(targetValue) || 1));
      const sanitizedUnit = (unit || "").trim().replace(/[\x00-\x1F\x7F]/g, "").slice(0, 15);

      const habitData = {
        id: habit?.id,
        habitArea,
        habitName: sanitizedName,
        habitFrequency: frequency,
        habitHasNotification: hasNotification ? 1 : 0,
        habitNotificationFrequency: frequency === "Semanal" ? selectedWeekday : "Diário",
        habitNotificationTime: notificationTime,
        habitType,
        targetValue: sanitizedTarget,
        unit: habitType === "check" ? "" : sanitizedUnit,
        difficulty,
        icon: selectedIcon,
        notificationId: scheduledNotifId || "",
      };

      if (create) {
        await HabitsService.createHabit({
          ...habitData,
          lastCheck: new Date().toISOString().slice(0, 10),
          daysWithoutChecks: 0,
          progressBar: 1,
          habitIsChecked: 0,
          habitChecks: 0,
          currentValue: 0,
          streak: 0,
        });
      } else {
        await HabitsService.updateHabit(habitData);
      }

      navigation.navigate("Home", { refresh: Date.now() });
    } catch (err) {
      console.error(err);
      setModalConfig({
        visible: true,
        title: "FALHA NO CORE",
        message: "Ocorreu um erro ao salvar o protocolo no banco de dados local.",
        type: "danger",
        confirmText: "FECHAR",
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  const handleDelete = () => {
    SoundService.playClick();
    setModalConfig({
      visible: true,
      title: "EXCLUIR PROTOCOLO",
      message: `Tem certeza que deseja apagar a rotina "${habit?.habitName}"? O histórico acumulado neste pilar será mantido no seu perfil.`,
      type: "danger",
      confirmText: "EXCLUIR DEFINITIVAMENTE",
      cancelText: "CANCELAR",
      onCancel: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      onConfirm: async () => {
        try {
          if (habit?.notificationId) {
            await NotificationService.deleteNotification(habit.notificationId);
          }
          await HabitsService.deleteByName({ id: habit.id });
          setModalConfig((prev) => ({ ...prev, visible: false }));
          navigation.navigate("Home", { refresh: Date.now() });
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            SoundService.playClick();
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          {create ? "Forjar Protocolo" : "Ajustar Protocolo"}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* BOTÃO GERAR AUTOMÁTICO */}
        {create && (
          <View style={styles.autoGenerateContainer}>
            <TouchableOpacity
              style={styles.autoGenerateBtn}
              onPress={handleAutoGenerate}
              activeOpacity={0.8}
            >
              <Text style={styles.autoGenerateBtnText}>+ Gerar Automático (Sugestão Inteligente)</Text>
            </TouchableOpacity>
            <Text style={styles.autoGenerateSub}>
              O sistema sorteia uma rotina equilibrada sem repetir o que você já faz.
            </Text>
          </View>
        )}

        {/* 1. ESCOLHA DO PILAR */}
        <Text style={styles.label}>1. Selecione o Pilar Vital:</Text>
        <View style={styles.areaRow}>
          {[
            { name: "Mente", color: "#00F0FF" },
            { name: "Financeiro", color: "#10B981" },
            { name: "Corpo", color: "#FF3366" },
            { name: "Humor", color: "#F59E0B" },
          ].map((area) => {
            const isSel = habitArea === area.name;
            return (
              <TouchableOpacity
                key={area.name}
                style={[
                  styles.areaBtn,
                  isSel && { borderColor: area.color, backgroundColor: `${area.color}22` },
                ]}
                onPress={() => handleAreaChange(area.name)}
              >
                <Text
                  style={[
                    styles.areaBtnText,
                    isSel && { color: area.color, fontWeight: "bold" },
                  ]}
                >
                  {area.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. TIPO DE META */}
        <Text style={styles.label}>2. Natureza da Meta (Como vai medir?):</Text>
        <View style={styles.typeRow}>
          {[
            { id: "check", label: "Check Simples" },
            { id: "timer", label: "Foco / Timer" },
            { id: "counter", label: "Contador" },
          ].map((t) => {
            const isSel = habitType === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeBtn, isSel && styles.typeBtnActive]}
                onPress={() => {
                  SoundService.playClick();
                  setHabitType(t.id);
                }}
              >
                <Text
                  style={[styles.typeBtnText, isSel && styles.typeBtnTextActive]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. ÍCONE DO PROTOCOLO */}
        <Text style={styles.label}>3. Escolha o Glifo do Protocolo:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.iconScroll}
        >
          {ICONS.map((icon) => {
            const isSel = selectedIcon === icon;
            return (
              <TouchableOpacity
                key={icon}
                style={[styles.iconPill, isSel && styles.iconPillActive]}
                onPress={() => {
                  SoundService.playClick();
                  setSelectedIcon(icon);
                }}
              >
                <Text style={styles.iconEmoji}>{icon}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 4. NOME DA META */}
        <Text style={styles.label}>4. Nome da Meta:</Text>
        <TextInput
          style={styles.input}
          value={habitName}
          onChangeText={setHabitName}
          maxLength={80}
          placeholder="Ex: Ler 15 minutos de finanças..."
          placeholderTextColor="#64748B"
        />

        {/* SUGESTÕES RÁPIDAS */}
        <Text style={styles.subLabel}>Sugestões rápidas para {habitArea}:</Text>
        <View style={styles.chipsContainer}>
          {PRESET_SUGGESTIONS[habitArea]?.map((sug, i) => (
            <TouchableOpacity
              key={i}
              style={styles.suggestionChip}
              onPress={() => handleSuggestionPress(sug)}
            >
              <Text style={styles.suggestionText}>{sug}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 5. CONFIGURAÇÃO DE TEMPO OU CONTADOR */}
        {habitType !== "check" && (
          <View style={styles.numericConfigBox}>
            <Text style={styles.label}>
              {habitType === "timer"
                ? "5. Meta de Tempo (Minutos):"
                : "5. Alvo Quantitativo & Unidade:"}
            </Text>
            <View style={styles.numInputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 10 }]}
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="numeric"
                maxLength={8}
                placeholder={habitType === "timer" ? "Ex: 25" : "Ex: 2000"}
                placeholderTextColor="#64748B"
              />
              <TextInput
                style={[styles.input, { width: 110 }]}
                value={unit}
                onChangeText={setUnit}
                maxLength={15}
                placeholder="Unidade (min, ml...)"
                placeholderTextColor="#64748B"
              />
            </View>
          </View>
        )}

        {/* 6. FREQUÊNCIA TÁTIL */}
        <Text style={styles.label}>6. Frequência de Execução:</Text>
        <View style={styles.freqRow}>
          {["Diário", "Semanal", "Mensal"].map((f) => {
            const isSel = frequency === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.freqBtn, isSel && styles.freqBtnActive]}
                onPress={() => {
                  SoundService.playClick();
                  setFrequency(f);
                }}
              >
                <Text
                  style={[styles.freqBtnText, isSel && styles.freqBtnTextActive]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SELETOR DE DIA DA SEMANA */}
        {frequency === "Semanal" && (
          <View style={styles.weekdaysBox}>
            <Text style={styles.subLabel}>Dia da semana:</Text>
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((day, idx) => {
                const isSel = selectedWeekday === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayCircle,
                      isSel && styles.dayCircleActive,
                    ]}
                    onPress={() => {
                      SoundService.playClick();
                      setSelectedWeekday(day);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayCircleText,
                        isSel && styles.dayCircleTextActive,
                      ]}
                    >
                      {WEEKDAYS_SHORT[idx]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 7. DIFICULDADE & XP */}
        <Text style={styles.label}>7. Nível de Dificuldade (Recompensa):</Text>
        <View style={styles.diffRow}>
          {[
            { rank: "Rank C", xp: "+20 XP" },
            { rank: "Rank B", xp: "+45 XP" },
            { rank: "Rank A", xp: "+80 XP" },
            { rank: "Rank S", xp: "+150 XP" },
          ].map((item) => {
            const isSel = difficulty === item.rank;
            return (
              <TouchableOpacity
                key={item.rank}
                style={[styles.diffBtn, isSel && styles.diffBtnActive]}
                onPress={() => {
                  SoundService.playClick();
                  setDifficulty(item.rank);
                }}
              >
                <Text
                  style={[styles.diffRank, isSel && styles.diffRankActive]}
                >
                  {item.rank}
                </Text>
                <Text style={styles.diffXp}>{item.xp}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 8. NOTIFICAÇÕES & ALARME */}
        <View style={styles.notifCard}>
          <View style={styles.notifHeader}>
            <View>
              <Text style={styles.notifTitle}>Notificação & Lembrete</Text>
              <Text style={styles.notifDesc}>
                {hasNotification
                  ? `Alarme agendado para às ${notificationTime}`
                  : "Desativado"}
              </Text>
            </View>
            <Switch
              value={hasNotification}
              onValueChange={(val) => {
                SoundService.playClick();
                setHasNotification(val);
              }}
              thumbColor={hasNotification ? "#00F0FF" : "#555"}
              trackColor={{ false: "#333", true: "rgba(0, 240, 255, 0.3)" }}
            />
          </View>

          {hasNotification && (
            <View style={styles.notifBody}>
              <View style={styles.quickTimeRow}>
                {["07:30", "13:00", "20:30"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.quickTimeBtn,
                      notificationTime === t && styles.quickTimeBtnActive,
                    ]}
                    onPress={() => {
                      SoundService.playClick();
                      setNotificationTime(t);
                    }}
                  >
                    <Text
                      style={[
                        styles.quickTimeText,
                        notificationTime === t && styles.quickTimeTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.customTimeBtn}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.customTimeText}>Definir Horário</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTestNotification}
              >
                <Text style={styles.testBtnText}>Testar Notificação Agora</Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>
          )}
        </View>

        {/* BOTÃO SALVAR */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>
            {create ? "Ativar Protocolo no Core" : "Atualizar Protocolo"}
          </Text>
        </TouchableOpacity>

        {/* BOTÃO EXCLUIR */}
        {!create && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Excluir Este Protocolo</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: "#00F0FF",
    fontSize: 16,
    fontWeight: "700",
  },
  topBarTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 16,
  },
  autoGenerateContainer: {
    backgroundColor: "rgba(0, 240, 255, 0.05)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
    marginBottom: 16,
  },
  autoGenerateBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0, 240, 255, 0.15)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00F0FF",
    alignItems: "center",
    marginBottom: 6,
  },
  autoGenerateBtnText: {
    color: "#00F0FF",
    fontSize: 12.5,
    fontWeight: "800",
  },
  autoGenerateSub: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
  },
  label: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 12,
  },
  subLabel: {
    color: "#64748B",
    fontSize: 11.5,
    marginBottom: 8,
  },
  areaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  areaBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#0D131F",
    alignItems: "center",
  },
  areaBtnText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#0D131F",
    alignItems: "center",
  },
  typeBtnActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.12)",
  },
  typeBtnText: {
    color: "#64748B",
    fontSize: 11.5,
    fontWeight: "600",
  },
  typeBtnTextActive: {
    color: "#00F0FF",
    fontWeight: "700",
  },
  iconScroll: {
    flexDirection: "row",
    marginBottom: 10,
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#0D131F",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  iconPillActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.2)",
  },
  iconEmoji: {
    fontSize: 18,
    color: "#00F0FF",
  },
  input: {
    backgroundColor: "#0D131F",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 8,
    color: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  suggestionText: {
    color: "#94A3B8",
    fontSize: 11,
  },
  numericConfigBox: {
    marginVertical: 4,
  },
  numInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  freqRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  freqBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#0D131F",
    alignItems: "center",
  },
  freqBtnActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.12)",
  },
  freqBtnText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  freqBtnTextActive: {
    color: "#00F0FF",
    fontWeight: "700",
  },
  weekdaysBox: {
    backgroundColor: "#0D131F",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleActive: {
    borderColor: "#00F0FF",
    backgroundColor: "#00F0FF",
  },
  dayCircleText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "700",
  },
  dayCircleTextActive: {
    color: "#05080F",
  },
  diffRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  diffBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#0D131F",
    alignItems: "center",
  },
  diffBtnActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.12)",
  },
  diffRank: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 2,
  },
  diffRankActive: {
    color: "#00F0FF",
  },
  diffXp: {
    fontSize: 10,
    color: "#64748B",
  },
  notifCard: {
    backgroundColor: "#0D131F",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 10,
  },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  notifDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  notifBody: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    paddingTop: 10,
  },
  quickTimeRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  quickTimeBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#080C14",
    alignItems: "center",
  },
  quickTimeBtnActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.12)",
  },
  quickTimeText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  quickTimeTextActive: {
    color: "#00F0FF",
    fontWeight: "700",
  },
  customTimeBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#080C14",
    alignItems: "center",
  },
  customTimeText: {
    fontSize: 10.5,
    color: "#64748B",
    fontWeight: "600",
  },
  testBtn: {
    paddingVertical: 9,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  testBtnText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#00F0FF",
    alignItems: "center",
    marginTop: 16,
  },
  saveBtnText: {
    color: "#05080F",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  deleteBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 51, 102, 0.1)",
    borderWidth: 1,
    borderColor: "#FF3366",
    alignItems: "center",
    marginTop: 10,
  },
  deleteBtnText: {
    color: "#FF3366",
    fontSize: 12.5,
    fontWeight: "700",
  },
});
