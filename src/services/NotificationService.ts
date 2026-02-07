import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const REMINDER_ENABLED_KEY = "@spendeka:reminderEnabled";
const REMINDER_HOUR_KEY = "@spendeka:reminderHour";
const REMINDER_MINUTE_KEY = "@spendeka:reminderMinute";
const REMINDER_CHANNEL_ID = "reminder-channel";
const LANGUAGE_STORAGE_KEY = "@spendeka_language";

// Fun notification messages with emojis (English)
const NOTIFICATION_MESSAGES_EN = [
  "💰 Don't forget to log your transactions today!",
  "📝 Time to track your spending! 📊",
  "💸 Remember to record your expenses! 🧾",
  "🎯 Stay on top of your finances! 💪",
  "📱 Quick! Log that transaction! ⚡",
  "💳 Keep your budget in check! 📈",
  "🤑 Every penny counts! Log it now! ✨",
  "📋 Don't let expenses slip away! 🎪",
  "💵 Track it, don't slack it! 🚀",
  "📊 Your financial future starts now! 🌟",
  "🎨 Make your money story complete! 📖",
  "⚡ Zap those expenses into your app! ⚡",
  "🎯 Financial goals? Log it! 🏆",
  "💎 Every transaction matters! ✨",
  "📱 Your wallet's calling! Answer it! 📞",
  "🎪 Time for a spending check-in! 🎭",
  "🌟 Keep your finances shining! ✨",
  "🚀 Boost your budget game! 💪",
  "🎁 Track now, thank yourself later! 🎉",
  "💼 Professional spending tracking! 📊",
];

// Fun notification messages with emojis (Vietnamese)
const NOTIFICATION_MESSAGES_VI = [
  "💰 Đừng quên ghi lại giao dịch hôm nay nhé!",
  "📝 Đến lúc theo dõi chi tiêu rồi! 📊",
  "💸 Nhớ ghi lại các khoản chi tiêu nhé! 🧾",
  "🎯 Hãy kiểm soát tài chính của bạn! 💪",
  "📱 Nhanh lên! Ghi lại giao dịch đó! ⚡",
  "💳 Giữ ngân sách trong tầm kiểm soát! 📈",
  "🤑 Mỗi đồng đều quan trọng! Ghi lại ngay! ✨",
  "📋 Đừng để chi tiêu trôi đi! 🎪",
  "💵 Theo dõi đi, đừng lười biếng! 🚀",
  "📊 Tương lai tài chính của bạn bắt đầu từ bây giờ! 🌟",
  "🎨 Hoàn thiện câu chuyện tiền bạc của bạn! 📖",
  "⚡ Ghi lại các khoản chi tiêu vào app ngay! ⚡",
  "🎯 Mục tiêu tài chính? Ghi lại đi! 🏆",
  "💎 Mỗi giao dịch đều quan trọng! ✨",
  "📱 Ví của bạn đang gọi! Trả lời đi! 📞",
  "🎪 Đến lúc kiểm tra chi tiêu rồi! 🎭",
  "🌟 Giữ cho tài chính của bạn luôn sáng! ✨",
  "🚀 Nâng cao trò chơi ngân sách của bạn! 💪",
  "🎁 Theo dõi ngay, cảm ơn bản thân sau! 🎉",
  "💼 Theo dõi chi tiêu chuyên nghiệp! 📊",
];

/**
 * Get current language setting
 */
async function getCurrentLanguage(): Promise<"vie" | "eng"> {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return language === "vie" ? "vie" : "eng";
  } catch (error) {
    return "eng"; // Default to English
  }
}

/**
 * Get a random notification message based on current language
 */
async function getRandomNotificationMessage(): Promise<string> {
  const language = await getCurrentLanguage();
  const messages =
    language === "vie" ? NOTIFICATION_MESSAGES_VI : NOTIFICATION_MESSAGES_EN;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Create or get notification channel (required for Android)
 */
async function ensureNotificationChannel(): Promise<string> {
  if (Platform.OS === "android") {
    try {
      const channel =
        await Notifications.getNotificationChannelAsync(REMINDER_CHANNEL_ID);
      if (channel) {
        return REMINDER_CHANNEL_ID;
      }

      await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
        name: "Reminders",
        description: "Daily reminder notifications",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    } catch (error) {
      console.error("Failed to create notification channel:", error);
    }
  }
  return REMINDER_CHANNEL_ID;
}

export interface ReminderSettings {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

/**
 * Get reminder settings from storage
 */
export async function getReminderSettings(): Promise<ReminderSettings> {
  try {
    const [enabledStr, hourStr, minuteStr] = await Promise.all([
      AsyncStorage.getItem(REMINDER_ENABLED_KEY),
      AsyncStorage.getItem(REMINDER_HOUR_KEY),
      AsyncStorage.getItem(REMINDER_MINUTE_KEY),
    ]);

    return {
      enabled: enabledStr === "true",
      hour: hourStr ? parseInt(hourStr, 10) : 20, // Default to 8 PM
      minute: minuteStr ? parseInt(minuteStr, 10) : 0,
    };
  } catch (error) {
    return {
      enabled: false,
      hour: 20,
      minute: 0,
    };
  }
}

/**
 * Save reminder settings to storage
 */
export async function saveReminderSettings(
  settings: ReminderSettings,
): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(REMINDER_ENABLED_KEY, settings.enabled.toString()),
      AsyncStorage.setItem(REMINDER_HOUR_KEY, settings.hour.toString()),
      AsyncStorage.setItem(REMINDER_MINUTE_KEY, settings.minute.toString()),
    ]);
  } catch (error) {
    console.error("Failed to save reminder settings:", error);
  }
}

/**
 * Schedule daily reminder notification
 */
export async function scheduleReminderNotification(
  hour: number,
  minute: number,
): Promise<string | null> {
  try {
    // Validate hour is within valid range (0-23)
    const validHour = Math.max(0, Math.min(23, Math.floor(hour)));
    // Validate minute is within valid range (0-59)
    const validMinute = Math.max(0, Math.min(59, Math.floor(minute)));

    // Cancel any existing reminders
    await cancelAllReminderNotifications();

    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn("Notification permissions not granted");
      return null;
    }

    // Ensure notification channel exists (required for Android)
    const channelId = await ensureNotificationChannel();

    // Schedule daily notification with a unique identifier
    const identifier = `reminder-${validHour}-${validMinute}`;

    // Get a random notification message based on current language
    const randomMessage = await getRandomNotificationMessage();

    // Get notification title based on language
    const language = await getCurrentLanguage();
    const title = language === "vie" ? "Nhắc nhở" : "Reminder";

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body: randomMessage,
        sound: true,
      },
      trigger: {
        hour: validHour,
        minute: validMinute,
        repeats: true,
        channelId,
      },
    });

    return notificationId;
  } catch (error) {
    console.error("Failed to schedule reminder:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return null;
  }
}

/**
 * Cancel all reminder notifications
 */
export async function cancelAllReminderNotifications(): Promise<void> {
  try {
    const allNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const reminderNotifications = allNotifications.filter((notification) =>
      notification.identifier.startsWith("reminder-"),
    );

    await Promise.all(
      reminderNotifications.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
    );
  } catch (error) {
    console.error("Failed to cancel reminders:", error);
  }
}

/**
 * Update reminder notification with new settings
 */
export async function updateReminderNotification(
  enabled: boolean,
  hour: number,
  minute: number,
): Promise<void> {
  if (enabled) {
    await scheduleReminderNotification(hour, minute);
  } else {
    await cancelAllReminderNotifications();
  }
  await saveReminderSettings({ enabled, hour, minute });
}
