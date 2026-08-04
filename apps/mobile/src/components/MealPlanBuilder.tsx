import React, { useMemo, useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  buildDayMeals,
  buildShoppingList,
  MEAL_LIBRARY,
  MEAL_STYLES,
  PHYSIQUES,
  todayDow,
  type DietStyle,
  type Profile,
  type ShoppingListItem,
  type Targets,
} from "@nutrition-app/shared";
import { saveProfile } from "../api/profile";
import { colors } from "../theme";

const STYLE_LABELS: Record<DietStyle, string> = {
  balanced: "Balanced",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  keto: "Keto",
  carnivore: "Carnivore",
  mediterranean: "Mediterranean",
};

const SHOPPING_DAY_OPTIONS = [3, 5, 7] as const;

const CATEGORY_ORDER: ShoppingListItem["category"][] = ["Produce", "Meat & Fish", "Dairy & Eggs", "Pantry & Grains", "Other"];

interface Props {
  profile: Profile;
  targets: Targets;
  onProfileSaved: () => void;
}

export function MealPlanBuilder({ profile, targets, onProfileSaved }: Props) {
  const [dietStyle, setDietStyle] = useState<DietStyle>(profile.dietStyle);
  const [shoppingDays, setShoppingDays] = useState<(typeof SHOPPING_DAY_OPTIONS)[number]>(5);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  const physique = PHYSIQUES.find((p) => p.id === profile.physique) ?? null;
  const suggestedStyle = physique?.suggestedMealStyle as DietStyle | undefined;
  const showSuggestion = Boolean(suggestedStyle && suggestedStyle !== dietStyle && !suggestionDismissed);

  function applyDietStyle(style: DietStyle) {
    setDietStyle(style);
    // Fire-and-forget: the chip should feel instant, and profile is
    // re-fetched (via onProfileSaved) on the next screen focus anyway.
    saveProfile({ dietStyle: style })
      .then(onProfileSaved)
      .catch(() => {
        /* non-fatal — local selection still drives the preview below */
      });
  }

  const lib = MEAL_LIBRARY[dietStyle];
  const scale = targets.calories / lib.baseCalories;
  const hasRecipes = lib.breakfast.length > 0 || lib.lunch.length > 0 || lib.dinner.length > 0 || lib.snack.length > 0;

  const todayMeals = useMemo(() => buildDayMeals(dietStyle, todayDow(), scale), [dietStyle, scale]);
  const shoppingList = useMemo(() => buildShoppingList(dietStyle, shoppingDays, scale), [dietStyle, shoppingDays, scale]);

  const groupedList = useMemo(() => {
    const groups = new Map<ShoppingListItem["category"], ShoppingListItem[]>();
    for (const item of shoppingList) {
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    }
    return CATEGORY_ORDER.map((category) => ({ category, items: groups.get(category) ?? [] })).filter((g) => g.items.length > 0);
  }, [shoppingList]);

  async function copyList() {
    const text = groupedList.map((g) => `${g.category}\n${g.items.map((i) => `- ${i.name}: ${i.quantity} ${i.unit}`).join("\n")}`).join("\n\n");
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Shopping list copied — paste it into Instacart or your notes app.");
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {MEAL_STYLES.map((style) => (
          <Chip key={style} label={STYLE_LABELS[style]} active={style === dietStyle} onPress={() => applyDietStyle(style)} />
        ))}
      </View>

      {showSuggestion && suggestedStyle ? (
        <Banner
          text={`Your physique (${physique?.label}) usually pairs with ${STYLE_LABELS[suggestedStyle]} eating.`}
          actionLabel={`Switch to ${STYLE_LABELS[suggestedStyle]}`}
          onAction={() => {
            applyDietStyle(suggestedStyle);
            setSuggestionDismissed(true);
          }}
          onDismiss={() => setSuggestionDismissed(true)}
        />
      ) : null}

      {!hasRecipes ? (
        <Text style={{ color: colors.muted }}>
          No recipes ported for {STYLE_LABELS[dietStyle]} yet — see the TODO in packages/shared/src/constants/mealLibrary.ts. Balanced has a full day's rotation.
        </Text>
      ) : (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "700", color: colors.ink }}>Today's plan ({targets.calories} cal target)</Text>
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((slot) => {
            const option = todayMeals[slot];
            if (!option) return null;
            return (
              <View key={slot} style={{ backgroundColor: colors.paper, borderRadius: 8, padding: 10 }}>
                <Text style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase" }}>{slot}</Text>
                <Text style={{ fontWeight: "600", color: colors.ink }}>{option.name}</Text>
                <Text style={{ color: colors.muted }}>
                  {option.calories} cal · P{option.protein}g C{option.carbs}g F{option.fat}g
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {hasRecipes ? (
        <View style={{ gap: 10, marginTop: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "700", color: colors.ink }}>Shopping list</Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {SHOPPING_DAY_OPTIONS.map((n) => (
                <Chip key={n} label={`${n}d`} active={n === shoppingDays} onPress={() => setShoppingDays(n)} small />
              ))}
            </View>
          </View>

          {groupedList.map((group) => (
            <View key={group.category} style={{ gap: 4 }}>
              <Text style={{ color: colors.rust, fontWeight: "700", fontSize: 12, textTransform: "uppercase" }}>{group.category}</Text>
              {group.items.map((item) => (
                <Text key={`${item.name}-${item.unit}`} style={{ color: colors.ink }}>
                  {item.name} — {item.quantity} {item.unit}
                </Text>
              ))}
            </View>
          ))}

          <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
            <Pressable onPress={copyList} style={{ flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 10, alignItems: "center" }}>
              <Text style={{ color: colors.ink, fontWeight: "600" }}>Copy list</Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL("https://www.instacart.com")}
              style={{ flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 10, alignItems: "center" }}
            >
              <Text style={{ color: colors.ink, fontWeight: "600" }}>Open Instacart</Text>
            </Pressable>
          </View>
          <Text style={{ color: colors.muted, fontSize: 12 }}>No live grocery integration — copy the list and paste it in.</Text>
        </View>
      ) : null}
    </View>
  );
}

function Chip({ label, active, onPress, small }: { label: string; active: boolean; onPress: () => void; small?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: small ? 5 : 8,
        paddingHorizontal: small ? 10 : 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: active ? colors.ink : colors.card,
      }}
    >
      <Text style={{ color: active ? colors.paper : colors.ink, fontWeight: "600", fontSize: small ? 12 : 14 }}>{label}</Text>
    </Pressable>
  );
}

function Banner({
  text,
  actionLabel,
  onAction,
  onDismiss,
}: {
  text: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
}) {
  return (
    <View style={{ backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.amber, borderRadius: 10, padding: 12, gap: 8 }}>
      <Text style={{ color: colors.ink }}>{text}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable onPress={onAction} style={{ backgroundColor: colors.amber, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 }}>
          <Text style={{ color: colors.paper, fontWeight: "700" }}>{actionLabel}</Text>
        </Pressable>
        <Pressable onPress={onDismiss} style={{ paddingVertical: 6, paddingHorizontal: 12 }}>
          <Text style={{ color: colors.muted }}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}
