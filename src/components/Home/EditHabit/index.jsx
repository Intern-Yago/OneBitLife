import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Image, StyleSheet, Text, TouchableOpacity, View, Vibration } from "react-native";
import CheckService from "../../../services/CheckService";

export default function EditHabit({ habit, frequency, habitArea, checkColor }) {
  const navigation = useNavigation();
  const [habitCheck, setHabitCheck] = useState(habit?.habitIsChecked || 0);
  const [checkImage, setCheckImage] = useState(
    require("../../../assets/icons/Mind.png")
  );

  const checkData = new Date();
  const month = `${checkData.getMonth() + 1}`.padStart(2, "0");
  const day = `${checkData.getDate()}`.padStart(2, "0");
  const formatDate = `${checkData.getFullYear()}-${month}-${day}`;

  function handleEdit() {
    navigation.navigate("HabitPage", {
      create: false,
      habit,
    });
  }

  function handleCheck() {
    if (habitCheck === 0) {
      try {
        Vibration.vibrate([0, 50, 30, 50]);
      } catch (e) {
        console.log(e);
      }
      CheckService.checkHabit({
        id: habit?.id,
        habitArea: habit?.habitArea,
        habitName: habit?.habitName,
        lastCheck: formatDate,
        habitIsChecked: 1,
        habitChecks: (habit?.habitChecks || 0) + 1,
      });
      setHabitCheck(1);
    }
  }

  useEffect(() => {
    setHabitCheck(habit?.habitIsChecked || 0);
    if (habit?.habitArea === "Financeiro") {
      setCheckImage(require("../../../assets/icons/Money.png"));
    }
    if (habit?.habitArea === "Corpo") {
      setCheckImage(require("../../../assets/icons/Body.png"));
    }
    if (habit?.habitArea === "Humor") {
      setCheckImage(require("../../../assets/icons/Fun.png"));
    }
  }, [habit]);

  const textNotification =
    habit?.habitNotificationTime == null
      ? `Sem notificação - ${habit?.habitFrequency}`
      : `${habit?.habitNotificationTime} - ${habit?.habitFrequency}`;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.button}
      onPress={handleEdit}
    >
      <View style={styles.habitText}>
        <Text style={styles.habitTitle}>{habit?.habitName}</Text>
        <Text style={styles.habitFrequency}>{textNotification}</Text>
      </View>
      {habitCheck === 0 ? (
        <TouchableOpacity
          style={[styles.check, { borderColor: checkColor }]}
          onPress={handleCheck}
        />
      ) : (
        <TouchableOpacity onPress={handleCheck}>
          <Image source={checkImage} style={styles.checked} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#151515",
    borderRadius: 8,
    width: 320,
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  habitText: {
    flex: 1,
    paddingRight: 10,
  },
  habitTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  habitFrequency: {
    color: "#AAAAAA",
    fontSize: 12,
    marginTop: 2,
  },
  check: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 12,
  },
  checked: {
    width: 26,
    height: 26,
  },
});