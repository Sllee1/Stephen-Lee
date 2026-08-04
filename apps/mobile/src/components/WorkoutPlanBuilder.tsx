import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import {
  addMinutesToTime,
  buildWorkoutSchedule,
  PHYSIQUES,
  WEEK_DAYS,
  type CardioLevel,
  type Profile,
  type TemplateEvent,
  type WorkoutEquipment,
  type WorkoutLocation,
} from "@nutrition-app/shared";
import { replaceTemplateEventsOfType } from "../api/calendar";
import { colors } from "../theme";

const LOCATIONS: { id: WorkoutLocation; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "gym", label: "Gym" },
  { id: "outside", label: "Outside" },
];

const EQUIPMENT: { id: WorkoutEquipment; label: string }[] = [
  { id: "bodyweight", label: "Bodyweight only" },
  { id: "weights", label: "Weights" },
  { id: "mixed", label: "Mixed" },
];

const CARDIO_LEVELS: { id: CardioLevel; label: string }[] = [
  { id: "low", label: "Less cardio" },
  { id: "moderate", label: "Balanced" },
  { id: "high", label: "More cardio" },
];

// Ported verbatim from the prototype's SPORTS array (id order + labels).
const SPORTS = ["none", "running", "cycling", "swimming", "basketball", "soccer", "tennis", "yoga", "climbing"];

const KIND_COLOR: Record<"strength" | "cardio" | "rest", string> = {
  strength: colors.green,
  cardio: colors.amber,
  rest: colors.muted,
};

interface Props {
  profile: Profile;
}

export function WorkoutPlanBuilder({ profile }: Props) {
  const physique = PHYSIQUES.find((p) => p.id === profile.physique) ?? null;
  const defaults = physique?.workoutDefaults;

  const [location, setLocation] = useState<WorkoutLocation>(defaults?.location ?? "gym");
  const [equipment, setEquipment] = useState<WorkoutEquipment>(defaults?.equipment ?? "mixed");
  const [cardioLevel, setCardioLevel] = useState<CardioLevel>(defaults?.cardioLevel ?? "moderate");
  const [sport, setSport] = useState<string>(defaults?.sport ?? "none");
  const [preferredTime, setPreferredTime] = useState("07:00");
  const [autoFillDismissed, setAutoFillDismissed] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const showAutoFillBanner = Boolean(physique && !autoFillDismissed);

  function applyPhysiqueDefaults() {
    if (!defaults) return;
    setLocation(defaults.location);
    setEquipment(defaults.equipment);
    setCardioLevel(defaults.cardioLevel);
    setSport(defaults.sport);
    setAutoFillDismissed(true);
  }

  const schedule = useMemo(
    () => buildWorkoutSchedule({ goal: profile.goal, location, equipment, cardioLevel }, sport),
    [profile.goal, location, equipment, cardioLevel, sport]
  );

  async function addWeekToPlanner() {
    const events: Omit<TemplateEvent, "id" | "userId">[] = schedule
      .filter((d) => d.kind !== "rest")
      .map((d) => ({
        day: d.day,
        type: "workout",
        label: d.label,
        startTime: preferredTime,
        endTime: addMinutesToTime(preferredTime, 60),
        notifyStart: true,
        notifyEnd: false,
      }));

    if (events.length === 0) return;

    setSyncing(true);
    try {
      // Full replace of every workout template entry — matches the
      // prototype's syncWorkoutWeek, which is a type-scoped overwrite, not
      // a merge. Eating-window template entries are untouched.
      await replaceTemplateEventsOfType("workout", events);
      Alert.alert("Added to planner", "This week's workouts replaced your previous workout template. Run \"Fill from template\" on the Plan tab to apply it to the calendar.");
    } catch {
      Alert.alert("Couldn't sync", "Something went wrong saving this week — try again.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <View style={{ gap: 12 }}>
      {showAutoFillBanner ? (
        <View style={{ backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.amber, borderRadius: 10, padding: 12, gap: 8 }}>
          <Text style={{ color: colors.ink }}>Auto-fill from your physique ({physique?.label})?</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable onPress={applyPhysiqueDefaults} style={{ backgroundColor: colors.amber, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 }}>
              <Text style={{ color: colors.paper, fontWeight: "700" }}>Apply</Text>
            </Pressable>
            <Pressable onPress={() => setAutoFillDismissed(true)} style={{ paddingVertical: 6, paddingHorizontal: 12 }}>
              <Text style={{ color: colors.muted }}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <PickerRow label="Location" options={LOCATIONS} value={location} onChange={setLocation} />
      <PickerRow label="Equipment" options={EQUIPMENT} value={equipment} onChange={setEquipment} />
      <PickerRow label="Cardio level" options={CARDIO_LEVELS} value={cardioLevel} onChange={setCardioLevel} />

      <View style={{ gap: 8 }}>
        <Text style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase" }}>Sport (optional)</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {SPORTS.map((s) => (
            <Chip key={s} label={s === "none" ? "None" : s[0].toUpperCase() + s.slice(1)} active={s === sport} onPress={() => setSport(s)} />
          ))}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase" }}>Preferred time</Text>
        <TextInput
          value={preferredTime}
          onChangeText={setPreferredTime}
          placeholder="HH:MM"
          style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 10, width: 100, color: colors.ink }}
        />
      </View>

      <View style={{ gap: 6 }}>
        {schedule.map((day) => (
          <View key={day.day} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#EEEBE1" }}>
            <Text style={{ color: colors.ink, width: 44 }}>{WEEK_DAYS[day.day]}</Text>
            <Text style={{ color: KIND_COLOR[day.kind], flex: 1 }}>{day.label}</Text>
          </View>
        ))}
      </View>

      <Pressable onPress={addWeekToPlanner} disabled={syncing} style={{ backgroundColor: colors.ink, borderRadius: 10, padding: 14, alignItems: "center" }}>
        {syncing ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Add week to planner</Text>}
      </Pressable>
      <Text style={{ color: colors.muted, fontSize: 12 }}>Replaces every workout entry in your week template — eating windows are untouched.</Text>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: active ? colors.ink : colors.card,
      }}
    >
      <Text style={{ color: active ? colors.paper : colors.ink, fontWeight: "600", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

function PickerRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: colors.muted, fontSize: 12, textTransform: "uppercase" }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {options.map((opt) => (
          <Chip key={opt.id} label={opt.label} active={opt.id === value} onPress={() => onChange(opt.id)} />
        ))}
      </View>
    </View>
  );
}
