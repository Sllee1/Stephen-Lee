/**
 * Request/response contracts for the four AI-backed features. The prototype
 * called `https://api.anthropic.com/v1/messages` directly from the client
 * with no auth header — a shippable-looking but unsafe pattern (it leaks
 * usage to anyone who inspects network traffic and has no key to leak only
 * because none was ever attached). In production these run server-side
 * (see apps/backend/src/services/anthropic.ts + routes/ai.ts) behind auth,
 * so the API key never reaches the client and usage can be rate-limited /
 * gated by entitlement.
 */

export interface AnalyzeFoodPhotoRequest {
  imageBase64: string; // JPEG, data URL prefix stripped
}

export interface AnalyzedFoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  satFat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  cholesterol_mg: number;
  vitD_mcg: number;
  calcium_mg: number;
  iron_mg: number;
  potassium_mg: number;
  vitA_mcg: number;
  vitC_mg: number;
}

export type AnalyzedFoodTotals = Omit<AnalyzedFoodItem, "name" | "quantity">;

export interface AnalyzeFoodPhotoResponse {
  items: AnalyzedFoodItem[];
  total: AnalyzedFoodTotals;
  confidence: "low" | "medium" | "high";
  notes: string;
}

export interface AnalyzeBuildPhotoRequest {
  imageBase64: string;
}

export interface AnalyzeBuildPhotoResponse {
  build: "very_muscular" | "athletic" | "average" | "lower_muscle_tone" | "unclear";
  bmiOffset: number;
  confidence: "low" | "medium" | "high";
  note: string;
}

export interface LookupFoodRequest {
  name: string;
  servingHint?: string;
}

export interface LookupFoodResponse {
  serving: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  satFat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  cholesterol_mg: number;
  vitD_mcg: number;
  calcium_mg: number;
  iron_mg: number;
  potassium_mg: number;
  vitA_mcg: number;
  vitC_mg: number;
  found: boolean;
}

export interface AnalyzeTechniqueVideoRequest {
  movementLabel: string | null;
  /** Evenly-spaced JPEG frames extracted client-side (video is never uploaded whole). */
  frames: { time: number; imageBase64: string }[];
}

export interface AnalyzeTechniqueVideoResponse {
  movement: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  safetyNotes: string[];
  confidence: "low" | "medium" | "high";
}
