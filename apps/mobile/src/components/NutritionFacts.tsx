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

/** Nutrition-facts-label-style breakdown of all 15 tracked nutrients, not just the four headline macros. */
export function NutritionFacts({ totals }: { totals: NutrientTotals }) {
  return (
    <View style={{ gap: 3 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, borderBottomColor: colors.ink, paddingBottom: 4, marginBottom: 2 }}>
        <Text style={{ fontWeight: "800", color: colors.ink }}>Calories</Text>
        <Text style={{ fontWeight: "800", color: colors.ink }}>{Math.round(totals.calories)}</Text>
      </View>
      {NUTRIENT_KEYS.filter((key) => key !== "calories").map((key) => (
        <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 2 }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{LABELS[key]}</Text>
          <Text style={{ color: colors.ink, fontSize: 13 }}>
            {Math.round(totals[key] * 10) / 10}
            {UNITS[key]}
          </Text>
        </View>
      ))}
    </View>
  );
}
