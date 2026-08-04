export function computeBMI(heightCm: number, weightKg: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export interface BmiCategory {
  label: string;
  colorToken: "amber" | "green" | "rust";
}

export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return { label: "Underweight", colorToken: "amber" };
  if (bmi < 25) return { label: "Normal range", colorToken: "green" };
  if (bmi < 30) return { label: "Overweight", colorToken: "rust" };
  return { label: "Obese", colorToken: "rust" };
}

/**
 * Blends the raw BMI with a photo-derived offset (see BodyAnalysis.bmiOffset).
 * Uncapped by design — a very muscular build can warrant a large adjustment.
 * Returns null if the analysis was inconclusive ("unclear") or the offset
 * isn't a finite number.
 */
export function adjustedBmi(rawBmi: number, build: string | null, bmiOffset: number | null | undefined): number | null {
  if (!build || build === "unclear") return null;
  if (typeof bmiOffset !== "number" || !Number.isFinite(bmiOffset)) return null;
  return rawBmi + bmiOffset;
}
