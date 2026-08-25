// Lokale Erinnerungen für fällige Wiedervorlagen.
// Hinweis: Echte Push-Benachrichtigungen bei GESCHLOSSENER App brauchen einen
// Server (Web-Push/VAPID). Diese Funktion benachrichtigt zuverlässig, während die
// PWA geöffnet ist bzw. im Hintergrund läuft.

import { wiedervorlageFaellig } from "./property";
import type { Property } from "./types";

const FLAG = "besichtigung.notify";
const SHOWN = "besichtigung.notify_shown";

export function notificationsEnabled(): boolean {
  return (
    localStorage.getItem(FLAG) === "1" &&
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  );
}

export async function enableNotifications(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  let perm = Notification.permission;
  if (perm === "default") perm = await Notification.requestPermission();
  if (perm === "granted") {
    localStorage.setItem(FLAG, "1");
    return true;
  }
  localStorage.removeItem(FLAG);
  return false;
}

export function disableNotifications(): void {
  localStorage.removeItem(FLAG);
}

function loadShown(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SHOWN) || "{}");
  } catch {
    return {};
  }
}

async function fire(title: string, body: string): Promise<void> {
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg && "showNotification" in reg) {
      reg.showNotification(title, { body, icon: "/pwa-192.png", badge: "/pwa-192.png", tag: "wiedervorlage" });
      return;
    }
  } catch {
    /* fällt auf Notification zurück */
  }
  try {
    new Notification(title, { body, icon: "/pwa-192.png" });
  } catch {
    /* ignorieren */
  }
}

/** Fällige Wiedervorlagen prüfen und (max. 1×/Tag/Objekt) benachrichtigen. */
export async function checkReminders(properties: Property[]): Promise<void> {
  if (!notificationsEnabled()) return;
  const today = new Date().toISOString().slice(0, 10);
  const shown = loadShown();
  const due = properties.filter(wiedervorlageFaellig);
  let changed = false;
  for (const p of due) {
    if (shown[p.id] === today) continue;
    shown[p.id] = today;
    changed = true;
    await fire("Wiedervorlage fällig", `${p.titel || p.ort || "Objekt"} – nachfassen (anrufen/schreiben).`);
  }
  if (changed) localStorage.setItem(SHOWN, JSON.stringify(shown));
}
