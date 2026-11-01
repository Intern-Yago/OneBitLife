import db from "../Database";

// Inicialização e migração segura do banco SQLite
db.transaction((tx) => {
  // 1. Tabela base de Hábitos
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habitArea TEXT,
      habitName TEXT,
      habitFrequency TEXT,
      habitHasNotification BOOLEAN,
      habitNotificationFrequency TEXT,
      habitNotificationTime TEXT,
      lastCheck TEXT,
      daysWithoutChecks INTEGER,
      progressBar INTEGER,
      habitIsChecked BOOLEAN,
      habitChecks INTEGER,
      habitType TEXT DEFAULT 'check',
      targetValue REAL DEFAULT 1,
      currentValue REAL DEFAULT 0,
      unit TEXT DEFAULT '',
      difficulty TEXT DEFAULT 'Rank B',
      icon TEXT DEFAULT '⚡',
      streak INTEGER DEFAULT 0,
      notificationId TEXT DEFAULT ''
    );`
  );

  // Migrações seguras (ignoram se coluna já existir)
  const columnsToAdd = [
    "ALTER TABLE habits ADD COLUMN habitType TEXT DEFAULT 'check';",
    "ALTER TABLE habits ADD COLUMN targetValue REAL DEFAULT 1;",
    "ALTER TABLE habits ADD COLUMN currentValue REAL DEFAULT 0;",
    "ALTER TABLE habits ADD COLUMN unit TEXT DEFAULT '';",
    "ALTER TABLE habits ADD COLUMN difficulty TEXT DEFAULT 'Rank B';",
    "ALTER TABLE habits ADD COLUMN icon TEXT DEFAULT '⚡';",
    "ALTER TABLE habits ADD COLUMN streak INTEGER DEFAULT 0;",
    "ALTER TABLE habits ADD COLUMN notificationId TEXT DEFAULT '';",
  ];

  columnsToAdd.forEach((query) => {
    tx.executeSql(query, [], () => {}, () => {});
  });

  // 2. Tabela de Desafios Diários (Side Quests)
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS daily_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challengeDate TEXT,
      title TEXT,
      category TEXT,
      description TEXT,
      xpReward INTEGER,
      completed INTEGER DEFAULT 0
    );`
  );

  // 3. Tabela de Conquistas & Emblemas
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      icon TEXT,
      tier TEXT,
      unlocked INTEGER DEFAULT 0,
      unlockedAt TEXT
    );`
  );

  // 4. Tabela de Livros de Interesse (Wishlist de Leitura)
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS book_interests (
      id TEXT PRIMARY KEY,
      title TEXT,
      author TEXT,
      category TEXT,
      buyUrl TEXT,
      addedDate TEXT
    );`
  );

  // 5. Tabela de Avaliações Físicas Biomecânicas
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS workout_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      date TEXT,
      score REAL,
      rank TEXT,
      dataJson TEXT
    );`
  );
});

const createHabit = (obj) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO habits (
          habitArea, habitName, habitFrequency, habitHasNotification,
          habitNotificationFrequency, habitNotificationTime, lastCheck,
          daysWithoutChecks, progressBar, habitIsChecked, habitChecks,
          habitType, targetValue, currentValue, unit, difficulty, icon, streak, notificationId
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          obj.habitArea || "Mente",
          obj.habitName || "Novo Hábito",
          obj.habitFrequency || "Diário",
          obj.habitHasNotification ? 1 : 0,
          obj.habitNotificationFrequency || "Diário",
          obj.habitNotificationTime || "12:00",
          obj.lastCheck || new Date().toISOString().slice(0, 10),
          obj.daysWithoutChecks || 0,
          obj.progressBar !== undefined ? obj.progressBar : 1,
          obj.habitIsChecked || 0,
          obj.habitChecks || 0,
          obj.habitType || "check",
          obj.targetValue || 1,
          obj.currentValue || 0,
          obj.unit || "",
          obj.difficulty || "Rank B",
          obj.icon || "⚡",
          obj.streak || 0,
          obj.notificationId || "",
        ],
        (_, { rowsAffected, insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

const findByArea = (habitArea) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM habits WHERE habitArea = ?;",
        [habitArea],
        (_, { rows }) => resolve(rows._array || []),
        (_, error) => reject(error)
      );
    });
  });
};

const getAllHabits = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM habits;",
        [],
        (_, { rows }) => resolve(rows._array || []),
        (_, error) => reject(error)
      );
    });
  });
};

const updateHabit = (obj) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE habits SET
          habitName = ?, habitFrequency = ?, habitHasNotification = ?,
          habitNotificationFrequency = ?, habitNotificationTime = ?,
          habitType = ?, targetValue = ?, currentValue = ?, unit = ?,
          difficulty = ?, icon = ?, streak = ?, notificationId = ?
        WHERE habitArea = ?;`,
        [
          obj.habitName,
          obj.habitFrequency,
          obj.habitHasNotification ? 1 : 0,
          obj.habitNotificationFrequency,
          obj.habitNotificationTime,
          obj.habitType || "check",
          obj.targetValue || 1,
          obj.currentValue || 0,
          obj.unit || "",
          obj.difficulty || "Rank B",
          obj.icon || "⚡",
          obj.streak || 0,
          obj.notificationId || "",
          obj.habitArea,
        ],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

