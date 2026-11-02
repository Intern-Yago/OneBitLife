import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import Lottie from "lottie-react-native";
import AnimationService from "../../../services/AnimationService";

// Fallback inicial pré-carregado para evitar renderizar Lottie com source=undefined no primeiro tick
const defaultMind = require("../../../assets/education/education-100.json");
const defaultMoney = require("../../../assets/money/money-100.json");
const defaultRobot = require("../../../assets/robot/robot-100-100.json");

export default function LifeStatus({
  mindHabit,
  moneyHabit,
  bodyHabit,
  funHabit,
}) {
  const [mind, setMind] = useState(defaultMind);
  const [money, setMoney] = useState(defaultMoney);
  const [robot, setRobot] = useState(defaultRobot);

  // Extrai o nível de progresso seja de um número, objeto ou array de hábitos (Tamagotchi multi-rotina)
  const resolveProgress = (val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === "number") return val;
    if (Array.isArray(val)) {
      if (val.length === 0) return undefined;
      // Se qualquer hábito na área estiver sem check / com fome, a área reflete o hábito mais negligenciado
      return Math.min(
        ...val.map((h) =>
          h && typeof h.progressBar === "number" ? h.progressBar : 1
        )
      );
    }
    if (typeof val === "object" && typeof val.progressBar === "number") {
      return val.progressBar;
    }
    return undefined;
  };

  useEffect(() => {
    try {
      AnimationService.animationStatus(
        resolveProgress(mindHabit),
        resolveProgress(moneyHabit),
        resolveProgress(bodyHabit),
        resolveProgress(funHabit),
        setMind,
        setMoney,
        setRobot
      );
    } catch (err) {
      console.warn("[LifeStatus] Erro ao atualizar status de animação:", err);
    }
  }, [mindHabit, moneyHabit, bodyHabit, funHabit]);

  return (
    <View style={styles.container}>
      {mind ? (
        <Lottie
          source={mind}
          autoPlay
          loop
          style={styles.educacaoAnimacao}
        />
      ) : null}
      {money ? (
        <Lottie
          source={money}
          autoPlay
          loop
          style={styles.financasAnimacao}
        />
      ) : null}
      {robot ? (
        <Lottie
          source={robot}
          autoPlay
          loop
          style={styles.roboAnimacao}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  roboAnimacao: {
    width: 190,
    height: 190,
    marginTop: 30,
    alignSelf: "center",
  },
  educacaoAnimacao: {
    width: 100,
    height: 100,
    marginTop: 50,
    marginLeft: 5,
    position: "absolute",
  },
  financasAnimacao: {
    width: 100,
    height: 100,
    position: "absolute",
    marginTop: 50,
    marginLeft: 95,
  },
});
