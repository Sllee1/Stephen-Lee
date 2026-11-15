import cron from "node-cron";
import { Prisma, type PrismaClient } from "@prisma/client";
import { motivationMessage, timeToMinutes, todayKey, getPreviousResult, type MotivationMode } from "@nutrition-app/shared";
import { env } from "../env.js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * The prototype polled every 30s client-side (`setInterval`) and only fired
 * while the browser tab was open — a real app needs push to work while the
 * app is backgrounded/closed. This cron runs server-side once a minute,
 * finds every date-event whose start/end time matches "now" for its owner,
 * and sends an Expo push notification. Same de-dupe idea as the prototype's
 * `firedRef`, but backed by the `SentNotification` table instead of an
 * in-memory Set — its unique constraint on (eventId, flag, date) is what
 * actually prevents a double-send if two ticks (or two backend instances)
 * race on the same minute, which an in-memory Set can't guarantee across
 * processes.
 */
async function sendExpoPush(tokens: string[], title: string, body: string) {
  if (tokens.length === 0) return;
  await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(env.EXPO_ACCESS_TOKEN ? { Authorization: `Bearer ${env.EXPO_ACCESS_TOKEN}` } : {}),
    },
    body: JSON.stringify(tokens.map((to) => ({ to, title, body, sound: "default" }))),
  });
}

// Best-effort, once-per-day: drop rows from days that have already passed
// so the table doesn't grow forever. Not required for correctness (only
// `date`-matching rows are ever queried), just housekeeping.
let lastCleanupDate = "";
async function cleanupOldNotifications(prisma: PrismaClient, thresholdDate: string) {
  if (lastCleanupDate === thresholdDate) return;
  lastCleanupDate = thresholdDate;
  await prisma.sentNotification.deleteMany({ where: { date: { lt: thresholdDate } } });
}

// "now" in the server's own timezone (effectively UTC on Render) isn't what
// a scheduled HH:MM means — that's always the owning user's local wall-clock
// time. Node's Intl has full ICU, so this reads "now" directly in whatever
// IANA zone the profile stored (see Profile.timezone), no manual UTC-offset
// math needed (and it stays correct across DST changes for free).
function nowInTimezone(tz: string): { dateKey: string; minutes: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    const hour = get("hour") === "24" ? 0 : Number(get("hour")); // some ICU builds return "24" for midnight
    return { dateKey: `${get("year")}-${get("month")}-${get("day")}`, minutes: hour * 60 + Number(get("minute")) };
  } catch {
    // Unknown/invalid zone string — fall back to the server's own clock
    // rather than letting one bad profile take down the whole tick.
    const now = new Date();
    return { dateKey: todayKey(now), minutes: now.getHours() * 60 + now.getMinutes() };
  }
}

export async function checkAndFire(prisma: PrismaClient) {
  const serverToday = todayKey();
  // A user's local "today" can land on the UTC calendar day before or after
  // the server's own, depending on their offset — widen the window so no
  // timezone is missed right around midnight UTC.
  const yesterdayUtc = todayKey(new Date(Date.now() - 86400000));
  const tomorrowUtc = todayKey(new Date(Date.now() + 86400000));
  await cleanupOldNotifications(prisma, yesterdayUtc);

  const events = await prisma.dateEvent.findMany({ where: { date: { in: [yesterdayUtc, serverToday, tomorrowUtc] } } });
  if (events.length === 0) return;

  const profiles = await prisma.profile.findMany({ where: { userId: { in: [...new Set(events.map((e) => e.userId))] } } });
  const profileByUser = new Map(profiles.map((p) => [p.userId, p]));

  for (const event of events) {
    const profile = profileByUser.get(event.userId);
    const { dateKey: userToday, minutes: nowMinutes } = nowInTimezone(profile?.timezone || "UTC");
    if (event.date !== userToday) continue;

    for (const [flag, time, category] of [
      ["notifyStart", event.startTime, event.type === "eating" ? "eatingOpen" : "workoutStart"],
      ["notifyEnd", event.endTime, event.type === "eating" ? "eatingClose" : "workoutEnd"],
    ] as const) {
      const shouldNotify = event[flag] && time;
      if (!shouldNotify) continue;
      if (Math.abs(nowMinutes - timeToMinutes(time)) > 1) continue;

      try {
        await prisma.sentNotification.create({ data: { eventId: event.id, flag, date: event.date } });
      } catch (err) {
        // P2002 = unique constraint violation on (eventId, flag, date) —
        // already fired this minute (by this tick or a concurrent instance).
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue;
        throw err;
      }

      const workoutHistory =
        category === "workoutStart" ? await prisma.workoutResult.findMany({ where: { userId: event.userId } }) : [];

      const mode = (profile?.motivationMode ?? "none") as MotivationMode;
      const prev = category === "workoutStart" ? getPreviousResult(workoutHistory as any, event.label, event.date) : null;
      const resolvedCategory = category === "workoutStart" && prev ? "workoutStartWithPrev" : category;

      const title = motivationMessage(mode, resolvedCategory, event.label, {
        diet: profile?.dietStyle,
        prev: prev ?? undefined,
      });

      const tokens = await prisma.pushToken.findMany({ where: { userId: event.userId } });
      await sendExpoPush(
        tokens.map((t) => t.token),
        title,
        event.label
      );
    }
  }
}

export function startNotificationScheduler(prisma: PrismaClient) {
  return cron.schedule("* * * * *", () => {
    checkAndFire(prisma).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[notifications] scheduler tick failed", err);
    });
  });
}
