import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ACTIVITY_LEVELS, GOALS, type Goal, type Sex, type UnitPref } from "@nutrition-app/shared";
import { saveProfile } from "../src/api/profile";
import { HeightWeightFields } from "../src/components/HeightWeightFields";
import { colors } from "../src/theme";

export default function OnboardingScreen() {
  const router = useRouter();
  const [sex, setSex] = useState<Sex>("female");
  const [age, setAge] = useState("");
  const [unitPref, setUnitPref] = useState<UnitPref>("metric");
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [activity, setActivity] = useState(ACTIVITY_LEVELS[1].id);
  const [goal, setGoal] = useState<Goal>("maintain");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setError(null);
    const parsedAge = Number(age);
    if (!parsedAge || !heightCm || !weightKg) {
      setError("Fill in age, height, and weight to continue.");
      return;
    }

    setSubmitting(true);
    try {
      await saveProfile({
        sex,
        age: parsedAge,
        heightCm,
        weightKg,
        activity,
        goal,
        unitPref,
        motivationMode: "none",
        dietStyle: "balanced",
        bmiPreference: "standard",
      });
      router.replace("/(tabs)/today");
    } catch (err) {
      setError("Couldn't save your profile — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.paper }} contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: colors.ink }}>Let's set up your profile</Text>

      <Field label="Sex">
        <SegmentedRow options={[{ id: "female", label: "Female" }, { id: "male", label: "Male" }]} value={sex} onChange={(v) => setSex(v as Sex)} />
      </Field>

      <Field label="Age">
        <TextInput keyboardType="number-pad" value={age} onChangeText={setAge} style={inputStyle} placeholder="e.g. 30" />
      </Field>

      <HeightWeightFields
        initialUnitPref={unitPref}
        initialHeightCm={heightCm}
        initialWeightKg={weightKg}
        onChange={(v) => {
          setUnitPref(v.unitPref);
          setHeightCm(v.heightCm);
          setWeightKg(v.weightKg);
        }}
      />

      <Field label="Activity level">
        <SegmentedRow options={ACTIVITY_LEVELS.map((a) => ({ id: a.id, label: a.label }))} value={activity} onChange={setActivity} />
      </Field>

      <Field label="Goal">
        <SegmentedRow options={GOALS.map((g) => ({ id: g.id, label: g.label }))} value={goal} onChange={(v) => setGoal(v as Goal)} />
      </Field>

      {error ? <Text style={{ color: colors.rust }}>{error}</Text> : null}

      <Pressable onPress={finish} disabled={submitting} style={{ backgroundColor: colors.ink, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 }}>
        {submitting ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Finish setup</Text>}
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontWeight: "700", color: colors.ink }}>{label}</Text>
      {children}
    </View>
  );
}

function SegmentedRow({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: active ? colors.ink : colors.card,
            }}
          >
            <Text style={{ color: active ? colors.paper : colors.ink, fontWeight: "600" }}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.line,
  borderRadius: 10,
  padding: 14,
  backgroundColor: colors.card,
};
