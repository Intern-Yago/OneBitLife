import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import HabitsService from "../../services/HabitsService";
import NotificationService from "../../services/NotificationService";
import SoundService from "../../services/SoundService";

const ICONS = ["⚡", "📚", "💻", "🏋️", "💧", "💰", "🧘", "🥗", "🎯", "🛡️", "🏃", "🍎"];

const PRESET_SUGGESTIONS = {
  Mente: [
    "Ler livro de desenvolvimento",
    "Estudo focado de programação",
    "Praticar novo idioma",
    "Escrever diário / reflexão",
    "Trabalhar em projeto pessoal",
  ],
  Financeiro: [
    "Auditar gastos do dia no app",
    "Aportar na reserva de emergência",
    "Estudar sobre fundos imobiliários",
    "Enviar propostas de freela",
    "Revisar metas mensais de poupança",
  ],
  Corpo: [
    "Treino de musculação ou calistenia",
    "Beber 2.500ml de água",
    "Caminhada matinal de 20 minutos",
    "Alongamento e mobilidade",
    "Dormir 8 horas de qualidade",
  ],
  Humor: [
    "10 minutos de respiração consciente",
    "Conversar com um grande amigo",
    "Sair para uma pausa ao ar livre",
    "Jogar videogame por 30 minutos",
    "Anotar 3 motivos de gratidão",
  ],
};

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const WEEKDAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function HabitPage({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { create = true, habit } = route.params || {};

  // Estados principais da Meta
  const [habitArea, setHabitArea] = useState(habit?.habitArea || "Mente");
  const [habitName, setHabitName] = useState(habit?.habitName || "");
  const [habitType, setHabitType] = useState(habit?.habitType || "check");
  const [selectedIcon, setSelectedIcon] = useState(habit?.icon || "⚡");
  const [difficulty, setDifficulty] = useState(habit?.difficulty || "Rank B");

  // Parâmetros numéricos (tempo / contador)
  const [targetValue, setTargetValue] = useState(
    habit?.targetValue ? String(habit.targetValue) : habitType === "timer" ? "25" : "2000"
  );
  const [unit, setUnit] = useState(
    habit?.unit || (habitType === "timer" ? "min" : "ml")
  );

  // Frequência
  const [frequency, setFrequency] = useState(habit?.habitFrequency || "Diário");
  const [selectedWeekday, setSelectedWeekday] = useState(
    habit?.habitNotificationFrequency || "Segunda"
  );

  // Notificações
  const [hasNotification, setHasNotification] = useState(
    habit?.habitHasNotification === 1 || false
  );
  const [notificationTime, setNotificationTime] = useState(
    habit?.habitNotificationTime || "08:00"
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

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
    await NotificationService.sendTestNotification(habitName || "Meta de Teste");
  };

  const handleSave = async () => {
    const sanitizedName = habitName.trim().replace(/[\x00-\x1F\x7F]/g, "").slice(0, 80);
    if (!sanitizedName) {
      Alert.alert("OneBitLife", "Por favor, digite um nome válido para a sua meta.");
      return;
    }

    try {
      SoundService.playCheck();
      let scheduledNotifId = habit?.notificationId || "";

      // Atualiza notificação se ativado
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
        Alert.alert("Sucesso!", `Protocolo "${habitName.trim()}" ativado no Core!`);
      } else {
        await HabitsService.updateHabit(habitData);
        Alert.alert("Atualizado!", "Protocolo atualizado com sucesso!");
      }

      navigation.navigate("Home", { refresh: Date.now() });
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Ocorreu uma falha ao salvar o hábito.");
    }
  };

  const handleDelete = () => {
    SoundService.playClick();
    Alert.alert(
      "Excluir Protocolo",
      `Tem certeza que deseja apagar "${habit?.habitName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              if (habit?.notificationId) {
                await NotificationService.deleteNotification(habit.notificationId);
              }
              await HabitsService.deleteByName({ id: habit.id });
              navigation.navigate("Home", { refresh: Date.now() });
            } catch (err) {
              console.error(err);
            }
          },
        },
      ]
    );
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
          {create ? "⚡ Forjar Protocolo" : "⚙️ Ajustar Protocolo"}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
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
            { id: "check", label: "⚡ Check Simples" },
            { id: "timer", label: "⏱️ Foco / Tempo" },
            { id: "counter", label: "🔢 Contador" },
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

        {/* 3. ÍCONE NEON */}
        <Text style={styles.label}>3. Escolha o Ícone do Protocolo:</Text>
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
          placeholderTextColor="#666666"
        />

        {/* SUGESTÕES RÁPIDAS */}
        <Text style={styles.subLabel}>💡 Sugestões rápidas para {habitArea}:</Text>
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
                placeholderTextColor="#666"
              />
              <TextInput
                style={[styles.input, { width: 100 }]}
                value={unit}
                onChangeText={setUnit}
                maxLength={15}
                placeholder="Unidade (min, ml...)"
                placeholderTextColor="#666"
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

        {/* SELETOR DE DIA DA SEMANA EM CHIPS REDONDOS */}
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
              <Text style={styles.notifTitle}>⏰ Notificação & Lembrete</Text>
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
                <Text style={styles.testBtnText}>🔔 Testar Notificação Agora</Text>
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
            {create ? "⚡ Ativar Protocolo no Core" : "💾 Atualizar Protocolo"}
          </Text>
        </TouchableOpacity>

        {/* BOTÃO EXCLUIR */}
        {!create && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>🗑️ Excluir Meta</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0E14",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backBtnText: {
    color: "#00F0FF",
    fontSize: 16,
    fontWeight: "bold",
  },
  topBarTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 8,
  },
  subLabel: {
    color: "#888888",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 6,
  },
  areaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  areaBtn: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: "#121824",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  areaBtnText: {
    color: "#AAAAAA",
    fontSize: 12,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeBtn: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: "#121824",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  typeBtnActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.12)",
  },
  typeBtnText: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "600",
  },
  typeBtnTextActive: {
    color: "#00F0FF",
    fontWeight: "bold",
  },
  iconScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#121824",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  iconPillActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.2)",
  },
  iconEmoji: {
    fontSize: 22,
  },
  input: {
    backgroundColor: "#121824",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    color: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  suggestionChip: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  suggestionText: {
    color: "#AAAAAA",
    fontSize: 11,
  },
  numericConfigBox: {
    marginTop: 6,
  },
  numInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  freqRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  freqBtn: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: "#121824",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  freqBtnActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.12)",
  },
  freqBtnText: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "600",
  },
  freqBtnTextActive: {
    color: "#00F0FF",
    fontWeight: "bold",
  },
  weekdaysBox: {
    marginTop: 10,
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#121824",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  dayCircleActive: {
    borderColor: "#00F0FF",
    backgroundColor: "#00F0FF",
  },
  dayCircleText: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "bold",
  },
  dayCircleTextActive: {
    color: "#0B0E14",
  },
  diffRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  diffBtn: {
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: "#121824",
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  diffBtnActive: {
    borderColor: "#F59E0B",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
  },
  diffRank: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "bold",
  },
  diffRankActive: {
    color: "#F59E0B",
  },
  diffXp: {
    color: "#666666",
    fontSize: 10,
    marginTop: 2,
  },
  notifCard: {
    backgroundColor: "#121824",
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notifTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  notifDesc: {
    color: "#888888",
    fontSize: 11,
    marginTop: 2,
  },
  notifBody: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    paddingTop: 12,
  },
  quickTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickTimeBtn: {
    backgroundColor: "#0B0E14",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  quickTimeBtnActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.12)",
  },
  quickTimeText: {
    color: "#AAAAAA",
    fontSize: 12,
  },
  quickTimeTextActive: {
    color: "#00F0FF",
    fontWeight: "bold",
  },
  customTimeBtn: {
    backgroundColor: "#0B0E14",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  customTimeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  testBtn: {
    backgroundColor: "rgba(0, 240, 255, 0.1)",
    borderWidth: 1,
    borderColor: "#00F0FF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  testBtnText: {
    color: "#00F0FF",
    fontSize: 12,
    fontWeight: "bold",
  },
  saveBtn: {
    backgroundColor: "#00F0FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: {
    color: "#0B0E14",
    fontSize: 15,
    fontWeight: "bold",
  },
  deleteBtn: {
    backgroundColor: "rgba(255, 51, 102, 0.1)",
    borderWidth: 1,
    borderColor: "#FF3366",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  deleteBtnText: {
    color: "#FF3366",
    fontSize: 14,
    fontWeight: "bold",
  },
});
