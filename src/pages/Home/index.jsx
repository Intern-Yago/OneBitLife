import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import DefaultButton from '../../components/Common/DefaultButton';
import LifeStatus from '../../components/Common/LifeStatus';
import CreateHabit from '../../components/Home/CreateHabit';
import EditHabit from '../../components/Home/EditHabit';
import StatusBar from '../../components/Home/StatusBar';
import ChangeNavigationService from '../../services/ChangeNavigationService';
import CheckService from '../../services/CheckService';
import HabitsService from '../../services/HabitsService';
import db from '../../Database';

export default function Home({route}){
  const navigation = useNavigation()
  const [mindHabit, setMindHabit] = useState()
  const [moneyHabit, setMoneyHabit] = useState()
  const [bodyHabit, setBodyHabit] = useState()
  const [funHabit, setFunHabit] = useState()

  const [ robotDaysLife, setRobotDaysLife] = useState()
  const [checks, setChecks] = useState(0)
  const [gameOver, setGameOver] = useState()
  const today = new Date()

  const getPlayerLevel = (totalChecks) => {
    const count = Number(totalChecks) || 0;
    if (count < 10) {
      return { level: 1, title: "Aprendiz 🐣", badgeColor: "#90B7F3" };
    } else if (count < 25) {
      return { level: 2, title: "Aventureiro ⚔️", badgeColor: "#85BB65" };
    } else if (count < 50) {
      return { level: 3, title: "Guardião 🛡️", badgeColor: "#FE7F23" };
    } else if (count < 100) {
      return { level: 4, title: "Mestre 🧙‍♂️", badgeColor: "#9b59b6" };
    } else {
      return { level: 5, title: "Lenda Viva 👑", badgeColor: "#FFD700" };
    }
  };

  const playerLevel = getPlayerLevel(checks);

  function handleNavExplanation(){
    navigation.navigate("AppExplanation")
  }
  function handleGameOver() {
    Alert.alert(
      "Resetar o Game",
      "Tem certeza que deseja resetar todo o seu progresso e reiniciar sua jornada?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resetar",
          style: "destructive",
          onPress: () => {
            navigation.navigate("Start");
            db.transaction((tx) => {
              tx.executeSql("DROP TABLE habits;");
              tx.executeSql("DROP TABLE change_navigation;");
            });
          },
        },
      ]
    );
  }

  const excludeArea = route.params?.excludeArea

  useEffect(()=>{
    HabitsService.findByArea("Mente").then((mind) => {
      setMindHabit(mind[0]);
    });
    HabitsService.findByArea("Financeiro").then((money) => {
      setMoneyHabit(money[0]);
    });
    HabitsService.findByArea("Corpo").then((body) => {
      setBodyHabit(body[0]);
    });
    HabitsService.findByArea("Humor").then((fun) => {
      setFunHabit(fun[0]);
    });

    if (excludeArea) {
      if (excludeArea == "Mente") {
        setMindHabit(null);
      }
      if (excludeArea == "Financeiro") {
        setMoneyHabit(null);
      }
      if (excludeArea == "Corpo") {
        setBodyHabit(null);
      }
      if (excludeArea == "Humor") {
        setFunHabit(null);
      }
    }

    ChangeNavigationService.checkShowHome(1)
      .then((showHome) => {
        if (showHome && showHome.appStartData) {
          const parts = showHome.appStartData.split("-");
          const startDate = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
          );
          startDate.setHours(0, 0, 0, 0);
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          const diffTime = todayDate.getTime() - startDate.getTime();
          const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 3600 * 24)) + 1);
          setRobotDaysLife(diffDays.toString().padStart(2, "0"));
        }
      })
      .catch((err) => console.log(err));
  }, [route.params]);

  useEffect(() => {
    CheckService.removeCheck(mindHabit, moneyHabit, bodyHabit, funHabit);
    CheckService.checkStatus(mindHabit, moneyHabit, bodyHabit, funHabit)
    const mindChecks = mindHabit ? mindHabit?.habitChecks : 0;
    const moneyChecks = moneyHabit ? moneyHabit?.habitChecks : 0;
    const bodyChecks = bodyHabit ? bodyHabit?.habitChecks : 0;
    const funChecks = funHabit ? funHabit?.habitChecks : 0;
    setChecks(mindChecks + moneyChecks + bodyChecks + funChecks);
    if (
      mindHabit?.progressBar === 0 ||
      moneyHabit?.progressBar === 0 ||
      bodyHabit?.progressBar === 0 ||
      funHabit?.progressBar === 0
    ) {
      setGameOver(true);
    }
  }, [mindHabit, moneyHabit, bodyHabit, funHabit]);

   return(
    <View style={styles.container}>
      <ScrollView>
        <View style={{alignItems: 'center'}}>
        {!gameOver ? (
            <View style={{ alignItems: "center" }}>
              <Text style={styles.dailyChecks}>
                ❤️ {robotDaysLife} {robotDaysLife === "01" ? "dia" : "dias"} -
                ✔️{" "}
                {checks} {checks === 1 ? "Check" : "Checks"}
              </Text>
              <View style={[styles.levelBadge, { borderColor: playerLevel.badgeColor }]}>
                <Text style={[styles.levelText, { color: playerLevel.badgeColor }]}>
                  Nível {playerLevel.level} • {playerLevel.title}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.gameOverTitle}>Game Over</Text>
          )}
          <LifeStatus
            mindHabit={mindHabit}
            moneyHabit={moneyHabit}
            bodyHabit={bodyHabit}
            funHabit={funHabit}
          />
          <StatusBar
            mindHabit={mindHabit?.progressBar}
            moneyHabit={moneyHabit?.progressBar}
            bodyHabit={bodyHabit?.progressBar}
            funHabit={funHabit?.progressBar}
          />
          
          {!gameOver ? (
            <View>
              {mindHabit ? (
                <EditHabit habit={mindHabit} checkColor="#90B7F3" />
              ) : (
                <CreateHabit habitArea="Mente" borderColor="#90B7F3" />
              )}
              {moneyHabit ? (
                <EditHabit habit={moneyHabit} checkColor="#85BB65" />
              ) : (
                <CreateHabit habitArea="Financeiro" borderColor="#85BB65" />
              )}
              {bodyHabit ? (
                <EditHabit habit={bodyHabit} checkColor="#FF0044" />
              ) : (
                <CreateHabit habitArea="Corpo" borderColor="#FF0044" />
              )}
              {funHabit ? (
                <EditHabit habit={funHabit} checkColor="#FE7F23" />
              ) : (
                <CreateHabit habitArea="Humor" borderColor="#FE7F23" />
              )}

              <Text
                style={styles.explanationText}
                onPress={() => {
                  handleNavExplanation();
                }}
              >
                Ver explicações novamente
              </Text>
            </View>
          ) : (
            <View style={{ marginVertical: 40 }}>
              <DefaultButton
                buttonText={"Resetar o Game"}
                handlePress={handleGameOver}
                width={250}
                height={50}
              />
            </View>
          )}
        </View>
      </ScrollView>

    </View>
   );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(21, 21, 21, 0.98)",
  },
  dailyChecks: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
    marginTop: 40,
  },
  explanationText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 15,
    paddingBottom: 25,
  },
  gameOverTitle: {
    marginVertical: 25,
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  levelBadge: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  levelText: {
    fontWeight: "bold",
    fontSize: 14,
  },
})