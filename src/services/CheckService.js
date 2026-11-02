import db from "../Database";
import HabitsService from "./HabitsService";

const checkHabit = (obj) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      if (obj.id) {
        tx.executeSql(
          "UPDATE habits SET lastCheck=?, habitIsChecked=?, habitChecks=?, progressBar=1 WHERE id=?;",
          [obj.lastCheck, obj.habitIsChecked, obj.habitChecks, obj.id],
          (_, { rowsAffected }) => resolve(rowsAffected),
          (_, error) => reject(error)
        );
      } else {
        tx.executeSql(
          "UPDATE habits SET lastCheck=?, habitIsChecked=?, habitChecks=?, progressBar=1 WHERE habitArea=? AND habitName=?;",
          [obj.lastCheck, obj.habitIsChecked, obj.habitChecks, obj.habitArea, obj.habitName],
          (_, { rowsAffected }) => resolve(rowsAffected),
          (_, error) => reject(error)
        );
      }
    });
  });
};

const removeCheckHabit = (obj) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      if (obj.id) {
        tx.executeSql(
          "UPDATE habits SET habitIsChecked=? WHERE id=?;",
          [obj.habitIsChecked, obj.id],
          (_, { rowsAffected }) => resolve(rowsAffected),
          (_, error) => reject(error)
        );
      } else {
        tx.executeSql(
          "UPDATE habits SET habitIsChecked=? WHERE habitArea=? AND habitName=?;",
          [obj.habitIsChecked, obj.habitArea, obj.habitName],
          (_, { rowsAffected }) => resolve(rowsAffected),
          (_, error) => reject(error)
        );
      }
    });
  });
};

const getDiffDays = (lastCheckDateStr) => {
  if (!lastCheckDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = lastCheckDateStr.split("-");
  if (parts.length < 3) return 0;
  const lastCheckDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  lastCheckDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastCheckDate.getTime();
  return Math.floor(diffTime / (1000 * 3600 * 24));
};

const removeCheck = (habit) => {
  if (!habit || !habit.lastCheck) return Promise.resolve(0);
  const diffDays = getDiffDays(habit.lastCheck);

  if (
    (habit.habitFrequency === "Diário" && diffDays > 0) ||
    (habit.habitFrequency === "Semanal" && diffDays > 7) ||
    (habit.habitFrequency === "Mensal" && diffDays > 30)
  ) {
    return removeCheckHabit({
      id: habit.id,
      habitIsChecked: 0,
      habitArea: habit.habitArea,
      habitName: habit.habitName,
    });
  }
  return Promise.resolve(0);
};

const checkStatus = (habit) => {
  if (!habit || !habit.lastCheck) return Promise.resolve(0);
  const diffDays = getDiffDays(habit.lastCheck);

  if (habit.habitFrequency === "Diário") {
    if (diffDays === 1) {
      return HabitsService.changeProgress({ id: habit.id, progressBar: 0.5, habitArea: habit.habitArea });
    } else if (diffDays === 2) {
      return HabitsService.changeProgress({ id: habit.id, progressBar: 0.25, habitArea: habit.habitArea });
    } else if (diffDays >= 3) {
      return HabitsService.changeProgress({ id: habit.id, progressBar: 0, habitArea: habit.habitArea });
    }
  } else if (habit.habitFrequency === "Semanal") {
    if (diffDays === 7 || diffDays === 8) {
      return HabitsService.changeProgress({ id: habit.id, progressBar: 0.5, habitArea: habit.habitArea });
    } else if (diffDays === 9) {
      return HabitsService.changeProgress({ id: habit.id, progressBar: 0.25, habitArea: habit.habitArea });
    } else if (diffDays >= 10) {
      return HabitsService.changeProgress({ id: habit.id, progressBar: 0, habitArea: habit.habitArea });
    }
  } else if (habit.habitFrequency === "Mensal") {
    if (diffDays === 31) {
      return HabitsService.changeProgress({ id: habit.id, progressBar: 0.5, habitArea: habit.habitArea });
    } else if (diffDays === 32) {
      return HabitsService.changeProgress({ id: habit.id, progressBar: 0.25, habitArea: habit.habitArea });
    } else if (diffDays >= 33) {
      return HabitsService.changeProgress({ id: habit.id, progressBar: 0, habitArea: habit.habitArea });
    }
  }
  return Promise.resolve(0);
};

export default {
  checkHabit,
  removeCheckHabit,
  removeCheck,
  checkStatus,
};
