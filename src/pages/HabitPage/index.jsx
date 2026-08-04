import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SelectHabit from "../../components/HabitPage/SelectHabit";
import Notification from "../../components/HabitPage/notification";
import TimeDatePicker from "../../components/HabitPage/timeDatePicker";
import SelectFrequency from "../../components/HabitPage/selectFrequency";
import UpdateExcludeButtons from "../../components/HabitPage/UpdateExcludeButtons";

import DefaultButton from "../../components/Common/DefaultButton";
import HabitsService from "../../services/HabitsService";
import NotificationService from "../../services/NotificationService";

export default function HabitPage({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [habitInput, setHabitInput] = useState();
  const [frequencyInput, setFrequencyInput] = useState();
  const [notificationToggle, setNotificationToggle] = useState(false);
  const [dayNotification, setDayNotification] = useState();
  const [timeNotification, setTimeNotification] = useState("12:00");

  const { create, habit } = route.params || {};

  const habitCreated = new Date();
  const month = `${habitCreated.getMonth() + 1}`.padStart(2, "0");
  const day = `${habitCreated.getDate()}`.padStart(2, "0");
  const formatDate = `${habitCreated.getFullYear()}-${month}-${day}`;

  async function handleCreateHabit() {
    if (!habitInput || !frequencyInput) {
      Alert.alert(
        "OneBitLife",
        "Você precisa selecionar um hábito e a frequência para continuar."
      );
      return;
    }

    if (notificationToggle && frequencyInput !== "Mensal" && !timeNotification) {
      Alert.alert(
        "OneBitLife",
        "Por favor, selecione o horário para a notificação!"
      );
      return;
    }

    if (
      notificationToggle &&
      frequencyInput === "Semanal" &&
      !dayNotification
    ) {
      Alert.alert(
        "OneBitLife",
        "Por favor, selecione o dia da semana para a notificação!"
      );
      return;
    }

    try {
      if (notificationToggle) {
        await NotificationService.createNotification(
          habitInput,
          frequencyInput,
          dayNotification || "Diário",
          timeNotification || "12:00"
        );
      }

      await HabitsService.createHabit({
        habitArea: habit?.habitArea,
        habitName: habitInput,
        habitFrequency: frequencyInput,
        habitHasNotification: notificationToggle ? 1 : 0,
        habitNotificationFrequency: dayNotification || "Diário",
        habitNotificationTime: timeNotification || "12:00",
        lastCheck: formatDate,
        daysWithoutChecks: 0,
        habitIsChecked: 0,
        progressBar: 1,
        habitChecks: 0,
      });

      Alert.alert("OneBitLife", "Hábito criado com sucesso!");
      navigation.navigate("Home", {
        createdHabit: `Created in ${habit?.habitArea}`,
      });
    } catch (error) {
      console.error("[HabitPage] Erro ao criar hábito:", error);
      Alert.alert("Erro", "Ocorreu um erro ao salvar o hábito.");
    }
  }

  async function handleUpdateHabit() {
    if (notificationToggle && frequencyInput !== "Mensal" && !timeNotification) {
      Alert.alert(
        "OneBitLife",
        "Você precisa informar o horário da notificação!"
      );
      return;
    }

    try {
      await HabitsService.updateHabit({
        habitArea: habit?.habitArea,
        habitName: habitInput,
        habitFrequency: frequencyInput,
        habitHasNotification: notificationToggle ? 1 : 0,
        habitNotificationFrequency: dayNotification || "Diário",
        habitNotificationTime: timeNotification || "12:00",
        habitNotificationId: notificationToggle ? habitInput : null,
      });

      // Cancela anterior e cria nova se toggle ativado
      await NotificationService.deleteNotification(habit?.habitName);
      if (notificationToggle) {
        await NotificationService.createNotification(
          habitInput,
          frequencyInput,
          dayNotification || "Diário",
          timeNotification || "12:00"
        );
      }

      Alert.alert("OneBitLife", "Hábito atualizado com sucesso!");
      navigation.navigate("Home", {
        updatedHabit: `Updated in ${habit?.habitArea}`,
      });
    } catch (error) {
      console.error("[HabitPage] Erro ao atualizar hábito:", error);
      Alert.alert("Erro", "Ocorreu um erro ao atualizar o hábito.");
    }
  }

  useEffect(() => {
    if (habit?.habitHasNotification == 1) {
      setNotificationToggle(true);
      setDayNotification(habit?.habitNotificationFrequency);
      setTimeNotification(habit?.habitNotificationTime || "12:00");
    }
  }, [habit]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <TouchableOpacity
            style={styles.backPageBtn}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../../assets/icons/arrowBack.png")}
              style={styles.arrowBack}
            />
          </TouchableOpacity>
          <View style={styles.mainContent}>
            <Text style={styles.title}>Configurações {"\n"} de hábito</Text>

            <Text style={styles.inputText}>Área</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.area}>{habit?.habitArea}</Text>
            </View>

            <Text style={styles.inputText}>Hábito</Text>
            <SelectHabit habit={habit} habitInput={setHabitInput} />

            <Text style={styles.inputText}>Frequência</Text>
            <SelectFrequency
              habitFrequency={habit?.habitFrequency}
              frequencyInput={setFrequencyInput}
            />

            {frequencyInput === "Mensal" ? null : (
              <Notification
                notificationToggle={notificationToggle}
                setNotificationToggle={setNotificationToggle}
              />
            )}

            {notificationToggle && frequencyInput !== "Mensal" && (
              <TimeDatePicker
                frequency={frequencyInput}
                dayNotification={dayNotification}
                timeNotification={timeNotification}
                setDayNotification={setDayNotification}
                setTimeNotification={setTimeNotification}
                habitInput={habitInput}
              />
            )}

            {create === false ? (
              <UpdateExcludeButtons
                handleUpdate={handleUpdateHabit}
                habitArea={habit?.habitArea}
                habitName={habit?.habitName}
                habitInput={habitInput}
              />
            ) : (
              <View style={styles.configButton}>
                <DefaultButton
                  buttonText={"Criar"}
                  handlePress={handleCreateHabit}
                  width={250}
                  height={50}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(21, 21, 21, 0.98)",
  },
  backPageBtn: {
    width: 40,
    height: 40,
    marginHorizontal: 25,
    marginTop: 15,
    marginBottom: 10,
  },
  arrowBack: {
    width: 35,
    height: 35,
  },
  mainContent: {
    width: 280,
    alignSelf: "center",
  },
  configButton: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    fontSize: 28,
  },
  inputText: {
    color: "white",
    fontSize: 16,
    marginTop: 25,
    marginBottom: 8,
    marginLeft: 5,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  area: {
    color: "#90B7F3",
    fontSize: 16,
    fontWeight: "bold",
  },
});