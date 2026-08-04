import type { DateEvent, FillRange, TemplateEvent } from "../types";
import { todayKey } from "./time";

export interface MonthCell {
  date: string | null; // "YYYY-MM-DD", null for leading/trailing blanks
  dayOfMonth: number | null;
}

/** Builds a full-weeks grid (leading/trailing blanks) for a Gregorian month. */
export function buildMonthCells(year: number, month0: number): MonthCell[] {
  const first = new Date(year, month0, 1);
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const leading = first.getDay();
  const cells: MonthCell[] = [];

  for (let i = 0; i < leading; i++) cells.push({ date: null, dayOfMonth: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month0 + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date, dayOfMonth: d });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, dayOfMonth: null });

  return cells;
}

export function resolveFillRange(range: FillRange, opts: { viewedYear: number; viewedMonth0: number; from?: string; to?: string }): { start: Date; end: Date } {
  const today = new Date();
  if (range === "month") {
    const start = new Date(opts.viewedYear, opts.viewedMonth0, 1);
    const end = new Date(opts.viewedYear, opts.viewedMonth0 + 1, 0);
    return { start, end };
  }
  if (range === "custom") {
    if (!opts.from || !opts.to) throw new Error("Custom fill range requires from/to dates");
    return { start: new Date(opts.from), end: new Date(opts.to) };
  }
  const weeks = { "4weeks": 4, "8weeks": 8, "26weeks": 26, "52weeks": 52 }[range];
  const end = new Date(today);
  end.setDate(end.getDate() + weeks * 7);
  return { start: today, end };
}

/**
 * Applies the week template to every date in [start, end] whose day-of-week
 * matches a template entry. This is a destructive, per-date FULL REPLACE —
 * any prior manual edits to a date are overwritten when that date is
 * included in a fill range again. Dates whose day-of-week has no template
 * entries are left untouched. Mirrors the prototype's `runAutoFill`.
 */
export function runAutoFill(
  templateEvents: TemplateEvent[],
  existingDateEvents: Record<string, DateEvent[]>,
  start: Date,
  end: Date
): Record<string, DateEvent[]> {
  const updates: Record<string, DateEvent[]> = {};
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  while (cursor <= endDay) {
    const dow = cursor.getDay();
    const matches = templateEvents.filter((t) => t.day === dow);
    if (matches.length > 0) {
      const dateKey = todayKey(cursor);
      updates[dateKey] = matches.map((t) => ({
        id: `${dateKey}-${t.id}`,
        userId: t.userId,
        date: dateKey,
        type: t.type,
        label: t.label,
        startTime: t.startTime,
        endTime: t.endTime,
        notifyStart: t.notifyStart,
        notifyEnd: t.notifyEnd,
        sourceTemplateEventId: t.id,
      }));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return { ...existingDateEvents, ...updates };
}
