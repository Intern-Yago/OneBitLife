import React from "react";
import { StatusBar, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Routes from "./src/routes";

class CyberErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[OneBitLife Crash Guard]:", error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorBadge}>[CRASH RECOVERY HUD]</Text>
          <Text style={styles.errorTitle}>Reinicialização do Sistema</Text>
          <Text style={styles.errorMessage}>
            O aplicativo interceptou uma exceção inesperada e impediu o encerramento do processo.
          </Text>
          <Text style={styles.errorDetail}>
            {this.state.error?.message || "Erro desconhecido"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleRestart}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>REINICIAR SISTEMA</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <CyberErrorBoundary>
        <Routes />
      </CyberErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: "#0A0E17",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorBadge: {
    color: "#00F0FF",
    fontSize: 12,
    fontFamily: "monospace",
    letterSpacing: 2,
    marginBottom: 8,
  },
  errorTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  errorMessage: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  errorDetail: {
    color: "#FF3366",
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: "#161B26",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: "100%",
  },
  retryButton: {
    backgroundColor: "#00F0FF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#0A0E17",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },
});
