import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import DefaultButton from "../../components/Common/DefaultButton";
import LifeStatus from "../../components/Common/LifeStatus/";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Start() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleNavAppExplanation = () => {
    navigation.navigate("AppExplanation");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../../assets/icons/logo3.png")}
            style={styles.logo}
          />
          <LifeStatus />
          <Text style={styles.description}>
            Vamos transformar sua vida {"\n"}
            em um jogo, buscando sempre {"\n"}
            o melhor nível.
          </Text>
          <DefaultButton
            buttonText={"Continuar..."}
            handlePress={handleNavAppExplanation}
            width={250}
            height={50}
          />
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
  logo: {
    width: 300,
    height: 60,
    marginTop: 30,
    marginBottom: 20,
  },
  description: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 40,
  },
});