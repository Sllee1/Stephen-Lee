import { STRENGTH_DAYS_BY_GOAL, STRENGTH_SLOTS } from "../constants/eatingPresets";
import type { Goal } from "../types";

export type WorkoutLocation = "home" | "gym" | "outside";
export type WorkoutEquipment = "bodyweight" | "weights" | "mixed";
export type CardioLevel = "low" | "moderate" | "high";

const CARDIO_SESSIONS_BY_LEVEL: Record<CardioLevel, number> = { low: 1, moderate: 2, high: 3 };
const PUSH_PULL_LEGS = ["Push (chest/shoulders/triceps)", "Pull (back/biceps)", "Legs", "Full-body"];

export interface WorkoutScheduleInput {
  goal: Goal;
  location: WorkoutLocation;
  equipment: WorkoutEquipment;
  cardioLevel: CardioLevel;
}

export interface WorkoutDay {
  day: number; // 0=Sun..6=Sat
  kind: "strength" | "cardio" | "rest";
  label: string;
}

function gearLabel(equipment: WorkoutEquipment): string {
  if (equipment === "bodyweight") return "bodyweight";
  if (equipment === "weights") return "weights";
  return "weights + bodyweight";
}

function placeLabel(location: WorkoutLocation): string {
  if (location === "gym") return "at the gym";
  if (location === "home") return "at home";
  return "outside";
}

function cardioLabel(location: WorkoutLocation, sport: string | null): string {
  if (sport && sport !== "none") return `${sport[0].toUpperCase()}${sport.slice(1)} session`;
  if (location === "outside") return "Outdoor cardio — run, bike, or hike";
  if (location === "gym") return "Cardio machines — bike, rower, or treadmill";
  return "Home cardio — jump rope or HIIT circuit";
}

/** Builds a 7-day (Sun..Sat) schedule. Mirrors the prototype's `buildWorkoutSchedule`. */
export function buildWorkoutSchedule(input: WorkoutScheduleInput, sport: string | null = null): WorkoutDay[] {
  const strengthCount = STRENGTH_DAYS_BY_GOAL[input.goal];
  const strengthSlots = new Set(STRENGTH_SLOTS[strengthCount] ?? STRENGTH_SLOTS[3]);
  const cardioCount = CARDIO_SESSIONS_BY_LEVEL[input.cardioLevel];
  const gear = gearLabel(input.equipment);
  const place = placeLabel(input.location);

  const days: WorkoutDay[] = [];
  let cardioPlaced = 0;
  let strengthIndex = 0;

  // Mon(1)..Sun(0) iteration order to match the prototype's weekday-first fill.
  const order = [1, 2, 3, 4, 5, 6, 0];
  const byDay = new Map<number, WorkoutDay>();

  for (const day of order) {
    if (strengthSlots.has(day)) {
      const label = strengthCount >= 4 ? PUSH_PULL_LEGS[strengthIndex % PUSH_PULL_LEGS.length] : "Full-body strength";
      byDay.set(day, { day, kind: "strength", label: `${label} — ${gear}, ${place}` });
      strengthIndex++;
    } else if (cardioPlaced < cardioCount) {
      byDay.set(day, { day, kind: "cardio", label: cardioLabel(input.location, sport) });
      cardioPlaced++;
    } else {
      byDay.set(day, { day, kind: "rest", label: "Rest or light mobility" });
    }
  }

  for (let d = 0; d <= 6; d++) days.push(byDay.get(d)!);
  return days;
}
