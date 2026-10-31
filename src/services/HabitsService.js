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
        (_, { rowsAffected, insertId }) => {
          if (rowsAffected > 0) resolve(insertId);
          else reject("Erro ao inserir hábito: " + JSON.stringify(obj));
        },
        (_, error) => reject(error)
      );
    });
  });
};

const findByArea = (habitArea) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM habits WHERE habitArea LIKE ? ORDER BY id ASC;",
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
        "SELECT * FROM habits ORDER BY id ASC;",
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
      if (obj.id) {
        tx.executeSql(
          `UPDATE habits SET 
            habitName=?, habitFrequency=?, habitHasNotification=?,
            habitNotificationFrequency=?, habitNotificationTime=?,
            habitType=?, targetValue=?, unit=?, difficulty=?, icon=?, notificationId=?
           WHERE id=?;`,
          [
            obj.habitName,
            obj.habitFrequency,
            obj.habitHasNotification ? 1 : 0,
            obj.habitNotificationFrequency,
            obj.habitNotificationTime,
            obj.habitType || "check",
            obj.targetValue !== undefined ? obj.targetValue : 1,
            obj.unit || "",
            obj.difficulty || "Rank B",
            obj.icon || "⚡",
            obj.notificationId || "",
            obj.id,
          ],
          (_, { rowsAffected }) => resolve(rowsAffected),
          (_, error) => reject(error)
        );
      } else {
        tx.executeSql(
          `UPDATE habits SET 
            habitName=?, habitFrequency=?, habitHasNotification=?,
            habitNotificationFrequency=?, habitNotificationTime=?
           WHERE habitArea=? AND habitName=?;`,
          [
            obj.habitName,
            obj.habitFrequency,
            obj.habitHasNotification ? 1 : 0,
            obj.habitNotificationFrequency,
            obj.habitNotificationTime,
            obj.habitArea,
            obj.oldHabitName || obj.habitName,
          ],
          (_, { rowsAffected }) => resolve(rowsAffected),
          (_, error) => reject(error)
        );
      }
    });
  });
};

const updateCounterProgress = (id, newCurrentValue, targetValue) => {
  return new Promise((resolve, reject) => {
    const isCompleted = newCurrentValue >= targetValue ? 1 : 0;
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE habits SET currentValue=?, habitIsChecked=?, progressBar=1 WHERE id=?;",
        [newCurrentValue, isCompleted, id],
        (_, { rowsAffected }) => resolve(rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

const deleteByName = (param) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      if (typeof param === "object" && param !== null) {
        if (param.id) {
          tx.executeSql(
            "DELETE FROM habits WHERE id=?;",
            [param.id],
            (_, { rowsAffected }) => resolve(rowsAffected),
            (_, error) => reject(error)
          );
        } else if (param.habitArea && param.habitName) {
          tx.executeSql(
            "DELETE FROM habits WHERE habitArea=? AND habitName=?;",
            [param.habitArea, param.habitName],
            (_, { rowsAffected }) => resolve(rowsAffected),
            (_, error) => reject(error)
          );
        }
      } else {
        tx.executeSql(
          "DELETE FROM habits WHERE habitArea=?;",
          [param],
          (_, { rowsAffected }) => resolve(rowsAffected),
          (_, error) => reject(error)
        );
      }
    });
  });
};

const changeProgress = (obj) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      if (obj.id) {
        tx.executeSql(
          "UPDATE habits SET progressBar=? WHERE id=?;",
          [obj.progressBar, obj.id],
          (_, { rowsAffected }) => resolve(rowsAffected),
          (_, error) => reject(error)
        );
      }
    });
  });
};

const resetAllProgress = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE habits SET progressBar=1, habitIsChecked=0, daysWithoutChecks=0, currentValue=0;",
        [],
        (_, { rowsAffected }) => resolve(rowsAffected),
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
};
