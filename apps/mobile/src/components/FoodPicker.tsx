import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { FOOD_DATABASE, NUTRIENT_KEYS, type FoodDatabaseEntry, type MealItem, type NutrientTotals, type UsdaFoodResult } from "@nutrition-app/shared";
import { lookupFoodByName } from "../api/ai";
import { searchUsdaFoods } from "../api/foods";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { colors } from "../theme";

type Mode = "quick" | "ai" | "manual";
type PickableFood = FoodDatabaseEntry | UsdaFoodResult;

interface Props {
  onAdd: (item: MealItem) => void;
  onClose: () => void;
}

function scaledTotals(food: PickableFood, servings: number): NutrientTotals {
  const totals = {} as NutrientTotals;
  for (const key of NUTRIENT_KEYS) totals[key] = Math.round(food[key] * servings * 10) / 10;
  return totals;
}

function emptyTotals(): NutrientTotals {
  return Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0])) as NutrientTotals;
}

/**
 * Three ways to add a food item without a photo, matching the prototype's
 * FoodPicker: a fast local shortlist (FOOD_DATABASE), a free-text AI lookup
 * for anything not in that shortlist, and fully manual entry.
 */
export function FoodPicker({ onAdd, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("quick");

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 0 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.ink }}>Add a food</Text>
        <Pressable onPress={onClose}>
          <Text style={{ color: colors.rust, fontWeight: "700" }}>Close</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 6, padding: 20, paddingBottom: 10 }}>
        <ModeChip label="Quick add" active={mode === "quick"} onPress={() => setMode("quick")} />
        <ModeChip label="AI lookup" active={mode === "ai"} onPress={() => setMode("ai")} />
        <ModeChip label="Manual" active={mode === "manual"} onPress={() => setMode("manual")} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 16 }}>
        {mode === "quick" ? <QuickAdd onAdd={onAdd} /> : null}
        {mode === "ai" ? <AiLookup onAdd={onAdd} /> : null}
        {mode === "manual" ? <ManualEntry onAdd={onAdd} /> : null}
      </ScrollView>
    </View>
  );
}

