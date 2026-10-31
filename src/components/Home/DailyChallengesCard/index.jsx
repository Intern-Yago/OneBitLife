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
      SoundService.playCheck();
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
          <Text style={styles.badgeText}>[SIDE QUESTS DO DIA]</Text>
        </View>
        <Text style={styles.resetText}>Reinicia diariamente às 00:00</Text>
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
    backgroundColor: "#0D131F",
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
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "rgba(0, 240, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
  },
  badgeText: {
    color: "#00F0FF",
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  resetText: {
    color: "#64748B",
    fontSize: 10.5,
  },
  challengeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#080C14",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  challengeCompleted: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  category: {
    color: "#64748B",
    fontSize: 10.5,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  reward: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },
  titleCompleted: {
    color: "#64748B",
    textDecorationLine: "line-through",
  },
  desc: {
    color: "#94A3B8",
    fontSize: 11.5,
    lineHeight: 16,
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(0, 240, 255, 0.4)",
    backgroundColor: "rgba(0, 240, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkBtnDone: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  checkText: {
    color: "#00F0FF",
    fontWeight: "900",
    fontSize: 14,
  },
});
