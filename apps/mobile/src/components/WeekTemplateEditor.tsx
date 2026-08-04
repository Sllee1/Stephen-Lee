import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import { addHoursToTime, EATING_PRESETS, formatTime, WEEK_DAYS, type TemplateEvent } from "@nutrition-app/shared";
import { createTemplateEvent, deleteTemplateEvent, getTemplateEvents, replaceTemplateEventsOfType } from "../api/calendar";
import { AddCalendarEventForm, type EventDraft } from "./AddCalendarEventForm";
import { colors } from "../theme";

/**
 * The recurring, day-of-week template (as opposed to the Month Calendar's
 * concrete dates). "Fill from template" on the Month Calendar tab is what
 * turns this into real dated entries.
 */
export function WeekTemplateEditor() {
  const [events, setEvents] = useState<TemplateEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEvents(await getTemplateEvents());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addEvent(draft: EventDraft) {
    await createTemplateEvent({ day: selectedDay, ...draft });
    setShowForm(false);
    await load();
  }

  async function removeEvent(id: string) {
    await deleteTemplateEvent(id);
    await load();
  }

  const dayEvents = events.filter((e) => e.day === selectedDay).sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {WEEK_DAYS.map((d, i) => (
          <Pressable
            key={d}
            onPress={() => setSelectedDay(i)}
            style={{
              flex: 1,
              paddingVertical: 8,
              alignItems: "center",
              borderRadius: 8,
              backgroundColor: i === selectedDay ? colors.ink : colors.card,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <Text style={{ color: i === selectedDay ? colors.paper : colors.ink, fontWeight: "600" }}>{d[0]}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.rust} />
      ) : (
        <View style={{ gap: 8 }}>
          {dayEvents.length === 0 ? (
            <Text style={{ color: colors.muted }}>Nothing scheduled for {WEEK_DAYS[selectedDay]}.</Text>
          ) : (
            dayEvents.map((e) => (
              <View
                key={e.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.line,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <View>
                  <Text style={{ color: e.type === "workout" ? colors.green : colors.amber, fontWeight: "700" }}>{e.label}</Text>
                  <Text style={{ color: colors.muted }}>
                    {e.startTime ? `${formatTime(e.startTime)}${e.endTime ? ` – ${formatTime(e.endTime)}` : ""}` : "All day"}
                  </Text>
                </View>
                <Pressable onPress={() => removeEvent(e.id)}>
                  <Text style={{ color: colors.rust }}>Delete</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      )}

      {showForm ? (
        <AddCalendarEventForm onSubmit={addEvent} onCancel={() => setShowForm(false)} />
      ) : (
        <Pressable onPress={() => setShowForm(true)} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, alignItems: "center" }}>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>+ Add event to {WEEK_DAYS[selectedDay]}</Text>
        </Pressable>
      )}

      <EatingPresetPicker onApplied={load} />
      <WorkoutQuickAddPicker onApplied={load} />
    </View>
  );
}

/** Stamps the same eating window onto all 7 template days at once — replaces every existing eating entry. */
function EatingPresetPicker({ onApplied }: { onApplied: () => void }) {
  const [presetId, setPresetId] = useState(EATING_PRESETS[1].id); // default 8:16
  const [startTime, setStartTime] = useState("12:00");
  const [customEnd, setCustomEnd] = useState("20:00");
  const [applying, setApplying] = useState(false);

  const preset = EATING_PRESETS.find((p) => p.id === presetId)!;

  async function apply() {
    const endTime = preset.hours != null ? addHoursToTime(startTime, preset.hours) : customEnd;
    setApplying(true);
    try {
      const events = Array.from({ length: 7 }, (_, day) => ({
        day,
        type: "eating" as const,
        label: `${preset.label} eating window`,
        startTime,
        endTime,
        notifyStart: true,
        notifyEnd: true,
      }));
      await replaceTemplateEventsOfType("eating", events);
      onApplied();
      Alert.alert("Applied", "Every day's eating window now matches this preset.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14, gap: 10 }}>
      <Text style={{ fontWeight: "700", color: colors.ink }}>Apply an eating window to every day</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {EATING_PRESETS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => setPresetId(p.id)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: p.id === presetId ? colors.ink : colors.paper,
            }}
          >
            <Text style={{ color: p.id === presetId ? colors.paper : colors.ink, fontWeight: "600", fontSize: 13 }}>{p.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Start (HH:MM)</Text>
          <TextInput value={startTime} onChangeText={setStartTime} style={inputStyle} />
        </View>
        {preset.hours == null ? (
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>End (HH:MM)</Text>
            <TextInput value={customEnd} onChangeText={setCustomEnd} style={inputStyle} />
          </View>
        ) : null}
      </View>
      <Pressable onPress={apply} disabled={applying} style={{ backgroundColor: colors.amber, borderRadius: 8, padding: 10, alignItems: "center" }}>
        {applying ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Apply to all 7 days</Text>}
      </Pressable>
    </View>
  );
}

/** Stamps the same workout onto all 7 template days — for a varied per-day split, use the Trainer tab's plan builder instead. */
function WorkoutQuickAddPicker({ onApplied }: { onApplied: () => void }) {
  const [label, setLabel] = useState("Workout");
  const [startTime, setStartTime] = useState("07:00");
  const [durationMin, setDurationMin] = useState("60");
  const [applying, setApplying] = useState(false);

  async function apply() {
    const minutes = Number(durationMin) || 60;
    setApplying(true);
    try {
      const events = Array.from({ length: 7 }, (_, day) => ({
        day,
        type: "workout" as const,
        label,
        startTime,
        endTime: addHoursToTime(startTime, minutes / 60),
        notifyStart: true,
        notifyEnd: false,
      }));
      await replaceTemplateEventsOfType("workout", events);
      onApplied();
      Alert.alert("Applied", "Every day now has this workout.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14, gap: 10 }}>
      <Text style={{ fontWeight: "700", color: colors.ink }}>Apply the same workout to every day</Text>
      <TextInput value={label} onChangeText={setLabel} style={inputStyle} placeholder="Workout label" />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Start (HH:MM)</Text>
          <TextInput value={startTime} onChangeText={setStartTime} style={inputStyle} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Duration (min)</Text>
          <TextInput value={durationMin} onChangeText={setDurationMin} style={inputStyle} keyboardType="number-pad" />
        </View>
      </View>
      <Pressable onPress={apply} disabled={applying} style={{ backgroundColor: colors.green, borderRadius: 8, padding: 10, alignItems: "center" }}>
        {applying ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Apply to all 7 days</Text>}
      </Pressable>
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.line,
  borderRadius: 8,
  padding: 10,
  color: colors.ink,
};
