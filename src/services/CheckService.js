import db from "../Database";

import HabitsService from "./HabitsService";

const checkHabit = (obj) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE habits SET lastCheck=?, habitIsChecked=?, habitChecks=? WHERE habitArea=?;",
        [obj.lastCheck, obj.habitIsChecked, obj.habitChecks, obj.habitArea],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) resolve(rowsAffected);
          else reject("Error updating obj");
        },
        (_, error) => reject(error)
      );
    });
  });
};

const removeCheckHabit = (obj) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE habits SET habitIsChecked=? WHERE habitArea=?;",
        [obj.habitIsChecked, obj.habitArea],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) resolve(rowsAffected);
          else reject("Error updating obj");
        },
        (_, error) => reject(error)
      );
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

const removeCheck = (mindHabit, moneyHabit, bodyHabit, funHabit) => {
  const habits = [mindHabit, moneyHabit, bodyHabit, funHabit];

  habits.forEach((habit) => {
    if (!habit || !habit.lastCheck) return;
    const diffDays = getDiffDays(habit.lastCheck);

    if (
      (habit.habitFrequency === "Diário" && diffDays > 0) ||
      (habit.habitFrequency === "Semanal" && diffDays > 7) ||
      (habit.habitFrequency === "Mensal" && diffDays > 30)
    ) {
      removeCheckHabit({
        habitIsChecked: 0,
        habitArea: habit.habitArea,
      });
    }
  });
};

const checkStatus = (mindHabit, moneyHabit, bodyHabit, funHabit) => {
  const habits = [mindHabit, moneyHabit, bodyHabit, funHabit];

  habits.forEach((habit) => {
    if (!habit || !habit.lastCheck) return;
    const diffDays = getDiffDays(habit.lastCheck);

    if (habit.habitFrequency === "Diário") {
      if (diffDays === 1) {
        HabitsService.changeProgress({ progressBar: 0.5, habitArea: habit.habitArea });
      } else if (diffDays === 2) {
        HabitsService.changeProgress({ progressBar: 0.25, habitArea: habit.habitArea });
      } else if (diffDays >= 3) {
        HabitsService.changeProgress({ progressBar: 0, habitArea: habit.habitArea });
      }
    } else if (habit.habitFrequency === "Semanal") {
      if (diffDays === 7 || diffDays === 8) {
        HabitsService.changeProgress({ progressBar: 0.5, habitArea: habit.habitArea });
      } else if (diffDays === 9) {
        HabitsService.changeProgress({ progressBar: 0.25, habitArea: habit.habitArea });
      } else if (diffDays >= 10) {
        HabitsService.changeProgress({ progressBar: 0, habitArea: habit.habitArea });
      }
    } else if (habit.habitFrequency === "Mensal") {
      if (diffDays === 31) {
        HabitsService.changeProgress({ progressBar: 0.5, habitArea: habit.habitArea });
      } else if (diffDays === 32) {
        HabitsService.changeProgress({ progressBar: 0.25, habitArea: habit.habitArea });
      } else if (diffDays >= 33) {
        HabitsService.changeProgress({ progressBar: 0, habitArea: habit.habitArea });
      }
    }
  });
};

export default {
  checkHabit,
  removeCheckHabit,
  removeCheck,
  checkStatus,
};