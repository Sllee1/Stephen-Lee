import cron from "node-cron";
import type { PrismaClient } from "@prisma/client";
import { motivationMessage, timeToMinutes, todayKey, getPreviousResult, type MotivationMode } from "@nutrition-app/shared";
import { env } from "../env.js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * The prototype polled every 30s client-side (`setInterval`) and only fired
 * while the browser tab was open — a real app needs push to work while the
 * app is backgrounded/closed. This cron runs server-side once a minute,
 * finds every date-event whose start/end time matches "now" for its owner,
 * and sends an Expo push notification. Same de-dupe idea as the prototype's
 * `firedRef`, but backed by a `sentAt`-less in-memory set keyed by day —
 * good enough for a single backend instance; move to a `sent_notifications`
 * table (or a Redis set) before running more than one instance.
 */
const firedToday = new Set<string>();
let firedDate = todayKey();

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

async function checkAndFire(prisma: PrismaClient) {
  const today = todayKey();
  if (today !== firedDate) {
    firedToday.clear();
    firedDate = today;
  }

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
      const fireKey = `${event.id}-${flag}`;
      if (firedToday.has(fireKey)) continue;
      if (Math.abs(nowMinutes - timeToMinutes(time)) > 1) continue;

      firedToday.add(fireKey);

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
