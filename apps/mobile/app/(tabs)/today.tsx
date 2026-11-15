import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  coachBubbleMessage,
  computeTargets,
  formatTime,
  getPreviousResult,
  prettyDate,
  sumNutrients,
  todayKey,
  type DateEvent,
  type Meal,
  type WorkoutResult,
} from "@nutrition-app/shared";
import { useProfile } from "../../src/hooks/useProfile";
import { ApiError } from "../../src/api/client";
import { getMeals, deleteMeal } from "../../src/api/meals";
import { getDateEvents } from "../../src/api/calendar";
import { getWorkoutHistory } from "../../src/api/weightAndWorkouts";
import { AdBanner } from "../../src/components/AdBanner";
import { NutritionFacts } from "../../src/components/NutritionFacts";
import { Card } from "../../src/components/Card";
import { cardShadow, colors } from "../../src/theme";

export default function TodayScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading, needsOnboarding, error: profileError, refetch: refetchProfile } = useProfile();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [todayEvents, setTodayEvents] = useState<DateEvent[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayError, setDayError] = useState<string | null>(null);
  const [showFullFacts, setShowFullFacts] = useState(false);

  const loadDay = useCallback(async () => {
    const date = todayKey();
    setLoading(true);
    setDayError(null);
    try {
      const [mealsResult, eventsResult, historyResult] = await Promise.all([
        getMeals(date),
        getDateEvents(date, date),
        getWorkoutHistory(),
      ]);
      setMeals(mealsResult);
      setTodayEvents(eventsResult);
      setWorkoutHistory(historyResult);
    } catch (err) {
      setDayError(err instanceof ApiError ? err.message : "Couldn't load today's data — try again.");
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

  // useProfile() only fetches once per mount, and this tab stays mounted
  // in the background while other tabs are open — so without this, a
  // change made on Profile (e.g. switching Motivation mode) never reaches
  // this screen's already-cached `profile` until it happens to remount.
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
    }, [refetchProfile])
  );

  if (profileError) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper, padding: 24, gap: 12 }}>
        <Text style={{ color: colors.ink, textAlign: "center" }}>{profileError}</Text>
        <Pressable onPress={refetchProfile} style={{ backgroundColor: colors.ink, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 }}>
          <Text style={{ color: colors.paper, fontWeight: "700" }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (profileLoading || !profile || loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (dayError) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper, padding: 24, gap: 12 }}>
        <Text style={{ color: colors.ink, textAlign: "center" }}>{dayError}</Text>
        <Pressable onPress={loadDay} style={{ backgroundColor: colors.ink, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 }}>
          <Text style={{ color: colors.paper, fontWeight: "700" }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const targets = computeTargets(profile);
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const remaining = targets.calories - totalCalories;
  const overTarget = remaining < 0;
  const todaysWorkouts = todayEvents.filter((e) => e.type === "workout").sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
  const todaysEating = todayEvents.filter((e) => e.type === "eating").sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
  const firstPrevResult = todaysWorkouts[0] ? getPreviousResult(workoutHistory, todaysWorkouts[0].label) : null;

  const coachMessage = coachBubbleMessage(profile.motivationMode, {
    mealsLogged: meals.length,
    remaining,
    overTarget,
    dietStyle: profile.dietStyle,
    hasWorkoutToday: todaysWorkouts.length > 0,
    prevResult: firstPrevResult,
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        ListHeaderComponent={
          <View style={{ padding: 20, gap: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: "800", color: colors.ink }}>{prettyDate()}</Text>
            <Text style={{ color: colors.ink }}>{greeting()}</Text>

            {coachMessage ? (
              <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 14, ...cardShadow }}>
                <Text style={{ color: colors.ink }}>{coachMessage}</Text>
              </View>
            ) : null}

            {todaysWorkouts.length > 0 || todaysEating.length > 0 ? (
              <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 14, gap: 10, ...cardShadow }}>
                <Text style={{ fontWeight: "700", color: colors.ink }}>Today's schedule</Text>
                {todaysWorkouts.map((w, i) => (
                  <View key={w.id} style={{ gap: 2 }}>
                    <Text style={{ fontWeight: "600", color: colors.green }}>{w.label}</Text>
                    {w.startTime ? (
                      <Text style={{ color: colors.muted }}>
                        {formatTime(w.startTime)}
                        {w.endTime ? ` – ${formatTime(w.endTime)}` : ""}
                      </Text>
                    ) : null}
                    {i === 0 && firstPrevResult ? <Text style={{ color: colors.muted }}>Last time: {firstPrevResult}</Text> : null}
                  </View>
                ))}
                {todaysEating.map((e) => (
                  <View key={e.id} style={{ gap: 2 }}>
                    <Text style={{ fontWeight: "600", color: colors.amber }}>{e.label}</Text>
                    {e.startTime ? (
                      <Text style={{ color: colors.muted }}>
                        {formatTime(e.startTime)}
                        {e.endTime ? ` – ${formatTime(e.endTime)}` : ""}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            <Card title="Daily totals" icon="stats-chart-outline">
              <Text style={{ color: overTarget ? colors.rust : colors.ink }}>
                {Math.round(totalCalories)} / {targets.calories} cal {overTarget ? `(${Math.round(-remaining)} over)` : `(${Math.round(remaining)} left)`}
              </Text>
              <MacroRow label="Protein" value={meals.reduce((s, m) => s + m.protein_g, 0)} target={targets.protein} color={colors.green} />
              <MacroRow label="Carbs" value={meals.reduce((s, m) => s + m.carbs_g, 0)} target={targets.carbs} color={colors.amber} />
              <MacroRow label="Fat" value={meals.reduce((s, m) => s + m.fat_g, 0)} target={targets.fat} color={colors.plum} />

              <Pressable onPress={() => setShowFullFacts((v) => !v)} style={{ marginTop: 4 }}>
                <Text style={{ color: colors.primary, fontWeight: "600" }}>{showFullFacts ? "Hide" : "Show"} full nutrition facts</Text>
              </Pressable>
              {showFullFacts ? <NutritionFacts totals={sumNutrients(meals)} /> : null}
            </Card>

            <Pressable
              onPress={() => router.push("/(tabs)/log")}
              style={{ backgroundColor: colors.primary, borderRadius: 10, padding: 14, alignItems: "center" }}
            >
              <Text style={{ color: colors.paper, fontWeight: "700" }}>Log a meal</Text>
            </Pressable>

            <Text style={{ fontWeight: "700", color: colors.ink, marginTop: 8 }}>Today's meals</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ marginHorizontal: 20, marginBottom: 12, backgroundColor: colors.card, borderRadius: 14, padding: 12, flexDirection: "row", gap: 12, alignItems: "center", ...cardShadow }}>
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

/** A baseline welcome, independent of Motivation mode — "none" mode (the default) suppresses coachMessage entirely, which otherwise left this area blank. */
function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! Here's your day.";
  if (hour < 18) return "Good afternoon! Here's your day.";
  return "Good evening! Here's your day.";
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
