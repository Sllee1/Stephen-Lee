import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { GOALS, PHYSIQUES, computeTargets, type Goal } from "@nutrition-app/shared";
import { useProfile } from "../../src/hooks/useProfile";
import { saveProfile } from "../../src/api/profile";
import { AdBanner } from "../../src/components/AdBanner";
import { MealPlanBuilder } from "../../src/components/MealPlanBuilder";
import { WorkoutPlanBuilder } from "../../src/components/WorkoutPlanBuilder";
import { TechniqueCheckSection } from "../../src/components/TechniqueCheckSection";
import { Card } from "../../src/components/Card";
import { colors } from "../../src/theme";

export default function TrainerScreen() {
  const { profile, loading, refetch } = useProfile();

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