function QuickAdd({ onAdd }: { onAdd: (item: MealItem) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PickableFood | null>(null);
  const [servings, setServings] = useState(1);
  const [usdaResults, setUsdaResults] = useState<UsdaFoodResult[]>([]);
  const [usdaLoading, setUsdaLoading] = useState(false);
  const [usdaError, setUsdaError] = useState(false);

  const debouncedQuery = useDebouncedValue(query.trim(), 400);

  const localResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return FOOD_DATABASE.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  // Local FOOD_DATABASE is instant (~170 common items); USDA FoodData
  // Central covers everything else, at the cost of a network round trip —
  // debounced so typing doesn't fire a request per keystroke.
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setUsdaResults([]);
      setUsdaError(false);
      return;
    }
    let cancelled = false;
    setUsdaLoading(true);
    setUsdaError(false);
    searchUsdaFoods(debouncedQuery)
      .then((results) => {
        if (!cancelled) setUsdaResults(results);
      })
      .catch(() => {
        if (!cancelled) setUsdaError(true);
      })
      .finally(() => {
        if (!cancelled) setUsdaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const preview = selected ? scaledTotals(selected, servings) : null;

  function add() {
    if (!selected || !preview) return;
    onAdd({
      id: `quick-${Date.now()}`,
      name: selected.name,
      quantity: `${servings} × ${selected.serving}`,
      ...preview,
    });
    setSelected(null);
    setQuery("");
    setServings(1);
  }

  return (
    <View style={{ gap: 12 }}>
      <TextInput
        value={query}
        onChangeText={(t) => {
          setQuery(t);
          setSelected(null);
        }}
        placeholder="Search foods (e.g. chicken breast)"
        style={inputStyle}
      />

      {localResults.length > 0 && !selected ? (
        <View style={{ gap: 6 }}>
          {localResults.map((food) => (
            <Pressable
              key={food.name}
              onPress={() => setSelected(food)}
              style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12 }}
            >
              <Text style={{ fontWeight: "600", color: colors.ink }}>{food.name}</Text>
              <Text style={{ color: colors.muted }}>{food.serving} · {food.calories} cal</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {!selected && debouncedQuery.length >= 3 ? (
        <View style={{ gap: 6 }}>
          <Text style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase" }}>From USDA FoodData Central</Text>
          {usdaLoading ? (
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <ActivityIndicator color={colors.rust} size="small" />
              <Text style={{ color: colors.muted }}>Searching…</Text>
            </View>
          ) : usdaError ? (
            <Text style={{ color: colors.muted }}>Couldn't reach the USDA database — try AI lookup instead.</Text>
          ) : usdaResults.length === 0 ? (
            <Text style={{ color: colors.muted }}>No matches — try AI lookup instead.</Text>
          ) : (
            usdaResults.map((food) => (
              <Pressable
                key={food.fdcId}
                onPress={() => setSelected(food)}
                style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12 }}
              >
                <Text style={{ fontWeight: "600", color: colors.ink }}>{food.name}</Text>
                <Text style={{ color: colors.muted }}>per {food.serving} · {Math.round(food.calories)} cal</Text>
              </Pressable>
            ))
          )}
        </View>
      ) : null}

      {query.trim() && query.trim().length < 3 && localResults.length === 0 && !selected ? (
        <Text style={{ color: colors.muted }}>Keep typing — USDA search kicks in at 3 characters.</Text>
      ) : null}

      {selected && preview ? (
        <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, gap: 10 }}>
          <Text style={{ fontWeight: "700", color: colors.ink }}>{selected.name}</Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable onPress={() => setServings((s) => Math.max(0.5, s - 0.5))} style={stepperButtonStyle}>
              <Text style={{ color: colors.ink, fontWeight: "800" }}>−</Text>
            </Pressable>
            <Text style={{ color: colors.ink, fontWeight: "600" }}>{servings} × {selected.serving}</Text>
            <Pressable onPress={() => setServings((s) => s + 0.5)} style={stepperButtonStyle}>
              <Text style={{ color: colors.ink, fontWeight: "800" }}>+</Text>
            </Pressable>
          </View>

          <Text style={{ color: colors.muted }}>
            {preview.calories} cal · P{preview.protein_g}g C{preview.carbs_g}g F{preview.fat_g}g
          </Text>

          <Pressable onPress={add} style={{ backgroundColor: colors.green, borderRadius: 8, padding: 12, alignItems: "center" }}>
            <Text style={{ color: colors.paper, fontWeight: "700" }}>Add to meal</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function AiLookup({ onAdd }: { onAdd: (item: MealItem) => void }) {
  const [name, setName] = useState("");
  const [servingHint, setServingHint] = useState("");
  const [looking, setLooking] = useState(false);
  const [result, setResult] = useState<{ serving: string } & NutrientTotals & { found: boolean }>();
  const [editable, setEditable] = useState({ calories: "0", protein_g: "0", carbs_g: "0", fat_g: "0" });

  async function lookup() {
    if (!name.trim()) return;
    setLooking(true);
    try {
      const response = await lookupFoodByName(name.trim(), servingHint.trim() || undefined);
      setResult(response);
      setEditable({
        calories: String(response.calories),
        protein_g: String(response.protein_g),
        carbs_g: String(response.carbs_g),
        fat_g: String(response.fat_g),
      });
    } catch {
      Alert.alert("Lookup failed", "Couldn't look that up — try a more specific name, or add it manually.");
    } finally {
      setLooking(false);
    }
  }

  function add() {
    if (!result) return;
    onAdd({
      id: `lookup-${Date.now()}`,
      name: name.trim(),
      quantity: result.serving,
      ...result,
      calories: Number(editable.calories) || 0,
      protein_g: Number(editable.protein_g) || 0,
      carbs_g: Number(editable.carbs_g) || 0,
      fat_g: Number(editable.fat_g) || 0,
    });
    setName("");
    setServingHint("");
    setResult(undefined);
  }

  return (
    <View style={{ gap: 12 }}>
      <TextInput value={name} onChangeText={setName} placeholder="Food name (e.g. tempeh stir-fry)" style={inputStyle} />
      <TextInput value={servingHint} onChangeText={setServingHint} placeholder="Serving (optional, e.g. 1 cup)" style={inputStyle} />

      <Pressable onPress={lookup} disabled={looking} style={{ backgroundColor: colors.ink, borderRadius: 10, padding: 12, alignItems: "center" }}>
        {looking ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Look up nutrition</Text>}
      </Pressable>

      {result ? (
        <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, gap: 10 }}>
          {!result.found ? <Text style={{ color: colors.amber }}>Not confident this is a real food — double check before adding.</Text> : null}
          <Text style={{ color: colors.muted }}>Serving used: {result.serving}</Text>

          <MacroField label="Calories" value={editable.calories} onChangeText={(v) => setEditable((e) => ({ ...e, calories: v }))} />
          <MacroField label="Protein (g)" value={editable.protein_g} onChangeText={(v) => setEditable((e) => ({ ...e, protein_g: v }))} />
          <MacroField label="Carbs (g)" value={editable.carbs_g} onChangeText={(v) => setEditable((e) => ({ ...e, carbs_g: v }))} />
          <MacroField label="Fat (g)" value={editable.fat_g} onChangeText={(v) => setEditable((e) => ({ ...e, fat_g: v }))} />

          <Pressable onPress={add} style={{ backgroundColor: colors.green, borderRadius: 8, padding: 12, alignItems: "center" }}>
            <Text style={{ color: colors.paper, fontWeight: "700" }}>Add to meal</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function ManualEntry({ onAdd }: { onAdd: (item: MealItem) => void }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  function add() {
    if (!name.trim()) return;
    onAdd({
      id: `manual-${Date.now()}`,
      name: name.trim(),
      ...emptyTotals(),
      calories: Number(calories) || 0,
      protein_g: Number(protein) || 0,
      carbs_g: Number(carbs) || 0,
      fat_g: Number(fat) || 0,
    });
    setName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
  }

  return (
    <View style={{ gap: 12 }}>
      <TextInput value={name} onChangeText={setName} placeholder="What did you eat?" style={inputStyle} />
      <MacroField label="Calories" value={calories} onChangeText={setCalories} />
      <MacroField label="Protein (g)" value={protein} onChangeText={setProtein} />
      <MacroField label="Carbs (g)" value={carbs} onChangeText={setCarbs} />
      <MacroField label="Fat (g)" value={fat} onChangeText={setFat} />
      <Pressable onPress={add} style={{ backgroundColor: colors.green, borderRadius: 8, padding: 12, alignItems: "center" }}>
        <Text style={{ color: colors.paper, fontWeight: "700" }}>Add to meal</Text>
      </Pressable>
      <Text style={{ color: colors.muted, fontSize: 12 }}>Other nutrients (fiber, sodium, vitamins, ...) default to 0 for manual entries.</Text>
    </View>
  );
}

function MacroField({ label, value, onChangeText }: { label: string; value: string; onChangeText: (v: string) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <Text style={{ color: colors.ink }}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} keyboardType="decimal-pad" style={[inputStyle, { width: 100, textAlign: "right" }]} />
    </View>
  );
}

function ModeChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: active ? colors.ink : colors.card,
      }}
    >
      <Text style={{ color: active ? colors.paper : colors.ink, fontWeight: "600", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.line,
  borderRadius: 8,
  padding: 10,
  color: colors.ink,
  backgroundColor: colors.card,
};

const stepperButtonStyle = {
  width: 32,
  height: 32,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.line,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
