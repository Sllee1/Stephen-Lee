import type { DateEvent, TemplateEvent } from "@nutrition-app/shared";
import { api } from "./client";

export function getTemplateEvents() {
  return api<TemplateEvent[]>("/calendar/template");
}

export function createTemplateEvent(event: Omit<TemplateEvent, "id" | "userId">) {
  return api<TemplateEvent>("/calendar/template", { method: "POST", body: JSON.stringify(event) });
}

export function replaceTemplateEventsOfType(type: "workout" | "eating", events: Omit<TemplateEvent, "id" | "userId">[]) {
  return api<TemplateEvent[]>("/calendar/template/replace-type", { method: "PUT", body: JSON.stringify({ type, events }) });
}

export function deleteTemplateEvent(id: string) {
  return api<void>(`/calendar/template/${id}`, { method: "DELETE" });
}

export function getDateEvents(from: string, to: string) {
  return api<DateEvent[]>(`/calendar/dates?from=${from}&to=${to}`);
}

export function createDateEvent(event: Omit<DateEvent, "id" | "userId" | "sourceTemplateEventId">) {
  return api<DateEvent>("/calendar/dates", { method: "POST", body: JSON.stringify(event) });
}

export function deleteDateEvent(id: string) {
  return api<void>(`/calendar/dates/${id}`, { method: "DELETE" });
}

export function autoFillCalendar(input: {
  range: "month" | "4weeks" | "8weeks" | "26weeks" | "52weeks" | "custom";
  viewedYear: number;
  viewedMonth0: number;
  from?: string;
  to?: string;
}) {
  return api<{ touchedDates: number }>("/calendar/auto-fill", { method: "POST", body: JSON.stringify(input) });
}

export function clearCalendar() {
  return api<{ ok: true }>("/calendar/clear", { method: "POST" });
}
