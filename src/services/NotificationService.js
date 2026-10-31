import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";

// Configure handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Setup Android notification channel with correct types
async function setupNotificationChannel() {
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Lembretes de Hábitos OneBitLife",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#00F0FF",
        sound: "default",
        enableVibrate: true,
      });
    } catch (error) {
      console.warn("[NotificationService] Erro ao configurar canal Android:", error);
    }
  }
}

// Request permissions safely for iOS and Android 13+
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

// Map Brazilian Portuguese weekday name to 1-7 (1=Sunday, 2=Monday, etc.)
function getWeekdayNumber(dayName) {
  switch (dayName) {
    case "Domingo": return 1;
    case "Segunda": return 2;
    case "Terça": return 3;
    case "Quarta": return 4;
    case "Quinta": return 5;
    case "Sexta": return 6;
    case "Sábado": return 7;
    default: return 2; // Default Monday
  }
}

async function createNotification(
  habitInput,
  frequencyInput,
  dayNotification,
  timeNotification,
  habitId = null
) {
  try {
    await setupNotificationChannel();

    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      Alert.alert(
        "Permissão de Notificação",
        "Por favor, autorize as notificações nas configurações do celular para receber seus lembretes."
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

    let triggerNotification;

    if (frequencyInput === "Diário") {
      triggerNotification = {
        hour: habitHour,
        minute: habitMinutes,
        repeats: true,
      };
    } else if (frequencyInput === "Semanal") {
      const weekDay = getWeekdayNumber(dayNotification);
      triggerNotification = {
        weekday: weekDay,
        hour: habitHour,
        minute: habitMinutes,
        repeats: true,
      };
    } else if (frequencyInput === "Mensal") {
      triggerNotification = {
        day: 1, // Dispara todo dia 1º do mês no horário indicado
        hour: habitHour,
        minute: habitMinutes,
        repeats: true,
      };
    } else {
      triggerNotification = {
        hour: habitHour,
        minute: habitMinutes,
        repeats: true,
      };
    }

    // Identificador único sem caracteres conflitantes
    const uniqueIdentifier = habitId
      ? `habit_notif_${habitId}`
      : `habit_notif_${Date.now()}`;

    // Cancela prévia se houver
    try {
      await Notifications.cancelScheduledNotificationAsync(uniqueIdentifier);
    } catch (_) {}

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚡ Protocolo Ativo: ${habitInput}`,
        body: `Mantenha a sincronia do seu Avatar! Complete "${habitInput}" no OneBitLife agora.`,
        sound: true,
        channelId: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { habitId, habitName: habitInput },
      },
      identifier: uniqueIdentifier,
      trigger: triggerNotification,
    });

    console.log("[NotificationService] Agendado com sucesso. ID:", notificationId);
    return notificationId;
  } catch (error) {
    console.error("[NotificationService] Erro ao criar notificação:", error);
    return null;
  }
}

async function deleteNotification(habitIdentifier) {
  if (!habitIdentifier) return;
  try {
    const idToCancel = typeof habitIdentifier === "number"
      ? `habit_notif_${habitIdentifier}`
      : habitIdentifier.startsWith("habit_notif_")
      ? habitIdentifier
      : `habit_notif_${habitIdentifier}`;

    await Notifications.cancelScheduledNotificationAsync(idToCancel);

    // Cancelar também se foi salvo com o nome cru legado
    try {
      await Notifications.cancelScheduledNotificationAsync(`${habitIdentifier}`);
    } catch (_) {}

    console.log("[NotificationService] Notificação cancelada para:", idToCancel);
  } catch (error) {
    console.warn("[NotificationService] Erro ao cancelar notificação:", error);
  }
}

async function sendTestNotification(habitInput) {
  try {
    await setupNotificationChannel();
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      Alert.alert("Aviso", "Permissão de notificação negada no celular.");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚡ Conexão Cyberpunk Estabelecida!",
        body: habitInput
          ? `Lembrete de teste ativo para: "${habitInput}". Seus alarmes estão operacionais!`
          : "Sistemas de notificação do OneBitLife 100% operacionais!",
        sound: true,
        channelId: "default",
      },
      trigger: null, // Disparo imediato
    });
    Alert.alert("Sucesso", "Notificação de teste disparada! Verifique a barra de notificações.");
  } catch (error) {
    console.error("[NotificationService] Erro no teste imediato:", error);
    Alert.alert("Erro", "Não foi possível disparar a notificação de teste.");
  }
}

export default {
  createNotification,
  deleteNotification,
  sendTestNotification,
  setupNotificationChannel,
  checkPermissions,
};
