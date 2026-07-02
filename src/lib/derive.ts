// Abgeleitete CRM-Felder — zur Laufzeit aus den Relationen berechnet, nie gespeichert.

import type { ContactEventRow, TaskRow, ViewingRow } from "@/types/database";
import type { PropertyWithRelations } from "@/types";

/** "Kontaktiert?" = es existiert mindestens ein ausgehendes Kontakt-Ereignis */
export function wasContacted(p: Pick<PropertyWithRelations, "contact_events">): boolean {
  return p.contact_events.some((e) => e.direction === "ausgehend");
}

/** Letztes Kontakt-Ereignis (neuestes zuerst) */
export function lastContactEvent(
  p: Pick<PropertyWithRelations, "contact_events">
): ContactEventRow | null {
  if (p.contact_events.length === 0) return null;
  return [...p.contact_events].sort(
    (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  )[0];
}

/** Früheste offene Aufgabe → "Nächste Aktion" + "Fällig am" */
export function nextOpenTask(
  p: Pick<PropertyWithRelations, "tasks">
): TaskRow | null {
  const open = p.tasks.filter((t) => !t.completed);
  if (open.length === 0) return null;
  return [...open].sort((a, b) => {
    if (a.due_date == null && b.due_date == null) return 0;
    if (a.due_date == null) return 1;
    if (b.due_date == null) return -1;
    return a.due_date.localeCompare(b.due_date);
  })[0];
}

/** Nächste geplante Besichtigung */
export function nextPlannedViewing(
  p: Pick<PropertyWithRelations, "viewings">
): ViewingRow | null {
  const planned = p.viewings
    .filter((v) => v.status === "geplant")
    .sort((a, b) => a.viewing_date.localeCompare(b.viewing_date));
  return planned[0] ?? null;
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate + "T00:00:00") < today;
}
