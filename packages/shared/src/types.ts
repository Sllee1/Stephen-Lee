/**
 * Data model shared by the backend (Prisma <-> API) and the mobile app.
 * Ported from the NutritionTracker.jsx prototype's in-memory/localStorage
 * shapes. Every entity here is scoped to a `userId` server-side, which the
 * prototype didn't need (single-user, client-only storage).
 */

export type Sex = "male" | "female";
export type UnitPref = "imperial" | "metric";
export type Goal = "lose" | "maintain" | "gain";
export type MotivationMode = "none" | "moderate" | "extreme";
export type BmiPreference = "standard" | "adjusted";
export type DietStyle =
  | "balanced"
  | "vegetarian"
  | "vegan"
  | "keto"
  | "carnivore"
  | "mediterranean";

export interface Profile {
  userId: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: string; // ActivityLevel id
  goal: Goal;
  unitPref: UnitPref;
  goalWeightKg: number | null;
  physique: string | null; // Physique id
  targetBodyFatPct: number | null;
  motivationMode: MotivationMode;
  dietStyle: DietStyle;
  bmiPreference: BmiPreference;
}

/** The 29 nutrient fields tracked on every food item / meal / daily total. */
export const NUTRIENT_KEYS = [
  "calories",
  "protein_g",
  "carbs_g",
  "fat_g",
  "satFat_g",
  "fiber_g",
  "sugar_g",
  "sodium_mg",
  "cholesterol_mg",
  "vitD_mcg",
  "calcium_mg",
  "iron_mg",
  "potassium_mg",
  "vitA_mcg",
  "vitC_mg",
  "vitB1_mg",
  "vitB2_mg",
  "vitB3_mg",
  "vitB5_mg",
  "vitB6_mg",
  "vitB7_mcg",
  "vitB9_mcg",
  "vitB12_mcg",
  "vitE_mg",
  "vitK_mcg",
  "magnesium_mg",
  "zinc_mg",
  "iodine_mcg",
  "phosphorus_mg",
] as const;

export type NutrientKey = (typeof NUTRIENT_KEYS)[number];

export type NutrientTotals = Record<NutrientKey, number>;

export interface MealItem extends NutrientTotals {
  id: string;
  name: string;
  quantity?: string;
}

/** A food from USDA FoodData Central (via GET /foods/search), shaped like a FoodDatabaseEntry so the picker can treat both uniformly. */
export interface UsdaFoodResult extends NutrientTotals {
  fdcId: number;
  name: string;
  serving: string;
}

export interface Meal extends NutrientTotals {
  id: string;
  userId: string;
  date: string; // "YYYY-MM-DD" — the day this meal was logged against
  name: string;
  thumbUrl: string | null;
  time: string; // ISO timestamp
  items: MealItem[];
}

export type CalendarEventType = "workout" | "eating";

/** A recurring, day-of-week template entry (the "Week Template" view). */
export interface TemplateEvent {
  id: string;
  userId: string;
  day: number; // 0=Sun .. 6=Sat
  type: CalendarEventType;
  label: string;
  startTime: string | null; // "HH:MM" 24h
  endTime: string | null;
  notifyStart: boolean;
  notifyEnd: boolean;
}

/** A concrete-date calendar entry (the "Month Calendar" view). */
export interface DateEvent {
  id: string; // for auto-filled entries: `${dateKey}-${templateEventId}`
  userId: string;
  date: string; // "YYYY-MM-DD"
  type: CalendarEventType;
  label: string;
  startTime: string | null;
  endTime: string | null;
  notifyStart: boolean;
  notifyEnd: boolean;
  sourceTemplateEventId: string | null; // set when produced by auto-fill
}

export interface WeightEntry {
  id: string; // == date
  userId: string;
  date: string; // "YYYY-MM-DD"
  weightKg: number;
}

export interface WorkoutResult {
  id: string; // `${date}-${normalizedLabel}`
  userId: string;
  label: string;
  normalized: string;
  date: string; // "YYYY-MM-DD"
  value: string;
}

export type BuildLabel =
  | "very_muscular"
  | "athletic"
  | "average"
  | "lower_muscle_tone"
  | "unclear";

export interface BodyAnalysis {
  userId: string;
  thumbUrl: string;
  build: BuildLabel;
  bmiOffset: number;
  confidence: "low" | "medium" | "high";
  note: string;
  createdAt: string; // ISO timestamp
}

export type FillRange = "month" | "4weeks" | "8weeks" | "26weeks" | "52weeks" | "custom";

export type EntitlementTier = "free" | "premium";

export interface Entitlement {
  userId: string;
  tier: EntitlementTier;
  adsEnabled: boolean; // true when tier === "free"
  provider: "revenuecat" | "stripe" | null;
  productId: string | null;
  expiresAt: string | null; // ISO timestamp, null = non-expiring / not subscribed
}
