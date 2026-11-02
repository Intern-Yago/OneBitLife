import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

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
      {/* 1. Robô Cibernético Central (Camada Base) */}
      {robot ? (
        <Lottie
          source={robot}
          autoPlay
          loop
          style={styles.roboAnimacao}
        />
      ) : null}

      {/* 2. Animação de Mente / Educação (Flanco Esquerdo Superior em Primeiro Plano) */}
      {mind ? (
        <View style={styles.educacaoContainer} pointerEvents="none">
          <Lottie
            source={mind}
            autoPlay
            loop
            style={styles.educacaoAnimacao}
          />
        </View>
      ) : null}

      {/* 3. Animação de Riqueza / Finanças (Flanco Direito Superior em Primeiro Plano) */}
      {money ? (
        <View style={styles.financasContainer} pointerEvents="none">
          <Lottie
            source={money}
            autoPlay
            loop
            style={styles.financasAnimacao}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: 250,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  roboAnimacao: {
    width: 200,
    height: 200,
    alignSelf: "center",
    zIndex: 1,
  },
  educacaoContainer: {
    position: "absolute",
    top: 5,
    left: 4,
    width: 95,
    height: 95,
    zIndex: 10,
    elevation: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  educacaoAnimacao: {
    width: "100%",
    height: "100%",
  },
  financasContainer: {
    position: "absolute",
    top: 5,
    right: 4,
    width: 95,
    height: 95,
    zIndex: 10,
    elevation: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  financasAnimacao: {
    width: "100%",
    height: "100%",
  },
});
