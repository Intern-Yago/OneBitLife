import React from "react";
import { StatusBar } from "react-native";

import Routes from "./src/routes";

export default function App() {
  return (
    <>
      <StatusBar barStyle={"light-content"} translucent backgroundColor="rgb(26, 26, 26)"/>
      
      <Routes />
    </>
  );
}