import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { BOOKS_DATA } from "../../Database/BooksData";
import HabitsService from "../../services/HabitsService";
import SoundService from "../../services/SoundService";

export default function BooksTab({ onHabitAdded }) {
  const [selectedCategory, setSelectedCategory] = useState("Mente");

  const filteredBooks = BOOKS_DATA.filter(
    (b) => b.category === selectedCategory
  );

  const handleAddBookHabit = async (book) => {
    try {
      SoundService.playCheck();
      await HabitsService.createHabit({
        habitArea: book.category,
        habitName: book.suggestedGoal,
        habitFrequency: "Diário",
        habitHasNotification: 0,
        habitNotificationFrequency: "Diário",
        habitNotificationTime: "21:00",
        lastCheck: new Date().toISOString().slice(0, 10),
        daysWithoutChecks: 0,
        progressBar: 1,
        habitIsChecked: 0,
        habitChecks: 0,
        habitType: book.defaultType,
        targetValue: book.defaultTarget,
        unit: book.unit,
        difficulty: book.difficulty,
        icon: book.coverIcon,
        streak: 0,
      });

      Alert.alert(
        "Meta de Leitura Criada!",
        `"${book.title}" foi adicionado com sucesso aos seus hábitos de ${book.category}!`
      );
      if (onHabitAdded) onHabitAdded();
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível adicionar o livro aos hábitos.");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionHeader}>📚 Biblioteca de Sabedoria Cyber</Text>
      <Text style={styles.sectionSub}>
        Obras de alta performance para reprogramar seu mindset e acelerar seu progresso.
      </Text>

      {/* SELETOR DE CATEGORIA */}
      <View style={styles.categoryToggleRow}>
        <TouchableOpacity
          style={[
            styles.catBtn,
            selectedCategory === "Mente" && styles.catBtnActiveMente,
          ]}
          onPress={() => {
            SoundService.playClick();
            setSelectedCategory("Mente");
          }}
        >
          <Text
            style={[
              styles.catBtnText,
              selectedCategory === "Mente" && styles.catBtnTextActive,
            ]}
          >
            🧠 Mente, Foco & Hábitos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.catBtn,
            selectedCategory === "Financeiro" && styles.catBtnActiveFin,
          ]}
          onPress={() => {
            SoundService.playClick();
            setSelectedCategory("Financeiro");
          }}
        >
          <Text
            style={[
              styles.catBtnText,
              selectedCategory === "Financeiro" && styles.catBtnTextActive,
            ]}
          >
            💎 Finanças & Riqueza
          </Text>
        </TouchableOpacity>
      </View>

      {/* LISTA DE LIVROS */}
      {filteredBooks.map((book) => (
        <View
          key={book.id}
          style={[styles.bookCard, { borderLeftColor: book.accentColor }]}
        >
          <View style={styles.bookHeaderRow}>
            <Text style={styles.bookIcon}>{book.coverIcon}</Text>
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>Por {book.author}</Text>
              <Text style={[styles.bookTagline, { color: book.accentColor }]}>
                "{book.tagline}"
              </Text>
            </View>
          </View>

          <Text style={styles.bookDesc}>{book.description}</Text>

          <View style={styles.takeawayBox}>
            <Text style={styles.takeawayLabel}>💡 Lição-Chave:</Text>
            <Text style={styles.takeawayText}>{book.keyTakeaway}</Text>
          </View>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: book.accentColor }]}
            onPress={() => handleAddBookHabit(book)}
          >
            <Text style={styles.addBtnText}>
              ➕ Adicionar à Rotina ({book.suggestedGoal})
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  sectionSub: {
    color: "#888888",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  categoryToggleRow: {
    flexDirection: "row",
    backgroundColor: "#121824",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  catBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  catBtnActiveMente: {
    backgroundColor: "#00F0FF",
  },
  catBtnActiveFin: {
    backgroundColor: "#10B981",
  },
  catBtnText: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "bold",
  },
  catBtnTextActive: {
    color: "#0B0E14",
  },
  bookCard: {
    backgroundColor: "#121824",
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderLeftWidth: 4,
  },
  bookHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  bookAuthor: {
    color: "#888888",
    fontSize: 12,
    marginTop: 2,
  },
  bookTagline: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    fontStyle: "italic",
  },
  bookDesc: {
    color: "#CCCCCC",
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
  takeawayBox: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  takeawayLabel: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  takeawayText: {
    color: "#EEEEEE",
    fontSize: 12,
    lineHeight: 16,
  },
  addBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  addBtnText: {
    color: "#0B0E14",
    fontWeight: "bold",
    fontSize: 13,
  },
});
