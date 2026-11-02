import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ACHIEVEMENTS_DATA, shareAchievement } from "../../Database/AchievementsData";
import BackupService from "../../services/BackupService";
import NotificationService from "../../services/NotificationService";
import SoundService from "../../services/SoundService";
import CyberModal from "../Common/CyberModal";

export default function ProfileTab({
  totalXP = 0,
  checks = 0,
  daysLife = "01",
  mindChecks = 0,
  moneyChecks = 0,
  bodyChecks = 0,
  funChecks = 0,
  rawHabitChecks = 0,
  challengesDone = 0,
  onResetLife,
}) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isSoundMuted, setIsSoundMuted] = useState(SoundService.isMuted());
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [backupInputText, setBackupInputText] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "ENTENDIDO",
    onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
  });

  const effectiveXP = Math.max(Number(totalXP) || 0, Number(checks) || 0);

  const getPlayerLevel = (xp) => {
    const val = Number(xp) || 0;
    if (val < 150) {
      return { level: 1, title: "Cyber Recruta", badgeColor: "#00F0FF", xpNext: 150 };
    } else if (val < 400) {
      return { level: 2, title: "Operador Neon", badgeColor: "#10B981", xpNext: 400 };
    } else if (val < 900) {
      return { level: 3, title: "Guardião do Core", badgeColor: "#F59E0B", xpNext: 900 };
    } else if (val < 2000) {
      return { level: 4, title: "Mestre dos Hábitos", badgeColor: "#A855F7", xpNext: 2000 };
    } else {
      return { level: 5, title: "Lenda Cyberpunk", badgeColor: "#FFD700", xpNext: 5000 };
    }
  };

  const playerLevel = getPlayerLevel(effectiveXP);

  const stats = {
    totalChecks: rawHabitChecks || Math.floor(effectiveXP / 25),
    daysLife: Number(daysLife) || 1,
    mindChecks,
    moneyChecks,
    bodyChecks,
    funChecks,
    zenSessions: Math.floor(effectiveXP / 50),
    challengesDone: Number(challengesDone) || 0,
  };

  const handleToggleSound = (val) => {
    setIsSoundMuted(val);
    SoundService.setMuted(val);
    if (!val) SoundService.playClick();
  };

  const handleTestNotification = async () => {
    SoundService.playClick();
    try {
      await NotificationService.sendTestNotification();
      setModalConfig({
        visible: true,
        title: "DISPARO DE NOTIFICAÇÃO",
        message: "Notificação de teste do sistema enviada com sucesso!",
        type: "success",
        confirmText: "OK",
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    } catch (_) {
      setModalConfig({
        visible: true,
        title: "FALHA NO DISPARO",
        message: "Não foi possível disparar o teste de notificação.",
        type: "danger",
        confirmText: "FECHAR",
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  const handleShareBadge = async (badge) => {
    SoundService.playClick();
    await shareAchievement(badge, playerLevel.title);
  };

  const handleConfirmResetLife = () => {
    SoundService.playClick();
    setModalConfig({
      visible: true,
      title: "RESTAURAR SAÚDE DO AVATAR",
      message: "Deseja restaurar as barras de vida dos seus hábitos e reiniciar o ciclo do Core?",
      type: "warning",
      confirmText: "CONFIRMAR RECOVERY",
      cancelText: "CANCELAR",
      onCancel: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      onConfirm: () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
        if (onResetLife) onResetLife();
      },
    });
  };

  const handleExportBackup = async () => {
    SoundService.playClick();
    setIsExporting(true);
    try {
      const res = await BackupService.shareBackup();
      if (res.success) {
        setModalConfig({
          visible: true,
          title: "BACKUP EXPORTADO",
          message: `Arquivo de backup pronto!\n\n• ${res.stats.habitsCount} Rotinas & Metas\n• ${res.stats.workoutsCount} Testes Físicos\n• ${res.stats.booksCount} Livros na Wishlist\n\nVocê pode salvá-lo no Google Drive, enviar pelo WhatsApp ou guardar em arquivo para restaurar em qualquer celular!`,
          type: "success",
          confirmText: "ENTENDIDO",
          onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
        });
      }
    } catch (_) {
      setModalConfig({
        visible: true,
        title: "FALHA NO BACKUP",
        message: "Não foi possível gerar a exportação de dados.",
        type: "danger",
        confirmText: "FECHAR",
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleProcessRestore = async () => {
    SoundService.playClick();
    if (!backupInputText.trim()) {
      setModalConfig({
        visible: true,
        title: "DADOS AUSENTES",
        message: "Cole o texto JSON do backup no campo indicado para prosseguir.",
        type: "warning",
        confirmText: "OK",
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    const validation = BackupService.validateBackup(backupInputText);
    if (!validation.valid) {
      SoundService.playBeep();
      setModalConfig({
        visible: true,
        title: "BACKUP INVÁLIDO",
        message: validation.error,
        type: "danger",
        confirmText: "CORRIGIR",
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    setModalConfig({
      visible: true,
      title: "CONFIRMAR RESTAURAÇÃO",
      message: `Este backup contém:\n\n• ${validation.stats.habitsCount} Rotinas\n• ${validation.stats.workoutsCount} Testes de Condicionamento\n• ${validation.stats.booksCount} Interesses Literários\n\nATENÇÃO: A restauração substituirá os dados atuais deste dispositivo pelos dados do backup. Deseja prosseguir?`,
      type: "warning",
      confirmText: "RESTAURAR AGORA",
      cancelText: "CANCELAR",
      onCancel: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
        setIsRestoring(true);
        try {
          await BackupService.restoreBackup(validation.payload);
          SoundService.playLevelUp();
          setRestoreModalVisible(false);
          setBackupInputText("");
          setModalConfig({
            visible: true,
            title: "SISTEMA RESTAURADO COM SUCESSO!",
            message: `Todas as suas rotinas, testes físicos e livros foram restaurados com sucesso no novo dispositivo!\n\nAs notificações foram reativadas.`,
            type: "success",
            confirmText: "CONCLUIR",
            onConfirm: () => {
              setModalConfig((prev) => ({ ...prev, visible: false }));
              if (onResetLife) onResetLife();
            },
          });
        } catch (err) {
          setModalConfig({
            visible: true,
            title: "ERRO NA RESTAURAÇÃO",
            message: `Falha ao gravar os dados no banco SQLite: ${err.message}`,
            type: "danger",
            confirmText: "FECHAR",
            onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
          });
        } finally {
          setIsRestoring(false);
        }
      },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTag}>
          <Text style={styles.headerTagText}>[PERFIL RPG & ESTATÍSTICAS]</Text>
        </View>
        <Text style={styles.title}>Atributos do Sistema & Patente</Text>
        <Text style={styles.subtitle}>
          Acompanhe seu nível, pontuação acumulada e conquistas desbloqueadas.
        </Text>
      </View>

      {/* CARD DO AVATAR & NÍVEL */}
      <View style={[styles.profileCard, { borderColor: playerLevel.badgeColor }]}>
        <View style={styles.profileHeaderRow}>
          <View style={[styles.avatarBox, { borderColor: playerLevel.badgeColor }]}>
            <Text style={[styles.avatarGlyph, { color: playerLevel.badgeColor }]}>[CYBER]</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.playerName}>Operador Ciborgue</Text>
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
              HP: {daysLife} dias | {rawHabitChecks} Checks | {challengesDone} Side Quests
            </Text>
          </View>
        </View>

        {/* BARRA DE PROGRESSO DE NÍVEL */}
        <View style={styles.xpBarContainer}>
          <View style={styles.xpBarLabels}>
            <Text style={styles.xpBarTitle}>Progresso da Patente</Text>
            <Text style={styles.xpBarNumbers}>
              {effectiveXP} / {playerLevel.xpNext} XP
            </Text>
          </View>
          <View style={styles.xpBarTrack}>
            <View
              style={[
                styles.xpBarFill,
                {
                  width: `${Math.min(100, Math.floor((effectiveXP / playerLevel.xpNext) * 100))}%`,
                  backgroundColor: playerLevel.badgeColor,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* OS 4 ATRIBUTOS CYBER */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>[ATRIBUTOS DO SISTEMA]</Text>
        <Text style={styles.sectionTotalXP}>Total: {effectiveXP} XP</Text>
      </View>

      <View style={styles.attributesGrid}>
        <View style={[styles.attrCard, { borderLeftColor: "#00F0FF" }]}>
          <Text style={styles.attrCode}>[INT]</Text>
          <Text style={styles.attrName}>INTELLECT</Text>
          <Text style={[styles.attrVal, { color: "#00F0FF" }]}>{mindChecks} XP</Text>
        </View>
        <View style={[styles.attrCard, { borderLeftColor: "#10B981" }]}>
          <Text style={styles.attrCode}>[WEALTH]</Text>
          <Text style={styles.attrName}>WEALTH</Text>
          <Text style={[styles.attrVal, { color: "#10B981" }]}>{moneyChecks} XP</Text>
        </View>
        <View style={[styles.attrCard, { borderLeftColor: "#FF3366" }]}>
          <Text style={styles.attrCode}>[STR]</Text>
          <Text style={styles.attrName}>STRENGTH</Text>
          <Text style={[styles.attrVal, { color: "#FF3366" }]}>{bodyChecks} XP</Text>
        </View>
        <View style={[styles.attrCard, { borderLeftColor: "#F59E0B" }]}>
          <Text style={styles.attrCode}>[VIT]</Text>
          <Text style={styles.attrName}>VITALITY</Text>
          <Text style={[styles.attrVal, { color: "#F59E0B" }]}>{funChecks} XP</Text>
        </View>
      </View>

      {/* HALL DE EMBLEMAS & CONQUISTAS */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>[HALL DE CONQUISTAS]</Text>
        <Text style={styles.badgeSectionSub}>Toque para inspecionar</Text>
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
              <Text style={styles.badgeTileCode}>
                {isUnlocked ? "[✓]" : "[🔒]"}
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
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>[CONFIGURAÇÕES DO SISTEMA]</Text>
      </View>

      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Efeitos Sonoros (SFX)</Text>
            <Text style={styles.settingSub}>Toques, confirmações e timers</Text>
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
            Disparar Teste de Notificação
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.recoveryBtn}
          onPress={handleConfirmResetLife}
        >
          <Text style={styles.recoveryText}>
            Restaurar Saúde do Avatar (Recovery)
          </Text>
        </TouchableOpacity>
      </View>

      {/* BACKUP & SINCRONIZAÇÃO NUVEM / LOCAL */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>[BACKUP & SINCRONIZAÇÃO DE DADOS]</Text>
      </View>

      <View style={styles.backupCard}>
        <Text style={styles.backupCardTitle}>Troca de Celular & Segurança</Text>
        <Text style={styles.backupCardDesc}>
          Exporte um arquivo completo com suas rotinas, avaliações físicas, livros salvos e histórico para restaurar em qualquer outro celular.
        </Text>

        <TouchableOpacity
          style={styles.exportBackupBtn}
          onPress={handleExportBackup}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color="#05080F" size="small" />
          ) : (
            <Text style={styles.exportBackupText}>
              ↑ Criar & Compartilhar Backup Completo
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.openRestoreBtn}
          onPress={() => {
            SoundService.playClick();
            setRestoreModalVisible(true);
          }}
        >
          <Text style={styles.openRestoreText}>
            ↓ Restaurar Backup no Novo Celular
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />

      {/* MODAL DE RESTAURAÇÃO DE BACKUP */}
      <Modal
        visible={restoreModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRestoreModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.restoreModalBox}>
            <View style={styles.restoreHeaderRow}>
              <View style={styles.restoreBadge}>
                <Text style={styles.restoreBadgeText}>[RESTAURAÇÃO CYBER]</Text>
              </View>
              <TouchableOpacity
                onPress={() => setRestoreModalVisible(false)}
                style={styles.modalCloseBtnCompact}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.restoreModalTitle}>
              Importar Backup do OneBitLife
            </Text>
            <Text style={styles.restoreModalDesc}>
              Cole abaixo o texto JSON exportado do seu celular antigo. Suas rotinas, testes e dados serão restaurados com precisão.
            </Text>

            <TextInput
              style={styles.backupTextInput}
              placeholder="Cole o código do backup aqui..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={6}
              value={backupInputText}
              onChangeText={setBackupInputText}
              textAlignVertical="top"
            />

            <View style={styles.restoreActionsRow}>
              <TouchableOpacity
                style={styles.cancelRestoreBtn}
                onPress={() => {
                  SoundService.playClick();
                  setRestoreModalVisible(false);
                }}
              >
                <Text style={styles.cancelRestoreText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmRestoreBtn}
                onPress={handleProcessRestore}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <ActivityIndicator color="#05080F" size="small" />
                ) : (
                  <Text style={styles.confirmRestoreText}>Restaurar Dados</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DETALHE DO EMBLEMA */}
      {selectedBadge && (
        <Modal
          visible={!!selectedBadge}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedBadge(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.badgeModalBox}>
              <Text style={styles.modalBadgeCode}>
                {selectedBadge.isUnlocked ? "[DESBLOQUEADO]" : "[BLOQUEADO]"}
              </Text>
              <Text style={styles.modalBadgeTitle}>{selectedBadge.title}</Text>
              <Text style={styles.modalBadgeTier}>
                Tier: {selectedBadge.tier} • {selectedBadge.isUnlocked ? "CONQUISTADO" : "PENDENTE"}
              </Text>
              <Text style={styles.modalBadgeDesc}>{selectedBadge.description}</Text>

              {selectedBadge.isUnlocked ? (
                <TouchableOpacity
                  style={styles.shareBadgeBtn}
                  onPress={() => handleShareBadge(selectedBadge)}
                >
                  <Text style={styles.shareBadgeBtnText}>Compartilhar Conquista ↗</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedBadge(null)}
              >
                <Text style={styles.modalCloseText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Cyber Modal */}
      <CyberModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#080C14",
  },
  header: {
    marginBottom: 14,
  },
  headerTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "rgba(0, 240, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
    marginBottom: 6,
  },
  headerTagText: {
    fontSize: 10,
    color: "#00F0FF",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    color: "#94A3B8",
    lineHeight: 18,
  },
  profileCard: {
    backgroundColor: "#0D131F",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  profileHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarGlyph: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  profileDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 4,
  },
  levelPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statsSummary: {
    fontSize: 11,
    color: "#64748B",
  },
  xpBarContainer: {
    marginTop: 4,
  },
  xpBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  xpBarTitle: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  xpBarNumbers: {
    fontSize: 11,
    color: "#F8FAFC",
    fontWeight: "700",
  },
  xpBarTrack: {
    height: 7,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 4,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sectionTotalXP: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "700",
  },
  attributesGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  attrCard: {
    flex: 1,
    backgroundColor: "#0D131F",
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  attrCode: {
    fontSize: 9,
    color: "#64748B",
    fontWeight: "800",
    marginBottom: 2,
  },
  attrName: {
    fontSize: 9.5,
    color: "#94A3B8",
    fontWeight: "700",
    marginBottom: 4,
  },
  attrVal: {
    fontSize: 13,
    fontWeight: "800",
  },
  badgeSectionSub: {
    fontSize: 10.5,
    color: "#64748B",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  badgeTile: {
    width: "48%",
    backgroundColor: "#0D131F",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  badgeTileUnlocked: {
    borderColor: "rgba(0, 240, 255, 0.3)",
    backgroundColor: "rgba(0, 240, 255, 0.04)",
  },
  badgeTileLocked: {
    opacity: 0.5,
  },
  badgeTileCode: {
    fontSize: 11,
    color: "#00F0FF",
    fontWeight: "700",
    marginBottom: 4,
  },
  badgeTileTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 2,
  },
  badgeTileTitleLocked: {
    color: "#64748B",
  },
  badgeTileTier: {
    fontSize: 9.5,
    color: "#64748B",
  },
  settingsCard: {
    backgroundColor: "#0D131F",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  settingSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  notifTestBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    marginBottom: 8,
  },
  notifTestText: {
    fontSize: 11.5,
    color: "#94A3B8",
    fontWeight: "600",
  },
  recoveryBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(0, 240, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
    alignItems: "center",
  },
  recoveryText: {
    fontSize: 11.5,
    color: "#00F0FF",
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(5, 8, 15, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  badgeModalBox: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#0D131F",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#00F0FF",
    padding: 20,
    alignItems: "center",
  },
  modalBadgeCode: {
    fontSize: 11,
    color: "#00F0FF",
    fontWeight: "800",
    marginBottom: 6,
  },
  modalBadgeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 4,
    textAlign: "center",
  },
  modalBadgeTier: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 12,
  },
  modalBadgeDesc: {
    fontSize: 12.5,
    color: "#94A3B8",
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 18,
  },
  shareBadgeBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#00F0FF",
    alignItems: "center",
    marginBottom: 8,
  },
  shareBadgeBtnText: {
    color: "#05080F",
    fontSize: 12.5,
    fontWeight: "800",
  },
  modalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCloseText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  backupCard: {
    backgroundColor: "#0D131F",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.25)",
    marginBottom: 16,
  },
  backupCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 4,
  },
  backupCardDesc: {
    fontSize: 11.5,
    color: "#94A3B8",
    lineHeight: 17,
    marginBottom: 14,
  },
  exportBackupBtn: {
    backgroundColor: "#00F0FF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  exportBackupText: {
    color: "#05080F",
    fontSize: 12.5,
    fontWeight: "800",
  },
  openRestoreBtn: {
    backgroundColor: "rgba(0, 240, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  openRestoreText: {
    color: "#00F0FF",
    fontSize: 12,
    fontWeight: "700",
  },
  restoreModalBox: {
    width: "100%",
    backgroundColor: "#0A0E17",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#00F0FF",
    padding: 20,
    alignItems: "stretch",
  },
  restoreHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  restoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "rgba(0, 240, 255, 0.12)",
    borderWidth: 1,
    borderColor: "#00F0FF",
  },
  restoreBadgeText: {
    color: "#00F0FF",
    fontSize: 10,
    fontWeight: "800",
  },
  modalCloseBtnCompact: {
    padding: 4,
  },
  restoreModalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 6,
  },
  restoreModalDesc: {
    fontSize: 11.5,
    color: "#94A3B8",
    lineHeight: 17,
    marginBottom: 14,
  },
  backupTextInput: {
    backgroundColor: "#05080F",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    color: "#F8FAFC",
    padding: 12,
    fontSize: 12,
    minHeight: 120,
    marginBottom: 16,
  },
  restoreActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelRestoreBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelRestoreText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  confirmRestoreBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#00F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmRestoreText: {
    color: "#05080F",
    fontSize: 12.5,
    fontWeight: "800",
  },
});
