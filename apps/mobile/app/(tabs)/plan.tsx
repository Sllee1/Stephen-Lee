import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { buildMonthCells, todayKey, WEEK_DAYS, type DateEvent } from "@nutrition-app/shared";
import { autoFillCalendar, deleteDateEvent, getDateEvents } from "../../src/api/calendar";
import { AdBanner } from "../../src/components/AdBanner";
import { colors } from "../../src/theme";

/**
 * Month Calendar view (real dates). The Week Template editor (recurring
 * day-of-week entries + "apply to all 7 days" quick-add — see
 * src/api/calendar.ts replaceTemplateEventsOfType) is the other half of the
 * prototype's PlanTab; add it as a second screen/segment once the add-event
 * form is built, wired to createTemplateEvent / getTemplateEvents.
 */
export default function PlanScreen() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month0, setMonth0] = useState(today.getMonth());
  const [eventsByDate, setEventsByDate] = useState<Record<string, DateEvent[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filling, setFilling] = useState(false);

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
      Alert.alert("Couldn't fill calendar", "Set up a week template on the Trainer tab first.");
    } finally {
      setFilling(false);
    }
  }

  function changeMonth(delta: number) {
    const next = new Date(year, month0 + delta, 1);
    setYear(next.getFullYear());
    setMonth0(next.getMonth());
    setSelectedDate(null);
  }

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.paper }} contentContainerStyle={{ padding: 20, gap: 16 }}>
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
                onPress={() => setSelectedDate(cell.date)}
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
          {/* TODO: AddEventForm — type toggle, start/end or fasting-window
              checkbox, notify toggles; POST via src/api/calendar.ts createDateEvent. */}
        </View>
      ) : null}

      <AdBanner />
    </ScrollView>
  );
}
