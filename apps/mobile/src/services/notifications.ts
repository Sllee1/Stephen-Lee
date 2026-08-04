import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { registerPushToken } from "../api/entitlement";

/**
 * Replaces the prototype's client-side `setInterval` polling (which only
 * fired while the tab was open and used the browser Notification API).
 * Actual scheduling now lives server-side (apps/backend/src/services/
 * notifications.ts, a once-a-minute cron) — this module only handles
 * requesting permission and registering the device's push token so the
 * backend can reach it.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") return false;

  const { data: token } = await Notifications.getExpoPushTokenAsync();
  await registerPushToken(token, Platform.OS === "ios" ? "ios" : "android");
  return true;
}
