import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  coachBubbleMessage,
  computeTargets,
  getPreviousResult,
  prettyDate,
  sumNutrients,
  todayKey,
  type DateEvent,
  type Meal,
  type WorkoutResult,
} from "@nutrition-app/shared";
import { useProfile } from "../../src/hooks/useProfile";
import { getMeals, deleteMeal } from "../../src/api/meals";
import { getDateEvents } from "../../src/api/calendar";
import { getWorkoutHistory } from "../../src/api/weightAndWorkouts";
import { AdBanner } from "../../src/components/AdBanner";
import { NutritionFacts } from "../../src/components/NutritionFacts";
import { colors } from "../../src/theme";

export default function TodayScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading, needsOnboarding } = useProfile();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [todayEvents, setTodayEvents] = useState<DateEvent[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullFacts, setShowFullFacts] = useState(false);

  const loadDay = useCallback(async () => {
    const date = todayKey();
    setLoading(true);
    try {
      const [mealsResult, eventsResult, historyResult] = await Promise.all([
        getMeals(date),
        getDateEvents(date, date),
        getWorkoutHistory(),
      ]);
      setMeals(mealsResult);
      setTodayEvents(eventsResult);
      setWorkoutHistory(historyResult);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (needsOnboarding) router.replace("/onboarding");
  }, [needsOnboarding, router]);

  useFocusEffect(
    useCallback(() => {
      if (profile) loadDay();
    }, [profile, loadDay])
  );

  if (profileLoading || !profile || loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.rust} />
      </View>
    );
  }

  const targets = computeTargets(profile);
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const remaining = targets.calories - totalCalories;
  const overTarget = remaining < 0;
  const todaysWorkout = todayEvents.find((e) => e.type === "workout") ?? null;
  const prevResult = todaysWorkout ? getPreviousResult(workoutHistory, todaysWorkout.label) : null;

  const coachMessage = coachBubbleMessage(profile.motivationMode, {
    mealsLogged: meals.length,
    remaining,
    overTarget,
    dietStyle: profile.dietStyle,
    hasWorkoutToday: Boolean(todaysWorkout),
    prevResult,
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        ListHeaderComponent={
          <View style={{ padding: 20, gap: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: "800", color: colors.ink }}>{prettyDate()}</Text>

            {coachMessage ? (
              <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14 }}>
                <Text style={{ color: colors.ink }}>{coachMessage}</Text>
              </View>
            ) : null}

            {todaysWorkout ? (
              <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14, gap: 4 }}>
                <Text style={{ fontWeight: "700", color: colors.green }}>Today's workout</Text>
                <Text style={{ color: colors.ink }}>{todaysWorkout.label}</Text>
                {prevResult ? <Text style={{ color: colors.muted }}>Last time: {prevResult}</Text> : null}
              </View>
            ) : null}

            <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 16, gap: 8 }}>
              <Text style={{ fontWeight: "800", fontSize: 18, color: colors.ink }}>Daily totals</Text>
              <Text style={{ color: overTarget ? colors.rust : colors.ink }}>
                {Math.round(totalCalories)} / {targets.calories} cal {overTarget ? `(${Math.round(-remaining)} over)` : `(${Math.round(remaining)} left)`}
              </Text>
              <MacroRow label="Protein" value={meals.reduce((s, m) => s + m.protein_g, 0)} target={targets.protein} color={colors.green} />
              <MacroRow label="Carbs" value={meals.reduce((s, m) => s + m.carbs_g, 0)} target={targets.carbs} color={colors.amber} />
              <MacroRow label="Fat" value={meals.reduce((s, m) => s + m.fat_g, 0)} target={targets.fat} color={colors.plum} />

              <Pressable onPress={() => setShowFullFacts((v) => !v)} style={{ marginTop: 4 }}>
                <Text style={{ color: colors.rust, fontWeight: "600" }}>{showFullFacts ? "Hide" : "Show"} full nutrition facts</Text>
              </Pressable>
              {showFullFacts ? <NutritionFacts totals={sumNutrients(meals)} /> : null}
            </View>

            <Pressable
              onPress={() => router.push("/(tabs)/log")}
              style={{ backgroundColor: colors.rust, borderRadius: 10, padding: 14, alignItems: "center" }}
            >
              <Text style={{ color: colors.paper, fontWeight: "700" }}>Log a meal</Text>
            </Pressable>

            <Text style={{ fontWeight: "700", color: colors.ink, marginTop: 8 }}>Today's meals</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ marginHorizontal: 20, marginBottom: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, flexDirection: "row", gap: 12, alignItems: "center" }}>
            {item.thumbUrl ? <Image source={{ uri: item.thumbUrl }} style={{ width: 48, height: 48, borderRadius: 8 }} /> : null}
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: colors.ink }}>{item.name}</Text>
              <Text style={{ color: colors.muted }}>
                {Math.round(item.calories)} cal · P{Math.round(item.protein_g)} C{Math.round(item.carbs_g)} F{Math.round(item.fat_g)}
              </Text>
            </View>
            <Pressable onPress={() => deleteMeal(item.id).then(loadDay)}>
              <Text style={{ color: colors.rust, fontWeight: "700" }}>Delete</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={{ marginHorizontal: 20, color: colors.muted }}>No meals logged yet today.</Text>}
        ListFooterComponent={<AdBanner />}
      />
    </View>
  );
}

function MacroRow({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min(1, value / target);
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: colors.ink }}>
        {label}: {Math.round(value)}g / {target}g
      </Text>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: "#EEEBE1" }}>
        <View style={{ height: 6, borderRadius: 3, width: `${pct * 100}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}
