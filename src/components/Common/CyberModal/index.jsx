import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SoundService from "../../../services/SoundService";

export default function CyberModal({
  visible = false,
  title = "SISTEMA ONEBITLIFE",
  message = "",
  type = "info", // "info", "warning", "success", "danger"
  confirmText = "ENTENDIDO",
  cancelText = null,
  onConfirm,
  onCancel,
}) {
  if (!visible) return null;

  const colorMap = {
    info: { border: "#00F0FF", glow: "rgba(0, 240, 255, 0.15)", tag: "[INFO]" },
    warning: { border: "#F59E0B", glow: "rgba(245, 158, 11, 0.15)", tag: "[SOBRECARGA]" },
    success: { border: "#10B981", glow: "rgba(16, 185, 129, 0.15)", tag: "[SUCESSO]" },
    danger: { border: "#FF3366", glow: "rgba(255, 51, 102, 0.15)", tag: "[ALERTA]" },
  };

  const theme = colorMap[type] || colorMap.info;

  const handleConfirm = () => {
    SoundService.playClick();
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    SoundService.playClick();
    if (onCancel) onCancel();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.backdrop}>
        <View style={[styles.dialogCard, { borderColor: theme.border }]}>
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <View style={[styles.badge, { backgroundColor: theme.glow, borderColor: theme.border }]}>
              <Text style={[styles.badgeText, { color: theme.border }]}>{theme.tag}</Text>
            </View>
            <Text style={styles.terminalLabel}>CORE TERMINAL v2.0</Text>
          </View>

          {/* Title & Message */}
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.messageText}>{message}</Text>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {cancelText && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: theme.border },
                cancelText ? { flex: 1 } : { width: "100%" },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(5, 8, 15, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialogCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0D131F",
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 25,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  terminalLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 10,
    lineHeight: 22,
  },
  messageText: {
    fontSize: 13.5,
    color: "#94A3B8",
    lineHeight: 20,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  cancelButtonText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#05080F",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
