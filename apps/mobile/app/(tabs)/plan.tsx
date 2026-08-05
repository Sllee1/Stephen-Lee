import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { buildMonthCells, todayKey, WEEK_DAYS, type DateEvent } from "@nutrition-app/shared";
import { autoFillCalendar, clearCalendar, createDateEvent, deleteDateEvent, getDateEvents } from "../../src/api/calendar";
import { AddCalendarEventForm, type EventDraft } from "../../src/components/AddCalendarEventForm";
import { WeekTemplateEditor } from "../../src/components/WeekTemplateEditor";
import { AdBanner } from "../../src/components/AdBanner";
import { colors } from "../../src/theme";

type PlanView = "month" | "template";

export default function PlanScreen() {
  const [view, setView] = useState<PlanView>("month");
  const [resetKey, setResetKey] = useState(0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.paper }} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "800", color: colors.ink }}>Plan</Text>

      <View style={{ flexDirection: "row", gap: 6 }}>
        <ViewChip label="Month calendar" active={view === "month"} onPress={() => setView("month")} />
        <ViewChip label="Week template" active={view === "template"} onPress={() => setView("template")} />
      </View>

      {view === "month" ? <MonthCalendarView key={resetKey} /> : <WeekTemplateEditor key={resetKey} />}

      <ClearCalendarButton onCleared={() => setResetKey((k) => k + 1)} />

      <AdBanner />
    </ScrollView>
  );
}

function MonthCalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month0, setMonth0] = useState(today.getMonth());
  const [eventsByDate, setEventsByDate] = useState<Record<string, DateEvent[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filling, setFilling] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const cells = buildMonthCells(year, month0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const first = cells.find((c) => c.date)?.date;
      const last = [...cells].reverse().find((c) => c.date)?.date;
      if (!first || !last) return;
      const events = await getDateEvents(first, last);
      const grouped: Record<string, DateEvent[]> = {};
      for (const e of events) (grouped[e.date] ??= []).push(e);
      setEventsByDate(grouped);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month0]);

  useEffect(() => {
    load();
  }, [load]);

  async function runFill() {
    setFilling(true);
    try {
      const result = await autoFillCalendar({ range: "month", viewedYear: year, viewedMonth0: month0 });
      Alert.alert("Calendar filled", `Updated ${result.touchedDates} day(s) from your week template.`);
      await load();
    } catch {
      Alert.alert("Couldn't fill calendar", "Set up a week template first.");
    } finally {
      setFilling(false);
    }
  }

  function changeMonth(delta: number) {
    const next = new Date(year, month0 + delta, 1);
    setYear(next.getFullYear());
    setMonth0(next.getMonth());
    setSelectedDate(null);
    setShowForm(false);
  }

  async function addEvent(draft: EventDraft) {
    if (!selectedDate) return;
    await createDateEvent({ date: selectedDate, ...draft });
    setShowForm(false);
    await load();
  }

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Pressable onPress={() => changeMonth(-1)}><Text style={{ fontSize: 18, color: colors.ink }}>‹</Text></Pressable>
        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.ink }}>
          {new Date(year, month0, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </Text>
        <Pressable onPress={() => changeMonth(1)}><Text style={{ fontSize: 18, color: colors.ink }}>›</Text></Pressable>
      </View>

      <View style={{ flexDirection: "row" }}>
        {WEEK_DAYS.map((d) => (
          <Text key={d} style={{ flex: 1, textAlign: "center", color: colors.muted, fontWeight: "600" }}>{d}</Text>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.rust} />
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {cells.map((cell, i) => {
            const dayEvents = cell.date ? eventsByDate[cell.date] ?? [] : [];
            const hasWorkout = dayEvents.some((e) => e.type === "workout");
            const hasEating = dayEvents.some((e) => e.type === "eating");
            const isToday = cell.date === todayKey();
            const isSelected = cell.date === selectedDate;
            return (
              <Pressable
                key={i}
                disabled={!cell.date}
                onPress={() => {
                  setSelectedDate(cell.date);
                  setShowForm(false);
                }}
                style={{
                  width: `${100 / 7}%`,
                  aspectRatio: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  backgroundColor: isSelected ? colors.ink : "transparent",
                  borderWidth: isToday && !isSelected ? 1 : 0,
                  borderColor: colors.rust,
                }}
              >
                {cell.dayOfMonth ? (
                  <>
                    <Text style={{ color: isSelected ? colors.paper : colors.ink }}>{cell.dayOfMonth}</Text>
                    <View style={{ flexDirection: "row", gap: 3, marginTop: 2 }}>
                      {hasWorkout ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.green }} /> : null}
                      {hasEating ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.amber }} /> : null}
                    </View>
                  </>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}

      <Pressable onPress={runFill} disabled={filling} style={{ backgroundColor: colors.ink, borderRadius: 10, padding: 14, alignItems: "center" }}>
        {filling ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Fill this month from template</Text>}
      </Pressable>
      <Text style={{ color: colors.muted, fontSize: 12 }}>
        Filling replaces every matched day's entries with the current week template — any manual edits to those days are overwritten.
      </Text>

      {selectedDate ? (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "700", color: colors.ink }}>{selectedDate}</Text>
          {selectedEvents.length === 0 ? (
            <Text style={{ color: colors.muted }}>Nothing scheduled.</Text>
          ) : (
            selectedEvents.map((e) => (
              <View key={e.id} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12 }}>
                <Text style={{ color: colors.ink }}>{e.label} {e.startTime ? `(${e.startTime}${e.endTime ? `–${e.endTime}` : ""})` : ""}</Text>
                <Pressable onPress={() => deleteDateEvent(e.id).then(load)}>
                  <Text style={{ color: colors.rust }}>Delete</Text>
                </Pressable>
              </View>
            ))
          )}

          {showForm ? (
            <AddCalendarEventForm onSubmit={addEvent} onCancel={() => setShowForm(false)} />
          ) : (
            <Pressable onPress={() => setShowForm(true)} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, alignItems: "center" }}>
              <Text style={{ color: colors.ink, fontWeight: "600" }}>+ Add event to this date</Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
}

/** Tap-twice-within-a-few-seconds confirm, matching the prototype's ClearCalendarButton. */
function ClearCalendarButton({ onCleared }: { onCleared: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);

  function handlePress() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    setClearing(true);
    clearCalendar()
      .then(() => {
        onCleared();
        setConfirming(false);
      })
      .finally(() => setClearing(false));
  }

  return (
    <Pressable onPress={handlePress} disabled={clearing} style={{ borderWidth: 1, borderColor: colors.rust, borderRadius: 10, padding: 12, alignItems: "center" }}>
      {clearing ? (
        <ActivityIndicator color={colors.rust} />
      ) : (
        <Text style={{ color: colors.rust, fontWeight: "700" }}>{confirming ? "Tap again to confirm — clears everything" : "Clear entire calendar"}</Text>
      )}
    </Pressable>
  );
}

function ViewChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: active ? colors.ink : colors.card,
      }}
    >
      <Text style={{ color: active ? colors.paper : colors.ink, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}
