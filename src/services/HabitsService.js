import db from "../Database";

db.transaction((tx) => {
  tx.executeSql(
    "CREATE TABLE IF NOT EXISTS habits (id INTEGER PRIMARY KEY AUTOINCREMENT, habitArea TEXT, habitName TEXT, habitFrequency TEXT, habitHasNotification BOOLEAN, habitNotificationFrequency TEXT, habitNotificationTime TEXT, lastCheck TEXT, daysWithoutChecks INTEGER, progressBar INTEGER, habitIsChecked BOOLEAN, habitChecks INTEGER);",
    [],
    (_, error) => {
      console.log("[HabitsService] DB init error:", error);
    }
  );
});

const createHabit = (obj) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO habits (habitArea, habitName, habitFrequency, habitHasNotification, habitNotificationFrequency, habitNotificationTime, lastCheck, daysWithoutChecks, progressBar, habitIsChecked, habitChecks) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
        [
          obj.habitArea,
          obj.habitName,
          obj.habitFrequency,
          obj.habitHasNotification,
          obj.habitNotificationFrequency,
          obj.habitNotificationTime,
          obj.lastCheck,
          obj.daysWithoutChecks || 0,
          obj.progressBar || 1,
          obj.habitIsChecked || 0,
          obj.habitChecks || 0,
        ],
        (_, { rowsAffected, insertId }) => {
          if (rowsAffected > 0) resolve(insertId);
          else reject("Error inserting habit: " + JSON.stringify(obj));
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
        (_, { rows }) => {
          resolve(rows._array || []);
        },
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
        (_, { rows }) => {
          resolve(rows._array || []);
        },
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
          "UPDATE habits SET habitName=?, habitFrequency=?, habitHasNotification=?, habitNotificationFrequency=?, habitNotificationTime=? WHERE id=?;",
          [
            obj.habitName,
            obj.habitFrequency,
            obj.habitHasNotification,
            obj.habitNotificationFrequency,
            obj.habitNotificationTime,
            obj.id,
          ],
          (_, { rowsAffected }) => resolve(rowsAffected),
          (_, error) => reject(error)
        );
      } else {
        tx.executeSql(
          "UPDATE habits SET habitName=?, habitFrequency=?, habitHasNotification=?, habitNotificationFrequency=?, habitNotificationTime=? WHERE habitArea=? AND (habitName=? OR ? IS NULL);",
          [
            obj.habitName,
            obj.habitFrequency,
            obj.habitHasNotification,
            obj.habitNotificationFrequency,
            obj.habitNotificationTime,
            obj.habitArea,
            obj.oldHabitName || obj.habitName,
            obj.oldHabitName || null,
          ],
          (_, { rowsAffected }) => resolve(rowsAffected),
          (_, error) => reject(error)
        );
      }
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
        } else if (param.habitArea) {
          tx.executeSql(
            "DELETE FROM habits WHERE habitArea=?;",
            [param.habitArea],
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
      } else {
        tx.executeSql(
          "UPDATE habits SET progressBar=? WHERE habitArea=?;",
          [obj.progressBar, obj.habitArea],
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
        "UPDATE habits SET progressBar=1, habitIsChecked=0, daysWithoutChecks=0;",
        [],
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
  deleteByName,
  changeProgress,
  resetAllProgress,
};