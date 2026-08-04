import { ACTIVITY_LEVELS } from "../constants/activity";
import { PHYSIQUES } from "../constants/physiques";
import type { Goal, Sex } from "../types";

export interface BmrInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
}

export function computeBMR({ sex, age, heightCm, weightKg }: BmrInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export interface TargetsInput extends BmrInput {
  activity: string;
  goal: Goal;
  physique: string | null;
}

export interface Targets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tdee: number;
  bmr: number;
  /** True when the goal-driven deficit/surplus was clamped by the safety floor. */
  cappedNote: boolean;
}

export function computeTargets(profile: TargetsInput): Targets {
  const activity = ACTIVITY_LEVELS.find((a) => a.id === profile.activity) || ACTIVITY_LEVELS[1];
  const bmr = computeBMR(profile);
  const tdee = bmr * activity.mult;
  const floor = profile.sex === "male" ? 1500 : 1200;

  let adjustment = 0;
  if (profile.goal === "lose") adjustment = -500;
  if (profile.goal === "gain") adjustment = 350;

  const rawTarget = tdee + adjustment;
  const calories = Math.round(Math.max(floor, rawTarget));
  const cappedNote = rawTarget < floor;

  const proteinPerKg = PHYSIQUES.find((p) => p.id === profile.physique)?.proteinPerKg ?? 1.8;
  const protein = Math.round(profile.weightKg * proteinPerKg);
  const fat = Math.round((calories * 0.27) / 9);
  const carbsCals = calories - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(carbsCals / 4));

  return { calories, protein, carbs, fat, tdee: Math.round(tdee), bmr: Math.round(bmr), cappedNote };
}
