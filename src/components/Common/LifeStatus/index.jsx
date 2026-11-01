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

  useEffect(() => {
    try {
      AnimationService.animationStatus(
        mindHabit?.progressBar,
        moneyHabit?.progressBar,
        bodyHabit?.progressBar,
        funHabit?.progressBar,
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
  },
  roboAnimacao: {
    width: 190,
    marginTop: 30,
    alignSelf: "center",
  },
  educacaoAnimacao: {
    width: 100,
    marginTop: 50,
    marginLeft: 5,
    position: "absolute",
  },
  financasAnimacao: {
    width: 100,
    position: "absolute",
    marginTop: 50,
    marginLeft: 95,
  },
});
