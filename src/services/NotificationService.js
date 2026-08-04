import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";

// Configure default notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Setup Android notification channel
async function setupNotificationChannel() {
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Lembretes de Hábitos",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#90B7F3",
        sound: true,
      });
    } catch (error) {
      console.warn("[NotificationService] Erro ao configurar canal Android:", error);
    }
  }
}

// Request permissions safely
async function checkPermissions() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === "granted";
  } catch (error) {
    console.warn("[NotificationService] Erro ao checar permissões:", error);
    return false;
  }
}

async function createNotification(
  habitInput,
  frequencyInput,
  dayNotification,
  timeNotification
) {
  try {
    await setupNotificationChannel();

    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      Alert.alert(
        "Permissão Necessária",
        "Por favor, permita as notificações nas configurações do seu celular para receber lembretes de hábitos."
      );
      return null;
    }

    if (!timeNotification || typeof timeNotification !== "string") {
      console.warn("[NotificationService] Horário inválido ou não informado:", timeNotification);
      return null;
    }

    const parts = timeNotification.split(":");
    if (parts.length < 2) return null;

    const habitHour = Number(parts[0]);
    const habitMinutes = Number(parts[1]);

    if (isNaN(habitHour) || isNaN(habitMinutes)) return null;

    let weekDay = 1;
    if (dayNotification === "Domingo") weekDay = 1;
    else if (dayNotification === "Segunda") weekDay = 2;
    else if (dayNotification === "Terça") weekDay = 3;
    else if (dayNotification === "Quarta") weekDay = 4;
    else if (dayNotification === "Quinta") weekDay = 5;
    else if (dayNotification === "Sexta") weekDay = 6;
    else if (dayNotification === "Sábado") weekDay = 7;

    let triggerNotification;
    if (frequencyInput === "Diário") {
      triggerNotification = {
        hour: habitHour,
        minute: habitMinutes,
        repeats: true,
      };
    } else if (frequencyInput === "Semanal") {
      triggerNotification = {
        weekday: weekDay,
        hour: habitHour,
        minute: habitMinutes,
        repeats: true,
      };
    } else {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚡ Lembrete: ${habitInput}`,
        body: `Hora de manter o foco! Complete seu hábito "${habitInput}" no OneBitLife!`,
        sound: true,
        channelId: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      identifier: `${habitInput}`,
      trigger: triggerNotification,
    });

    console.log("[NotificationService] Notificação agendada com sucesso. ID:", notificationId);
    return notificationId;
  } catch (error) {
    console.error("[NotificationService] Erro ao criar notificação:", error);
    return null;
  }
}

async function deleteNotification(habitInput) {
  if (!habitInput) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(`${habitInput}`);
    console.log("[NotificationService] Notificação cancelada para:", habitInput);
  } catch (error) {
    console.warn("[NotificationService] Erro ao cancelar notificação:", error);
  }
}

async function sendTestNotification(habitInput) {
  try {
    await setupNotificationChannel();
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      Alert.alert("Erro", "Sem permissão de notificação!");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚡ Teste de Notificação OneBitLife",
        body: habitInput ? `Lembrete ativo para: ${habitInput}` : "Sistemas de notificação 100% operacionais!",
        sound: true,
        channelId: "default",
      },
      trigger: null, // Dispara imediatamente
    });
    Alert.alert("Sucesso", "Notificação de teste enviada com sucesso!");
  } catch (error) {
    console.error("[NotificationService] Erro ao enviar teste:", error);
    Alert.alert("Erro", "Não foi possível enviar a notificação de teste.");
  }
}

export default {
  createNotification,
  deleteNotification,
  sendTestNotification,
};