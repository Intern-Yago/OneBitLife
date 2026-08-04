import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import HabitsData from "../../../Database/HabitData";

export default function SelectHabit({ habit, habitInput }) {
  const [textValue, setTextValue] = useState(habit?.habitName || "");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    let list = [];
    if (habit?.habitArea === "Mente") {
      list = HabitsData.dataMind || [];
    } else if (habit?.habitArea === "Financeiro") {
      list = HabitsData.dataMoney || [];
    } else if (habit?.habitArea === "Corpo") {
      list = HabitsData.dataBody || [];
    } else if (habit?.habitArea === "Humor") {
      list = HabitsData.dataFun || [];
    }
    setSuggestions(list);

    if (habit?.habitName) {
      setTextValue(habit.habitName);
      habitInput(habit.habitName);
    }
  }, [habit]);

  const handleChangeText = (text) => {
    setTextValue(text);
    habitInput(text);
  };

  const handleSelectSuggestion = (val) => {
    setTextValue(val);
    habitInput(val);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={textValue}
        onChangeText={handleChangeText}
        placeholder="Digite o nome da sua meta personalizada..."
        placeholderTextColor="#777777"
      />

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsLabel}>💡 Ou escolha uma sugestão rápida:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {suggestions.map((item, index) => {
              const val = typeof item === "string" ? item : item.value || item.key;
              const isSelected = textValue === val;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                  ]}
                  onPress={() => handleSelectSuggestion(val)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {val}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: "#90B7F3",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFFFFF",
    fontSize: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsLabel: {
    color: "#BBBBBB",
    fontSize: 13,
    marginBottom: 8,
  },
  chipsScroll: {
    paddingRight: 10,
  },
  chip: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: "rgba(144, 183, 243, 0.25)",
    borderColor: "#90B7F3",
  },
  chipText: {
    color: "#DDDDDD",
    fontSize: 13,
  },
  chipTextSelected: {
    color: "#90B7F3",
    fontWeight: "bold",
  },
});
