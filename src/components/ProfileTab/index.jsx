import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  Switch,
  Alert,
} from "react-native";
import { ACHIEVEMENTS_DATA, shareAchievement } from "../../Database/AchievementsData";
import SoundService from "../../services/SoundService";
import NotificationService from "../../services/NotificationService";
import HabitsService from "../../services/HabitsService";

export default function ProfileTab({
  checks = 0,
  daysLife = "01",
  mindChecks = 0,
  moneyChecks = 0,
  bodyChecks = 0,
  funChecks = 0,
  onResetLife,
}) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isSoundMuted, setIsSoundMuted] = useState(SoundService.isMuted());

  const getPlayerLevel = (totalChecks) => {
    const count = Number(totalChecks) || 0;
    if (count < 10) {
      return { level: 1, title: "Cyber Recruta", badgeColor: "#00F0FF", xpNext: 10 };
    } else if (count < 25) {
      return { level: 2, title: "Operador Neon", badgeColor: "#10B981", xpNext: 25 };
    } else if (count < 50) {
      return { level: 3, title: "Guardião do Core", badgeColor: "#F59E0B", xpNext: 50 };
    } else if (count < 100) {
      return { level: 4, title: "Mestre dos Hábitos", badgeColor: "#A855F7", xpNext: 100 };
    } else {
      return { level: 5, title: "Lenda Cyberpunk", badgeColor: "#FFD700", xpNext: 999 };
    }
  };

  const playerLevel = getPlayerLevel(checks);

  const stats = {
    totalChecks: checks,
    daysLife: Number(daysLife) || 1,
    mindChecks,
    moneyChecks,
    bodyChecks,
    funChecks,
    zenSessions: Math.floor(checks / 4),
    challengesDone: Math.floor(checks / 3),
  };

  const handleToggleSound = (val) => {
    setIsSoundMuted(val);
    SoundService.setMuted(val);
    if (!val) SoundService.playClick();
  };

  const handleTestNotification = async () => {
    SoundService.playClick();
    await NotificationService.sendTestNotification();
  };

  const handleShareBadge = async (badge) => {
    SoundService.playClick();
    await shareAchievement(badge, playerLevel.title);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionHeader}>👤 Perfil RPG & Estatísticas</Text>
      <Text style={styles.sectionSub}>
        Acompanhe seus atributos vitais, evolução de nível e conquistas desbloqueadas.
      </Text>

      {/* CARD DO AVATAR & NÍVEL */}
      <View style={[styles.profileCard, { borderColor: playerLevel.badgeColor }]}>
        <View style={styles.profileHeaderRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🤖</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.playerName}>Avatar Ciborgue</Text>
            <View
              style={[
                styles.levelPill,
                { backgroundColor: "rgba(255, 255, 255, 0.05)", borderColor: playerLevel.badgeColor },
              ]}
            >
              <Text style={[styles.levelText, { color: playerLevel.badgeColor }]}>
                Nível {playerLevel.level} • {playerLevel.title}
              </Text>
            </View>
            <Text style={styles.statsSummary}>
              🔥 HP: {daysLife} dias | 🎯 {checks} Checks Totais
            </Text>
          </View>
        </View>

        {/* BARRA DE PROGRESSO DE NÍVEL */}
        <View style={styles.xpBarContainer}>
          <View style={styles.xpBarLabels}>
            <Text style={styles.xpBarTitle}>Progresso da Patente</Text>
            <Text style={styles.xpBarNumbers}>
              {checks} / {playerLevel.xpNext} XP
            </Text>
          </View>
          <View style={styles.xpBarTrack}>
            <View
              style={[
                styles.xpBarFill,
                {
                  width: `${Math.min(100, Math.floor((checks / playerLevel.xpNext) * 100))}%`,
                  backgroundColor: playerLevel.badgeColor,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* OS 4 ATRIBUTOS CYBER */}
      <Text style={styles.blockTitle}>⚡ Atributos do Sistema</Text>
      <View style={styles.attributesGrid}>
        <View style={[styles.attrCard, { borderLeftColor: "#00F0FF" }]}>
          <Text style={styles.attrIcon}>🧠</Text>
          <Text style={styles.attrName}>INTELLECT</Text>
          <Text style={[styles.attrVal, { color: "#00F0FF" }]}>{mindChecks} pts</Text>
        </View>
        <View style={[styles.attrCard, { borderLeftColor: "#10B981" }]}>
          <Text style={styles.attrIcon}>💎</Text>
          <Text style={styles.attrName}>WEALTH</Text>
          <Text style={[styles.attrVal, { color: "#10B981" }]}>{moneyChecks} pts</Text>
        </View>
        <View style={[styles.attrCard, { borderLeftColor: "#FF3366" }]}>
          <Text style={styles.attrIcon}>🦾</Text>
          <Text style={styles.attrName}>STRENGTH</Text>
          <Text style={[styles.attrVal, { color: "#FF3366" }]}>{bodyChecks} pts</Text>
        </View>
        <View style={[styles.attrCard, { borderLeftColor: "#F59E0B" }]}>
          <Text style={styles.attrIcon}>😄</Text>
          <Text style={styles.attrName}>VITALITY</Text>
          <Text style={[styles.attrVal, { color: "#F59E0B" }]}>{funChecks} pts</Text>
        </View>
      </View>

      {/* HALL DE EMBLEMAS & CONQUISTAS */}
      <View style={styles.badgeSectionHeader}>
        <Text style={styles.blockTitle}>🏆 Hall de Emblemas & Conquistas</Text>
        <Text style={styles.badgeSectionSub}>Toque em um emblema para ver e compartilhar!</Text>
      </View>

      <View style={styles.badgesGrid}>
        {ACHIEVEMENTS_DATA.map((badge) => {
          const isUnlocked = badge.checkFn(stats);
          return (
            <TouchableOpacity
              key={badge.id}
              style={[
                styles.badgeTile,
                isUnlocked ? styles.badgeTileUnlocked : styles.badgeTileLocked,
              ]}
              onPress={() => {
                SoundService.playClick();
                setSelectedBadge({ ...badge, isUnlocked });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.badgeTileIcon}>
                {isUnlocked ? badge.icon : "🔒"}
              </Text>
              <Text
                style={[
                  styles.badgeTileTitle,
                  !isUnlocked && styles.badgeTileTitleLocked,
                ]}
                numberOfLines={1}
              >
                {badge.title}
              </Text>
              <Text style={styles.badgeTileTier}>[{badge.tier}]</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CONFIGURAÇÕES DO SISTEMA */}
      <Text style={styles.blockTitle}>⚙️ Configurações do Sistema</Text>
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Efeitos Sonoros (SFX)</Text>
            <Text style={styles.settingSub}>Sons de check, level up e timers</Text>
          </View>
          <Switch
            value={!isSoundMuted}
            onValueChange={(val) => handleToggleSound(!val)}
            thumbColor={!isSoundMuted ? "#00F0FF" : "#555555"}
            trackColor={{ false: "#333333", true: "rgba(0, 240, 255, 0.3)" }}
          />
        </View>

        <TouchableOpacity
          style={styles.notifTestBtn}
          onPress={handleTestNotification}
        >
          <Text style={styles.notifTestText}>
            🔔 Disparar Teste de Notificação
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.recoveryBtn}
          onPress={onResetLife}
        >
          <Text style={styles.recoveryText}>
            ⚡ Restaurar Saúde do Avatar (Recovery)
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />

      {/* MODAL DETALHE DO EMBLEMA COM COMPARTILHAR */}
      {selectedBadge && (
        <Modal
          visible={!!selectedBadge}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedBadge(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.badgeModalBox}>
              <Text style={styles.modalBadgeIcon}>{selectedBadge.icon}</Text>
              <Text style={styles.modalBadgeTitle}>{selectedBadge.title}</Text>
              <Text style={styles.modalBadgeTier}>
                Tier: {selectedBadge.tier} • {selectedBadge.isUnlocked ? "✓ CONQUISTADO" : "🔒 BLOQUEADO"}
              </Text>
              <Text style={styles.modalBadgeDesc}>{selectedBadge.description}</Text>

              {selectedBadge.isUnlocked ? (
                <TouchableOpacity
                  style={styles.shareBadgeBtn}
                  onPress={() => handleShareBadge(selectedBadge)}
                >
                  <Text style={styles.shareBadgeBtnText}>
                    🚀 Compartilhar Conquista
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.lockedWarningBox}>
                  <Text style={styles.lockedWarningText}>
                    Continue consistente para desbloquear este emblema!
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setSelectedBadge(null)}
              >
                <Text style={styles.closeModalBtnText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  sectionSub: {
    color: "#888888",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: "#121824",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  profileHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarEmoji: {
    fontSize: 32,
  },
  profileDetails: {
    flex: 1,
  },
  playerName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  statsSummary: {
    color: "#AAAAAA",
    fontSize: 12,
    marginTop: 6,
  },
  xpBarContainer: {
    marginTop: 14,
  },
  xpBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  xpBarTitle: {
    color: "#888888",
    fontSize: 11,
  },
  xpBarNumbers: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  xpBarTrack: {
    height: 8,
    backgroundColor: "#0B0E14",
    borderRadius: 4,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  blockTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  attributesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  attrCard: {
    width: "48%",
    backgroundColor: "#121824",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderLeftWidth: 3,
  },
  attrIcon: {
    fontSize: 20,
  },
  attrName: {
    color: "#888888",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
  },
  attrVal: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },
  badgeSectionHeader: {
    marginTop: 6,
  },
  badgeSectionSub: {
    color: "#777777",
    fontSize: 11,
    marginBottom: 10,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  badgeTile: {
    width: "31%",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
  },
  badgeTileUnlocked: {
    backgroundColor: "rgba(0, 240, 255, 0.08)",
    borderColor: "rgba(0, 240, 255, 0.3)",
  },
  badgeTileLocked: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    opacity: 0.5,
  },
  badgeTileIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  badgeTileTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  badgeTileTitleLocked: {
    color: "#666666",
  },
  badgeTileTier: {
    color: "#F59E0B",
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: "#121824",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  settingLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  settingSub: {
    color: "#888888",
    fontSize: 11,
    marginTop: 2,
  },
  notifTestBtn: {
    backgroundColor: "rgba(0, 240, 255, 0.1)",
    borderWidth: 1,
    borderColor: "#00F0FF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 14,
  },
  notifTestText: {
    color: "#00F0FF",
    fontWeight: "bold",
    fontSize: 13,
  },
  recoveryBtn: {
    backgroundColor: "rgba(255, 51, 102, 0.1)",
    borderWidth: 1,
    borderColor: "#FF3366",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  recoveryText: {
    color: "#FF3366",
    fontWeight: "bold",
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  badgeModalBox: {
    width: "100%",
    backgroundColor: "#121824",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#00F0FF",
  },
  modalBadgeIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  modalBadgeTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalBadgeTier: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  modalBadgeDesc: {
    color: "#CCCCCC",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
  shareBadgeBtn: {
    backgroundColor: "#00F0FF",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  shareBadgeBtnText: {
    color: "#0B0E14",
    fontWeight: "bold",
    fontSize: 14,
  },
  lockedWarningBox: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  lockedWarningText: {
    color: "#888888",
    fontSize: 12,
    textAlign: "center",
  },
  closeModalBtn: {
    marginTop: 14,
    paddingVertical: 8,
  },
  closeModalBtnText: {
    color: "#888888",
    fontSize: 13,
  },
});
