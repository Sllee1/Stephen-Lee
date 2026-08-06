import React from "react";
import { Text, View } from "react-native";
import { NUTRIENT_KEYS, type NutrientKey, type NutrientTotals } from "@nutrition-app/shared";
import { colors } from "../theme";

const LABELS: Record<NutrientKey, string> = {
  calories: "Calories",
  protein_g: "Protein",
  carbs_g: "Carbs",
  fat_g: "Total Fat",
  satFat_g: "Saturated Fat",
  fiber_g: "Fiber",
  sugar_g: "Sugar",
  sodium_mg: "Sodium",
  cholesterol_mg: "Cholesterol",
  vitD_mcg: "Vitamin D",
  calcium_mg: "Calcium",
  iron_mg: "Iron",
  potassium_mg: "Potassium",
  vitA_mcg: "Vitamin A",
  vitC_mg: "Vitamin C",
  vitB1_mg: "Vitamin B1 (Thiamin)",
  vitB2_mg: "Vitamin B2 (Riboflavin)",
  vitB3_mg: "Vitamin B3 (Niacin)",
  vitB5_mg: "Vitamin B5 (Pantothenic Acid)",
  vitB6_mg: "Vitamin B6",
  vitB7_mcg: "Vitamin B7 (Biotin)",
  vitB9_mcg: "Vitamin B9 (Folate)",
  vitB12_mcg: "Vitamin B12",
  vitE_mg: "Vitamin E",
  vitK_mcg: "Vitamin K",
  magnesium_mg: "Magnesium",
  zinc_mg: "Zinc",
  iodine_mcg: "Iodine",
  phosphorus_mg: "Phosphorus",
};

const UNITS: Record<NutrientKey, string> = {
  calories: "",
  protein_g: "g",
  carbs_g: "g",
  fat_g: "g",
  satFat_g: "g",
  fiber_g: "g",
  sugar_g: "g",
  sodium_mg: "mg",
  cholesterol_mg: "mg",
  vitD_mcg: "mcg",
  calcium_mg: "mg",
  iron_mg: "mg",
  potassium_mg: "mg",
  vitA_mcg: "mcg",
  vitC_mg: "mg",
  vitB1_mg: "mg",
  vitB2_mg: "mg",
  vitB3_mg: "mg",
  vitB5_mg: "mg",
  vitB6_mg: "mg",
  vitB7_mcg: "mcg",
  vitB9_mcg: "mcg",
  vitB12_mcg: "mcg",
  vitE_mg: "mg",
  vitK_mcg: "mcg",
  magnesium_mg: "mg",
  zinc_mg: "mg",
  iodine_mcg: "mcg",
  phosphorus_mg: "mg",
};

/**
 * FDA 2020 Nutrition Facts label reference Daily Values (based on a
 * 2,000-calorie diet) — https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label.
 * Calories has no %DV on real labels, so it's omitted here. "sugar_g" is
 * total sugar in our data (photo/lookup estimates don't distinguish added
 * vs. naturally occurring), so its %DV borrows the FDA's "added sugars"
 * reference (50g) as the closest available benchmark rather than an exact
 * match.
 */
const DAILY_VALUES: Partial<Record<NutrientKey, number>> = {
  protein_g: 50,
  carbs_g: 275,
  fat_g: 78,
  satFat_g: 20,
  fiber_g: 28,
  sugar_g: 50,
  sodium_mg: 2300,
  cholesterol_mg: 300,
  vitD_mcg: 20,
  calcium_mg: 1300,
  iron_mg: 18,
  potassium_mg: 4700,
  vitA_mcg: 900,
  vitC_mg: 90,
  vitB1_mg: 1.2,
  vitB2_mg: 1.3,
  vitB3_mg: 16,
  vitB5_mg: 5,
  vitB6_mg: 1.7,
  vitB7_mcg: 30,
  vitB9_mcg: 400,
  vitB12_mcg: 2.4,
  vitE_mg: 15,
  vitK_mcg: 120,
  magnesium_mg: 420,
  zinc_mg: 11,
  iodine_mcg: 150,
  phosphorus_mg: 1250,
};

/**
 * Nutrients worth color-coding toward "get enough of" (red at 0%, amber
 * partway, green at 100%+). Deliberately excludes carbs/saturated fat/
 * sugar/sodium/cholesterol — those are limit-conscious, not "more is
 * better up to 100%" nutrients, so a green 100% there would send the wrong
 * signal. Total fat is included since (unlike saturated fat) it's a target
 * to hit, not just a ceiling.
 */
const GET_ENOUGH_KEYS = new Set<NutrientKey>([
  "protein_g",
  "fat_g",
  "fiber_g",
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
]);

function dvColor(pct: number): string {
  if (pct <= 0) return colors.rust;
  if (pct < 100) return colors.amber;
  return colors.green;
}

/** Nutrition-facts-label-style breakdown of all 29 tracked nutrients, not just the four headline macros — with %DV shown for every nutrient (0% if none consumed yet). */
export function NutritionFacts({ totals }: { totals: NutrientTotals }) {
  return (
    <View style={{ gap: 3 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, borderBottomColor: colors.ink, paddingBottom: 4, marginBottom: 2 }}>
        <Text style={{ fontWeight: "800", color: colors.ink }}>Calories</Text>
        <Text style={{ fontWeight: "800", color: colors.ink }}>{Math.round(totals.calories)}</Text>
      </View>
      {NUTRIENT_KEYS.filter((key) => key !== "calories").map((key) => {
        const dv = DAILY_VALUES[key];
        const pct = dv ? Math.round((totals[key] / dv) * 100) : null;
        const colorCoded = pct !== null && GET_ENOUGH_KEYS.has(key);
        return (
          <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 2 }}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{LABELS[key]}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ color: colors.ink, fontSize: 13 }}>
                {Math.round(totals[key] * 10) / 10}
                {UNITS[key]}
              </Text>
              {pct !== null ? (
                <Text style={{ color: colorCoded ? dvColor(pct) : colors.muted, fontWeight: colorCoded ? "700" : "400", fontSize: 13, minWidth: 36, textAlign: "right" }}>
                  {pct}%
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
        % Daily Value based on a 2,000 calorie diet. Protein, total fat, fiber, and vitamins/minerals are colored — red at 0%, amber until you hit 100%, green at 100%+.
      </Text>
    </View>
  );
}
