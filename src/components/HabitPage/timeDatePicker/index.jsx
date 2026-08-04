import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text, Image, Platform } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import NotificationService from "../../../services/NotificationService";

export default function TimeDataPicker({
  frequency,
  dayNotification,
  timeNotification,
  setDayNotification,
  setTimeNotification,
  habitInput,
}) {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("time");
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(dayNotification || "Segunda");
  const [notificationDate, setNotificationDate] = useState(dayNotification || (frequency === "Diário" ? "Diário" : "Segunda"));
  const [notificationTime, setNotificationTime] = useState(timeNotification || "12:00");

  useEffect(() => {
    if (dayNotification) {
      setSelected(dayNotification);
      setNotificationDate(dayNotification);
    } else if (frequency === "Diário") {
      setDayNotification("Diário");
      setNotificationDate("Diário");
    }

    if (timeNotification) {
      setNotificationTime(timeNotification);
    } else {
      setTimeNotification("12:00");
    }
  }, [dayNotification, timeNotification, frequency]);

  const onChangeTime = (event, selectDate) => {
    setShow(Platform.OS === "ios");
    if (event?.type === "dismissed") {
      return;
    }
    const currentDate = selectDate || date;
    setDate(currentDate);
    const notficationHour = currentDate.getHours().toString().padStart(2, "0");
    const notficationMin = currentDate.getMinutes().toString().padStart(2, "0");
    const formattedTime = `${notficationHour}:${notficationMin}`;

    setNotificationTime(formattedTime);
    setTimeNotification(formattedTime);

    if (frequency === "Diário") {
      setDayNotification("Diário");
      setNotificationDate("Diário");
    }
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const data = [
    { key: "Domingo", value: "Domingo" },
    { key: "Segunda", value: "Segunda" },
    { key: "Terça", value: "Terça" },
    { key: "Quarta", value: "Quarta" },
    { key: "Quinta", value: "Quinta" },
    { key: "Sexta", value: "Sexta" },
    { key: "Sábado", value: "Sábado" },
  ];

  const handleSelectDay = (val) => {
    setSelected(val);
    setNotificationDate(val);
    setDayNotification(val);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => showMode("time")}>
        <Text style={styles.buttonText}>⏰ Selecionar Horário ({notificationTime || "12:00"})</Text>
      </TouchableOpacity>

      <View style={styles.textContainer}>
        {frequency === "Diário" ? (
          <Text style={styles.notificationText}>Dia: <Text style={styles.highlightText}>Diário</Text></Text>
        ) : null}

        {frequency === "Semanal" ? (
          <View style={styles.selectWrapper}>
            <Text style={styles.labelText}>Selecione o dia da semana:</Text>
            <SelectList
              data={data}
              search={false}
              setSelected={handleSelectDay}
              placeholder={selected}
              boxStyles={styles.boxStyle}
              inputStyles={styles.inputStyle}
              dropdownStyles={styles.dropdownStyle}
              dropdownItemStyles={styles.dropdownItemStyle}
              dropdownTextStyles={styles.dropdownTextStyle}
              arrowicon={
                <Image
                  source={require("../../../assets/icons/arrowDropdown.png")}
                  style={styles.arrow}
                />
              }
            />
          </View>
        ) : null}

        <View style={styles.infoBadge}>
          <Text style={styles.notificationText}>
            🔔 Horário definido: <Text style={styles.highlightText}>{notificationTime || "Não definido"}</Text>
          </Text>
          {frequency === "Semanal" && (
            <Text style={styles.notificationText}>
              📅 Dia definido: <Text style={styles.highlightText}>{notificationDate || "Não definido"}</Text>
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.testBtn}
          onPress={() => NotificationService.sendTestNotification(habitInput)}
        >
          <Text style={styles.testBtnText}>⚡ Testar Notificação Agora</Text>
        </TouchableOpacity>
      </View>

      {show && (
        <DateTimePicker
          testID="DateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChangeTime}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  button: {
    borderWidth: 1.5,
    borderColor: "#90B7F3",
    backgroundColor: "rgba(144, 183, 243, 0.1)",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  textContainer: {
    marginVertical: 15,
  },
  labelText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 8,
  },
  selectWrapper: {
    marginBottom: 15,
  },
  infoBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#90B7F3",
    marginVertical: 10,
  },
  notificationText: {
    fontSize: 15,
    color: "#E0E0E0",
    marginVertical: 2,
  },
  highlightText: {
    color: "#90B7F3",
    fontWeight: "bold",
  },
  boxStyle: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  inputStyle: {
    color: "#FFFFFF",
  },
  dropdownStyle: {
    backgroundColor: "#1E1E1E",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  dropdownItemStyle: {
    paddingVertical: 10,
  },
  dropdownTextStyle: {
    color: "#FFFFFF",
  },
  arrow: {
    width: 18,
    height: 18,
    tintColor: "#FFFFFF",
  },
  testBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderWidth: 1,
    borderColor: "#FFD700",
    alignItems: "center",
  },
  testBtnText: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 14,
  },
});