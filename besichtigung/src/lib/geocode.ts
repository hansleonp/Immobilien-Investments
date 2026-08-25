// Geocoding über Nominatim (OpenStreetMap) — kostenlos, ohne API-Key.
// Hinweis: max. ~1 Anfrage/Sekunde; die Karte fragt daher sequenziell mit Pause.

import type { Property } from "./types";

/** Baut die beste Suchanfrage: genaue Adresse > Stadtteil (mit Bonn-Kontext). */
export function geocodeQuery(p: Pick<Property, "adresse" | "ort">): string | null {
  const adr = (p.adresse || "").trim();
  if (adr) return /deutschland|germany/i.test(adr) ? adr : `${adr}, Deutschland`;
  const ort = (p.ort || "").trim();
  if (!ort) return null;
  if (/bonn/i.test(ort)) return `${ort}, Deutschland`;
  if (/^(zentrum|innenstadt|city)/i.test(ort)) return "Bonn, Deutschland";
  // Bloßer Stadtteil → aktueller Fokus Bonn als Kontext
  return `${ort}, Bonn, Deutschland`;
}

export async function geocode(q: string): Promise<{ lat: number; lng: number } | null> {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=de&q=" +
    encodeURIComponent(q);
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    const j = (await r.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(j) || !j[0]) return null;
    const lat = parseFloat(j[0].lat);
    const lng = parseFloat(j[0].lon);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
