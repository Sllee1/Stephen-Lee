import React, { useState } from "react";
import { Pressable, Switch, Text, TextInput, View } from "react-native";
import { addMinutesToTime, type CalendarEventType } from "@nutrition-app/shared";
import { colors } from "../theme";

export interface EventDraft {
  type: CalendarEventType;
  label: string;
  startTime: string | null;
  endTime: string | null;
  notifyStart: boolean;
  notifyEnd: boolean;
}

interface Props {
  onSubmit: (draft: EventDraft) => void | Promise<void>;
  onCancel: () => void;
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Shared add-event form used by both the Week Template editor (attaches a
 * `day` before POSTing) and the Month Calendar tab (attaches a `date`).
 * Mirrors the prototype's AddEventForm: type toggle, a "full 24h fast"
 * shortcut for eating windows (skips start/end entirely), start+duration
 * for workouts, and two notify toggles.
 */
export function AddCalendarEventForm({ onSubmit, onCancel }: Props) {
  const [type, setType] = useState<CalendarEventType>("workout");
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("08:00");
  const [durationMin, setDurationMin] = useState("60");
  const [fullFast, setFullFast] = useState(false);
  const [notifyStart, setNotifyStart] = useState(true);
  const [notifyEnd, setNotifyEnd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!label.trim()) {
      setError("Give it a label.");
      return;
    }

    if (type === "eating" && fullFast) {
      onSubmit({ type, label: label.trim(), startTime: null, endTime: null, notifyStart: false, notifyEnd: false });
      return;
    }

    if (!TIME_RE.test(startTime)) {
      setError("Start time must be HH:MM (24h).");
      return;
    }

    if (type === "workout") {
      const minutes = Number(durationMin);
      if (!minutes || minutes <= 0) {
        setError("Duration must be a positive number of minutes.");
        return;
      }
      setError(null);
      onSubmit({ type, label: label.trim(), startTime, endTime: addMinutesToTime(startTime, minutes), notifyStart, notifyEnd });
      return;
    }

    if (!TIME_RE.test(endTime)) {
      setError("End time must be HH:MM (24h).");
      return;
    }
    setError(null);
    onSubmit({ type, label: label.trim(), startTime, endTime, notifyStart, notifyEnd });
  }

  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TypeChip label="Workout" active={type === "workout"} onPress={() => setType("workout")} />
        <TypeChip label="Eating window" active={type === "eating"} onPress={() => setType("eating")} />
      </View>

      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder={type === "workout" ? "e.g. Leg day" : "e.g. Eating window"}
        style={inputStyle}
      />

      {type === "eating" ? (
        <Pressable onPress={() => setFullFast((v) => !v)} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Switch value={fullFast} onValueChange={setFullFast} trackColor={{ true: colors.amber }} />
          <Text style={{ color: colors.ink }}>Full 24h fast (no eating window today)</Text>
        </Pressable>
      ) : null}

      {!(type === "eating" && fullFast) ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Start (HH:MM)</Text>
            <TextInput value={startTime} onChangeText={setStartTime} style={inputStyle} placeholder="07:00" />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            {type === "workout" ? (
              <>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Duration (min)</Text>
                <TextInput value={durationMin} onChangeText={setDurationMin} style={inputStyle} keyboardType="number-pad" placeholder="60" />
              </>
            ) : (
              <>
                <Text style={{ color: colors.muted, fontSize: 12 }}>End (HH:MM)</Text>
                <TextInput value={endTime} onChangeText={setEndTime} style={inputStyle} placeholder="08:00" />
              </>
            )}
          </View>
        </View>
      ) : null}

      {!(type === "eating" && fullFast) ? (
        <View style={{ flexDirection: "row", gap: 20 }}>
          <ToggleRow label="Notify at start" value={notifyStart} onChange={setNotifyStart} />
          <ToggleRow label="Notify at end" value={notifyEnd} onChange={setNotifyEnd} />
        </View>
      ) : null}

      {error ? <Text style={{ color: colors.rust }}>{error}</Text> : null}

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable onPress={handleSubmit} style={{ flex: 1, backgroundColor: colors.ink, borderRadius: 10, padding: 12, alignItems: "center" }}>
          <Text style={{ color: colors.paper, fontWeight: "700" }}>Add event</Text>
        </Pressable>
        <Pressable onPress={onCancel} style={{ flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, alignItems: "center" }}>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function TypeChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
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
      <Text style={{ color: active ? colors.paper : colors.ink, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.green }} />
      <Text style={{ color: colors.ink, fontSize: 13 }}>{label}</Text>
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