const updateCounterProgress = (id, currentValue, isChecked) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE habits SET currentValue = ?, habitIsChecked = ? WHERE id = ?;",
        [currentValue, isChecked ? 1 : 0, id],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

const deleteByName = (habitArea) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM habits WHERE habitArea = ?;",
        [habitArea],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

const changeProgress = (obj) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE habits SET
          progressBar = ?,
          habitChecks = ?,
          lastCheck = ?,
          daysWithoutChecks = ?,
          habitIsChecked = ?,
          currentValue = ?,
          streak = ?
        WHERE habitArea = ?;`,
        [
          obj.progressBar,
          obj.habitChecks,
          obj.lastCheck,
          obj.daysWithoutChecks,
          obj.habitIsChecked ? 1 : 0,
          obj.currentValue || 0,
          obj.streak || 0,
          obj.habitArea,
        ],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

const resetAllProgress = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE habits SET progressBar = 0, habitChecks = 0, daysWithoutChecks = 0, habitIsChecked = 0, currentValue = 0, streak = 0;",
        [],
        (_, { rowsAffected }) => {
          tx.executeSql(
            "UPDATE daily_challenges SET completed = 0;",
            [],
            () => resolve(rowsAffected),
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

// --- SERVIÇO DE DESAFIOS DIÁRIOS (SIDE QUESTS) ---
const getDailyChallenges = (dateStr) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM daily_challenges WHERE challengeDate = ?;",
        [dateStr],
        (_, { rows }) => resolve(rows._array || []),
        (_, error) => reject(error)
      );
    });
  });
};

const insertDailyChallenge = (challenge) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO daily_challenges (challengeDate, title, category, description, xpReward, completed) VALUES (?, ?, ?, ?, ?, ?);",
        [
          challenge.challengeDate,
          challenge.title,
          challenge.category,
          challenge.description,
          challenge.xpReward || 50,
          challenge.completed || 0,
        ],
        (_, { insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

const completeDailyChallenge = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE daily_challenges SET completed = 1 WHERE id = ?;",
        [id],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

// --- SERVIÇO DE LIVROS DE INTERESSE (WISHLIST) ---
const getBookInterests = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM book_interests ORDER BY addedDate DESC;",
        [],
        (_, { rows }) => resolve(rows._array || []),
        (_, error) => reject(error)
      );
    });
  });
};

const addBookInterest = (book) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT OR REPLACE INTO book_interests (id, title, author, category, buyUrl, addedDate) VALUES (?, ?, ?, ?, ?, ?);",
        [
          book.id,
          book.title,
          book.author,
          book.category,
          book.buyUrl || "",
          new Date().toISOString(),
        ],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

const removeBookInterest = (bookId) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM book_interests WHERE id = ?;",
        [bookId],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

// --- SERVIÇO DE AVALIAÇÕES FÍSICAS ---
const saveWorkoutAssessment = (type, score, rank, dataObj) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO workout_assessments (type, date, score, rank, dataJson) VALUES (?, ?, ?, ?, ?);",
        [
          type,
          new Date().toISOString(),
          score || 0,
          rank || "Recruta Cyber",
          JSON.stringify(dataObj || {}),
        ],
        (_, { insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

const getLatestWorkoutAssessment = (type) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM workout_assessments WHERE type = ? ORDER BY id DESC LIMIT 1;",
        [type],
        (_, { rows }) => {
          const list = rows._array || [];
          if (list.length > 0) {
            const item = list[0];
            try {
              item.parsedData = JSON.parse(item.dataJson);
            } catch (_) {
              item.parsedData = {};
            }
            resolve(item);
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

// --- CÁLCULO UNIFICADO DE XP E ESTATÍSTICAS DO JOGADOR ---
const getPlayerStats = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM habits;",
        [],
        (_, { rows: habitRows }) => {
          const habits = habitRows._array || [];
          tx.executeSql(
            "SELECT * FROM daily_challenges WHERE completed = 1;",
            [],
            (_, { rows: challengeRows }) => {
              const challenges = challengeRows._array || [];

              let habitChecksTotal = 0;
              let mindChecks = 0;
              let moneyChecks = 0;
              let bodyChecks = 0;
              let funChecks = 0;

              let habitXPTotal = 0;
              const difficultyMultiplier = {
                "Rank C": 10,
                "Rank B": 15,
                "Rank A": 25,
                "Rank S": 50,
              };

              habits.forEach((h) => {
                const checks = Number(h.habitChecks) || 0;
                habitChecksTotal += checks;
                const multiplier = difficultyMultiplier[h.difficulty] || 15;
                const earnedXP = checks * multiplier;
                habitXPTotal += earnedXP;

                if (h.habitArea === "Mente") mindChecks += checks;
                else if (h.habitArea === "Financeiro") moneyChecks += checks;
                else if (h.habitArea === "Corpo") bodyChecks += checks;
                else if (h.habitArea === "Humor") funChecks += checks;
              });

              let challengeXPTotal = 0;
              let challengeMindXP = 0;
              let challengeMoneyXP = 0;
              let challengeBodyXP = 0;
              let challengeFunXP = 0;

              challenges.forEach((c) => {
                const xp = Number(c.xpReward) || 50;
                challengeXPTotal += xp;
                const cat = (c.category || "").toLowerCase();
                if (cat.includes("mente") || cat.includes("bio-hack")) {
                  challengeMindXP += xp;
                } else if (cat.includes("finan") || cat.includes("riqueza")) {
                  challengeMoneyXP += xp;
                } else if (cat.includes("corpo") || cat.includes("físico")) {
                  challengeBodyXP += xp;
                } else {
                  challengeFunXP += xp;
                }
              });

              const totalXP = habitXPTotal + challengeXPTotal;

              resolve({
                totalXP,
                habitChecksTotal,
                habitXPTotal,
                completedChallengesCount: challenges.length,
                challengeXPTotal,
                mindXP: (mindChecks * 20) + challengeMindXP,
                moneyXP: (moneyChecks * 20) + challengeMoneyXP,
                bodyXP: (bodyChecks * 20) + challengeBodyXP,
                funXP: (funChecks * 20) + challengeFunXP,
                mindChecks,
                moneyChecks,
                bodyChecks,
                funChecks,
              });
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export default {
  createHabit,
  findByArea,
  getAllHabits,
  updateHabit,
  updateCounterProgress,
  deleteByName,
  changeProgress,
  resetAllProgress,
  getDailyChallenges,
  insertDailyChallenge,
  completeDailyChallenge,
  getBookInterests,
  addBookInterest,
  removeBookInterest,
  saveWorkoutAssessment,
  getLatestWorkoutAssessment,
  getPlayerStats,
};
