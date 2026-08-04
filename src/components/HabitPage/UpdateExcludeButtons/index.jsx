import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import HabitsService from "../../../services/HabitsService";
import NotificationService from "../../../services/NotificationService";

export default function UpdateExcludeButtons({
  habitInput,
  handleUpdate,
  habitArea,
  habitName,
  habitObj,
}) {
  const navigation = useNavigation();

  function HandleDeleteHabit() {
    HabitsService.deleteByName({
      id: habitObj?.id,
      habitArea: habitArea,
      habitName: habitName,
    })
      .then(() => {
        Alert.alert("OneBitLife", "Hábito excluído com sucesso!");
        NotificationService.deleteNotification(habitName);
        navigation.navigate("Home", {
          deletedHabit: `${habitName || habitArea}`,
        });
      })
      .catch((err) => console.log(err));
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.updateButton}
        activeOpacity={0.8}
        onPress={() => {
          Alert.alert(
            "Atualizar Hábito",
            "Deseja salvar as alterações neste hábito?",
            [
              {
                text: "Cancelar",
                style: "cancel",
              },
              {
                text: "Atualizar",
                onPress: handleUpdate,
              },
            ]
          );
        }}
      >
        <Text style={styles.updateButtonText}>Atualizar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.trashButton}
        activeOpacity={0.8}
        onPress={() => {
          Alert.alert(
            "Excluir Hábito",
            `Tem certeza que deseja excluir "${habitName || "este hábito"}"?`,
            [
              {
                text: "Cancelar",
                style: "cancel",
              },
              {
                text: "Excluir",
                style: "destructive",
                onPress: HandleDeleteHabit,
              },
            ]
          );
        }}
      >
        <Image
          source={require("../../../assets/icons/trash.png")}
          style={styles.trashIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
    justifyContent: "center",
  },
  updateButton: {
    borderWidth: 1.5,
    borderColor: "#90B7F3",
    backgroundColor: "rgba(144, 183, 243, 0.15)",
    width: 160,
    height: 50,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  trashButton: {
    borderWidth: 1.5,
    borderColor: "#FF0044",
    backgroundColor: "rgba(255, 0, 68, 0.15)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 50,
  },
  trashIcon: {
    width: 24,
    height: 24,
  },
});