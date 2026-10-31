import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DailyChallengeService from "../../../services/DailyChallengeService";
import SoundService from "../../../services/SoundService";

export default function DailyChallengesCard({ onChallengeDone }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChallenges = async () => {
    try {
      const list = await DailyChallengeService.getTodayChallenges();
      setChallenges(list);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleComplete = async (challenge) => {
    if (challenge.completed) return;
    const ok = await DailyChallengeService.completeChallenge(challenge.id);
    if (ok) {
      setChallenges((prev) =>
        prev.map((c) => (c.id === challenge.id ? { ...c, completed: 1 } : c))
      );
      if (onChallengeDone) {
        onChallengeDone(challenge);
      }
    }
  };

  if (loading || challenges.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🎲 SIDE QUESTS DO DIA</Text>
        </View>
        <Text style={styles.resetText}>Reinicia às 00:00</Text>
      </View>

      {challenges.map((c) => (
        <View
          key={c.id}
          style={[
            styles.challengeItem,
            c.completed === 1 && styles.challengeCompleted,
          ]}
        >
          <View style={styles.info}>
            <View style={styles.metaRow}>
              <Text style={styles.category}>{c.category}</Text>
              <Text style={styles.reward}>+{c.xpReward} XP</Text>
            </View>
            <Text
              style={[
                styles.title,
                c.completed === 1 && styles.titleCompleted,
              ]}
            >
              {c.title}
            </Text>
            <Text style={styles.desc}>{c.description}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkBtn,
              c.completed === 1 && styles.checkBtnDone,
            ]}
            onPress={() => handleComplete(c)}
            disabled={c.completed === 1}
          >
            <Text style={styles.checkText}>
              {c.completed === 1 ? "✓" : "O"}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "rgba(18, 24, 36, 0.9)",
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.2)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    backgroundColor: "rgba(0, 240, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#00F0FF",
  },
  badgeText: {
    color: "#00F0FF",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  resetText: {
    color: "#777777",
    fontSize: 10,
  },
  challengeItem: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 10,
    padding: 12,
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  challengeCompleted: {
    opacity: 0.6,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  info: {
    flex: 1,
    paddingRight: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  category: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "bold",
  },
  reward: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "bold",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: "#888888",
  },
  desc: {
    color: "#AAAAAA",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#00F0FF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 240, 255, 0.08)",
  },
  checkBtnDone: {
    borderColor: "#10B981",
    backgroundColor: "#10B981",
  },
  checkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
