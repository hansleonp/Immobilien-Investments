// Server-only: OpenStreetMap-Anbindung für die Lage-Analyse.
// - Nominatim: Adresse → Koordinaten (Usage Policy: 1 req/s, aussagekräftiger UA)
// - Overpass: POI-Zählungen je Kategorie rund um die Koordinaten
// Geringe Volumina (eine Analyse je Objekt, gecached) — Policy-konform.

import {
  LAGE_CATEGORY_META,
  type LageCategory,
  type LageCounts,
} from "./score";

const UA = "ImmoFinder/1.0 (private Kapitalanlage-Recherche; Kontakt: hans-leon.pawlaczyk@saltrock.de)";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export interface GeocodeResult {
  lat: number;
  lon: number;
  precision: "adresse" | "strasse" | "ort";
}

async function nominatim(query: string): Promise<{ lat: number; lon: number } | null> {
  const url = `${NOMINATIM_URL}?format=jsonv2&limit=1&countrycodes=de&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "de" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!Array.isArray(data) || data.length === 0) return null;
  const lat = Number(data[0].lat);
  const lon = Number(data[0].lon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

/**
 * Geocodiert mit absteigender Genauigkeit: volle Adresse → Straße+Ort → Ort.
 * Die erreichte Stufe wird als precision mitgeliefert (UI zeigt den Hinweis
 * "nur Ortsmitte", wie es auch ImmoMetrica bei unbekanntem Standort tut).
 */
export async function geocode(args: {
  street: string | null;
  zip: string | null;
  city: string;
}): Promise<GeocodeResult | null> {
  const { street, zip, city } = args;
  const zipCity = [zip, city].filter(Boolean).join(" ");

  if (street && zipCity) {
    const hit = await nominatim(`${street}, ${zipCity}`);
    if (hit) return { ...hit, precision: "adresse" };
  }
  if (street) {
    const streetOnly = street.replace(/\s+\d+\s*[a-z]?$/i, "").trim();
    if (streetOnly && zipCity) {
      const hit = await nominatim(`${streetOnly}, ${zipCity}`);
      if (hit) return { ...hit, precision: "strasse" };
    }
  }
  if (zipCity) {
    const hit = await nominatim(zipCity);
    if (hit) return { ...hit, precision: "ort" };
  }
  return null;
}

/** Overpass-Selektoren je Kategorie (nodes/ways rund um lat/lon) */
const CATEGORY_SELECTORS: Record<LageCategory, string[]> = {
  shopping: [
    'node["shop"~"^(supermarket|convenience|bakery|butcher|greengrocer|department_store|mall|chemist)$"]',
  ],
  essen: ['node["amenity"~"^(restaurant|cafe|fast_food|ice_cream|biergarten)$"]'],
  natur: [
    'way["leisure"~"^(park|nature_reserve|garden)$"]',
    'way["landuse"~"^(forest|meadow|recreation_ground)$"]',
  ],
  kultur: [
    'node["amenity"~"^(theatre|cinema|arts_centre|library|community_centre)$"]',
    'node["tourism"="museum"]',
  ],
  sport: [
    'node["leisure"~"^(sports_centre|fitness_centre|swimming_pool)$"]',
    'way["leisure"~"^(sports_centre|pitch|swimming_pool|track)$"]',
  ],
  medizin: ['node["amenity"~"^(doctors|pharmacy|hospital|dentist|clinic)$"]'],
  oepnv: [
    'node["highway"="bus_stop"]',
    'node["railway"~"^(station|halt|tram_stop)$"]',
  ],
  nachtleben: ['node["amenity"~"^(bar|pub|nightclub)$"]'],
  // Lärmquellen: große Straßen und Bahntrassen im Nahbereich
  ruhe: ['way["highway"~"^(motorway|trunk|primary)$"]', 'way["railway"="rail"]'],
};

/**
 * Zählt POIs je Kategorie in einem Overpass-Rundumschlag (eine Anfrage).
 * Jede Kategorie wird als eigenes count-Statement ausgeführt.
 */
export async function countPois(lat: number, lon: number): Promise<LageCounts | null> {
  const blocks = (Object.keys(CATEGORY_SELECTORS) as LageCategory[])
    .map((cat) => {
      const radius = LAGE_CATEGORY_META[cat].radius;
      const selectors = CATEGORY_SELECTORS[cat]
        .map((s) => `${s}(around:${radius},${lat},${lon});`)
        .join("");
      return `(${selectors}); out count;`;
    })
    .join("\n");

  const query = `[out:json][timeout:25];\n${blocks}`;
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    elements?: Array<{ tags?: { total?: string } }>;
  };
  const totals = (data.elements ?? []).map((e) => Number(e.tags?.total ?? 0));
  const categories = Object.keys(CATEGORY_SELECTORS) as LageCategory[];
  if (totals.length !== categories.length) return null;

  const counts = {} as LageCounts;
  categories.forEach((cat, i) => {
    counts[cat] = Number.isFinite(totals[i]) ? totals[i] : 0;
  });
  return counts;
}
