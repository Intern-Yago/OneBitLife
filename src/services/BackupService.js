// Serviço de Backup & Restauração Completa do Sistema OneBitLife
// Exporta e restaura todos os dados: rotinas, testes físicos, wishlist de livros, desafios e conquistas

import { Share } from "react-native";
import db from "../Database";
import NotificationService from "./NotificationService";

function getTableRows(tableName) {
  return new Promise((resolve) => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM ${tableName};`,
          [],
          (_, { rows }) => {
            resolve(rows?._array || []);
          },
          () => {
            // Se a tabela não existir ou falhar, resolve com array vazio
            resolve([]);
          }
        );
      });
    } catch (_) {
      resolve([]);
    }
  });
}

class BackupService {
  async generateBackup() {
    const [
      habits,
      changeNavigation,
      dailyChallenges,
      achievements,
      bookInterests,
      workoutAssessments,
    ] = await Promise.all([
      getTableRows("habits"),
      getTableRows("change_navigation"),
      getTableRows("daily_challenges"),
      getTableRows("achievements"),
      getTableRows("book_interests"),
      getTableRows("workout_assessments"),
    ]);

    const backupPayload = {
      appName: "OneBitLife",
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      stats: {
        habitsCount: habits.length,
        workoutsCount: workoutAssessments.length,
        booksCount: bookInterests.length,
        challengesCount: dailyChallenges.length,
      },
      data: {
        habits,
        change_navigation: changeNavigation,
        daily_challenges: dailyChallenges,
        achievements,
        book_interests: bookInterests,
        workout_assessments: workoutAssessments,
      },
    };

    return backupPayload;
  }

  async shareBackup() {
    const backup = await this.generateBackup();
    const jsonString = JSON.stringify(backup, null, 2);

    try {
      const result = await Share.share({
        title: `OneBitLife-Backup-${new Date().toISOString().slice(0, 10)}`,
        message: jsonString,
      });
      return { success: true, jsonString, stats: backup.stats, shareResult: result };
    } catch (err) {
      console.warn("[BackupService] Erro ao compartilhar:", err);
      return { success: false, jsonString, stats: backup.stats, error: err.message };
    }
  }

  validateBackup(rawInput) {
    if (!rawInput || typeof rawInput !== "string") {
      return { valid: false, error: "Conteúdo do backup vazio ou inválido." };
    }

    try {
      const parsed = JSON.parse(rawInput.trim());

      if (parsed.appName !== "OneBitLife") {
        return {
          valid: false,
          error: "Arquivo incompatível: Este backup não pertence ao OneBitLife.",
        };
      }

      if (!parsed.data || !Array.isArray(parsed.data.habits)) {
        return {
          valid: false,
          error: "Estrutura corrompida: Nenhuma rotina ou hábito foi identificado no backup.",
        };
      }

      const stats = {
        habitsCount: parsed.data.habits.length,
        workoutsCount: Array.isArray(parsed.data.workout_assessments)
          ? parsed.data.workout_assessments.length
          : 0,
        booksCount: Array.isArray(parsed.data.book_interests)
          ? parsed.data.book_interests.length
          : 0,
        exportedAt: parsed.exportedAt || "Data Desconhecida",
      };

      return { valid: true, payload: parsed, stats };
    } catch (e) {
      return {
        valid: false,
        error: "Formato inválido: O texto informado não é um código JSON de backup válido.",
      };
    }
  }

  async restoreBackup(payload) {
    if (!payload || !payload.data) {
      throw new Error("Payload de restauração inválido.");
    }

    const {
      habits = [],
      change_navigation = [],
      daily_challenges = [],
      achievements = [],
      book_interests = [],
      workout_assessments = [],
    } = payload.data;

    return new Promise((resolve, reject) => {
      try {
        db.transaction(
          (tx) => {
            // 1. Restaurar habits
            tx.executeSql("DELETE FROM habits;");
            habits.forEach((h) => {
              tx.executeSql(
                `INSERT INTO habits (
                  habitArea, habitName, habitFrequency, habitHasNotification,
                  habitNotificationFrequency, habitNotificationTime, lastCheck,
                  daysWithoutChecks, progressBar, habitIsChecked, habitChecks,
                  habitType, targetValue, currentValue, unit, difficulty, icon, streak, notificationId
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                  h.habitArea,
                  h.habitName,
                  h.habitFrequency,
                  h.habitHasNotification ? 1 : 0,
                  h.habitNotificationFrequency || null,
                  h.habitNotificationTime || null,
                  h.lastCheck || null,
                  h.daysWithoutChecks || 0,
                  h.progressBar !== undefined ? h.progressBar : 1,
                  h.habitIsChecked ? 1 : 0,
                  h.habitChecks || 0,
                  h.habitType || "check",
                  h.targetValue || 1,
                  h.currentValue || 0,
                  h.unit || "",
                  h.difficulty || "Rank B",
                  h.icon || "bolt",
                  h.streak || 0,
                  h.notificationId || "",
                ]
              );
            });

            // 2. Restaurar change_navigation (data de início)
            if (change_navigation.length > 0) {
              tx.executeSql("DELETE FROM change_navigation;");
              change_navigation.forEach((cn) => {
                tx.executeSql(
                  "INSERT INTO change_navigation (showHome, appStartData) VALUES (?, ?);",
                  [cn.showHome, cn.appStartData]
                );
              });
            }

            // 3. Restaurar daily_challenges
            if (daily_challenges.length > 0) {
              tx.executeSql("DELETE FROM daily_challenges;");
              daily_challenges.forEach((dc) => {
                tx.executeSql(
                  "INSERT INTO daily_challenges (challengeDate, title, category, description, xpReward, completed) VALUES (?, ?, ?, ?, ?, ?);",
                  [
                    dc.challengeDate,
                    dc.title,
                    dc.category,
                    dc.description,
                    dc.xpReward,
                    dc.completed ? 1 : 0,
                  ]
                );
              });
            }

            // 4. Restaurar achievements
            if (achievements.length > 0) {
              tx.executeSql("DELETE FROM achievements;");
              achievements.forEach((ach) => {
                tx.executeSql(
                  "INSERT OR REPLACE INTO achievements (id, title, description, icon, tier, unlocked, unlockedAt) VALUES (?, ?, ?, ?, ?, ?, ?);",
                  [
                    ach.id,
                    ach.title,
                    ach.description,
                    ach.icon,
                    ach.tier,
                    ach.unlocked ? 1 : 0,
                    ach.unlockedAt || null,
                  ]
                );
              });
            }

            // 5. Restaurar book_interests
            if (book_interests.length > 0) {
              tx.executeSql("DELETE FROM book_interests;");
              book_interests.forEach((b) => {
                tx.executeSql(
                  "INSERT OR REPLACE INTO book_interests (id, title, author, category, buyUrl, addedDate) VALUES (?, ?, ?, ?, ?, ?);",
                  [b.id, b.title, b.author, b.category, b.buyUrl, b.addedDate]
                );
              });
            }

            // 6. Restaurar workout_assessments
            if (workout_assessments.length > 0) {
              tx.executeSql("DELETE FROM workout_assessments;");
              workout_assessments.forEach((w) => {
                tx.executeSql(
                  "INSERT INTO workout_assessments (type, date, score, rank, dataJson) VALUES (?, ?, ?, ?, ?);",
                  [w.type, w.date, w.score, w.rank, w.dataJson]
                );
              });
            }
          },
          (txErr) => {
            console.warn("[BackupService] Erro ao restaurar transação:", txErr);
            reject(txErr);
          },
          async () => {
            // Reagenda as notificações dos hábitos restaurados
            try {
              for (const h of habits) {
                if (h.habitHasNotification && h.habitNotificationTime) {
                  await NotificationService.createNotification(h);
                }
              }
            } catch (_) {}

            resolve({ success: true, count: habits.length });
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }
}

export default new BackupService();
