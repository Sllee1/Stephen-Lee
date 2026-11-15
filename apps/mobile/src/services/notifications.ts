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
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PushRegistrationResult =
  | { ok: true }
  | { ok: false; reason: "permission_denied" | "error"; detail?: string };

// The caller (Profile's "Enable reminders" button) used to fire this and
// forget — with no try/catch here, a thrown error (a bad push token fetch,
// a failed /push/register call) surfaced nowhere, so tapping the button
// looked identical whether it had worked or silently failed.
export async function registerForPushNotifications(): Promise<PushRegistrationResult> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== "granted") return { ok: false, reason: "permission_denied" };

    const { data: token } = await Notifications.getExpoPushTokenAsync();
    await registerPushToken(token, Platform.OS === "ios" ? "ios" : "android");
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: "error", detail: err instanceof Error ? err.message : String(err) };
  }
}
