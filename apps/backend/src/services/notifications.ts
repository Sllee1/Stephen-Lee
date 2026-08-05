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
async function cleanupOldNotifications(prisma: PrismaClient, today: string) {
  if (lastCleanupDate === today) return;
  lastCleanupDate = today;
  await prisma.sentNotification.deleteMany({ where: { date: { lt: today } } });
}

async function checkAndFire(prisma: PrismaClient) {
  const today = todayKey();
  await cleanupOldNotifications(prisma, today);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const events = await prisma.dateEvent.findMany({ where: { date: today } });

  for (const event of events) {
    for (const [flag, time, category] of [
      ["notifyStart", event.startTime, event.type === "eating" ? "eatingOpen" : "workoutStart"],
      ["notifyEnd", event.endTime, event.type === "eating" ? "eatingClose" : "workoutEnd"],
    ] as const) {
      const shouldNotify = event[flag] && time;
      if (!shouldNotify) continue;
      if (Math.abs(nowMinutes - timeToMinutes(time)) > 1) continue;

      try {
        await prisma.sentNotification.create({ data: { eventId: event.id, flag, date: today } });
      } catch (err) {
        // P2002 = unique constraint violation on (eventId, flag, date) —
        // already fired this minute (by this tick or a concurrent instance).
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue;
        throw err;
      }

      const [profile, workoutHistory] = await Promise.all([
        prisma.profile.findUnique({ where: { userId: event.userId } }),
        category === "workoutStart" ? prisma.workoutResult.findMany({ where: { userId: event.userId } }) : Promise.resolve([]),
      ]);

      const mode = (profile?.motivationMode ?? "none") as MotivationMode;
      const prev = category === "workoutStart" ? getPreviousResult(workoutHistory as any, event.label, today) : null;
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
