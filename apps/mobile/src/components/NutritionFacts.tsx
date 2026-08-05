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
};

/** Nutrition-facts-label-style breakdown of all 15 tracked nutrients, not just the four headline macros — with %DV shown for every nutrient (0% if none consumed yet). */
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
        return (
          <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 2 }}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{LABELS[key]}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ color: colors.ink, fontSize: 13 }}>
                {Math.round(totals[key] * 10) / 10}
                {UNITS[key]}
              </Text>
              {pct !== null ? <Text style={{ color: colors.muted, fontSize: 13, minWidth: 36, textAlign: "right" }}>{pct}%</Text> : null}
            </View>
          </View>
        );
      })}
      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>% Daily Value based on a 2,000 calorie diet.</Text>
    </View>
  );
}
