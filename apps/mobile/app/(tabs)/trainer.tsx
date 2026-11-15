import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { formatTime, GOALS, PHYSIQUES, computeTargets, pickTip, todayKey, type DateEvent, type Goal } from "@nutrition-app/shared";
import { useProfile } from "../../src/hooks/useProfile";
import { saveProfile } from "../../src/api/profile";
import { getDateEvents } from "../../src/api/calendar";
import { AdBanner } from "../../src/components/AdBanner";
import { MealPlanBuilder } from "../../src/components/MealPlanBuilder";
import { WorkoutPlanBuilder } from "../../src/components/WorkoutPlanBuilder";
import { TechniqueCheckSection } from "../../src/components/TechniqueCheckSection";
import { Card } from "../../src/components/Card";
import { colors } from "../../src/theme";

export default function TrainerScreen() {
  const { profile, loading, error, refetch } = useProfile();
  const [todayEvents, setTodayEvents] = useState<DateEvent[]>([]);

  useFocusEffect(
    useCallback(() => {
      const date = todayKey();
      getDateEvents(date, date)
        .then(setTodayEvents)
        .catch(() => {
          /* non-fatal — the rest of the Trainer tab doesn't depend on this */
        });
    }, [])
  );

  const todaysWorkouts = useMemo(
    () => todayEvents.filter((e) => e.type === "workout").sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? "")),
    [todayEvents]
  );
  const todaysEating = useMemo(
    () => todayEvents.filter((e) => e.type === "eating").sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? "")),
    [todayEvents]
  );
  // Tied to todayEvents (only changes when the fetch above completes), not
  // every render, so the tip doesn't change mid-interaction — just each
  // time the tab is actually revisited/reloaded.
  const tip = useMemo(() => pickTip(todaysWorkouts.length > 0, todaysEating.length > 0), [todaysWorkouts, todaysEating]);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper, padding: 24, gap: 12 }}>
        <Text style={{ color: colors.ink, textAlign: "center" }}>{error}</Text>
        <Pressable onPress={refetch} style={{ backgroundColor: colors.ink, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 }}>
          <Text style={{ color: colors.paper, fontWeight: "700" }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const targets = computeTargets(profile);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.paper }} contentContainerStyle={{ padding: 20, gap: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "800", color: colors.ink }}>Personal trainer</Text>

      <Card title="Today's plan" icon="today-outline">
        {todaysWorkouts.length === 0 && todaysEating.length === 0 ? (
          <Text style={{ color: colors.muted }}>Nothing scheduled today — add workouts and eating windows from the Plan tab.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {todaysWorkouts.map((w) => (
              <View key={w.id} style={{ gap: 2 }}>
                <Text style={{ fontWeight: "600", color: colors.green }}>{w.label}</Text>
                {w.startTime ? (
                  <Text style={{ color: colors.muted }}>
                    {formatTime(w.startTime)}
                    {w.endTime ? ` – ${formatTime(w.endTime)}` : ""}
                  </Text>
                ) : null}
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
        )}
        <Text style={{ color: colors.ink, marginTop: 10 }}>💡 {tip}</Text>
      </Card>

      <Card title="Goal" icon="flag-outline">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {GOALS.map((g) => (
            <Chip key={g.id} label={g.label} active={g.id === profile.goal} onPress={() => saveProfile({ goal: g.id as Goal }).then(refetch)} />
          ))}
        </View>
      </Card>

      <Card title="Daily targets" icon="stats-chart-outline">
        <Text style={{ color: colors.ink }}>{targets.calories} cal — P{targets.protein}g · C{targets.carbs}g · F{targets.fat}g</Text>
        {targets.cappedNote ? (
          <Text style={{ color: colors.amber, marginTop: 4 }}>
            Your goal-driven target was below the safety floor, so it's capped at {targets.calories} cal.
          </Text>
        ) : null}
      </Card>

      <Card title="Physique" icon="body-outline">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {PHYSIQUES.map((p) => (
            <Chip
              key={p.id}
              label={p.label}
              active={p.id === profile.physique}
              onPress={() => saveProfile({ physique: p.id }).then(refetch)}
            />
          ))}
        </View>
      </Card>

      <Card title="Meal plan" icon="restaurant-outline">
        <MealPlanBuilder profile={profile} targets={targets} onProfileSaved={refetch} />
      </Card>

      <Card title="Workout plan" icon="barbell-outline">
        <WorkoutPlanBuilder profile={profile} />
      </Card>

      <Card title="Technique check" icon="videocam-outline">
        <TechniqueCheckSection />
      </Card>

      <AdBanner />
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: active ? colors.ink : colors.card,
      }}
    >
      <Text style={{ color: active ? colors.paper : colors.ink, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}
