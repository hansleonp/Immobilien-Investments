// Pure Lage-Scoring: POI-Zählungen aus OpenStreetMap → Scores 0–5 je Kategorie
// (angelehnt an die GEOSCI-Kategorien bei ImmoMetrica). Kein Netzwerk — testbar;
// die OSM-Abfragen liegen in osm.ts, das Caching im API-Handler.

export const LAGE_CATEGORIES = [
  "shopping",
  "essen",
  "natur",
  "kultur",
  "sport",
  "medizin",
  "oepnv",
  "nachtleben",
  "ruhe",
] as const;

export type LageCategory = (typeof LAGE_CATEGORIES)[number];

export const LAGE_CATEGORY_META: Record<LageCategory, { label: string; radius: number }> = {
  shopping: { label: "Shopping", radius: 800 },
  essen: { label: "Essen & Trinken", radius: 800 },
  natur: { label: "Natur", radius: 1000 },
  kultur: { label: "Kultur", radius: 1500 },
  sport: { label: "Sport", radius: 1000 },
  medizin: { label: "Med. Versorgung", radius: 1000 },
  oepnv: { label: "Öffentl. Verkehr", radius: 600 },
  nachtleben: { label: "Nachtleben", radius: 1000 },
  ruhe: { label: "Ruhe", radius: 300 },
};

/** POI-Anzahl, ab der eine Kategorie die volle Punktzahl (5,0) erreicht */
const FULL_SCORE_COUNT: Record<Exclude<LageCategory, "ruhe">, number> = {
  shopping: 10,
  essen: 15,
  natur: 5,
  kultur: 6,
  sport: 8,
  medizin: 10,
  oepnv: 8,
  nachtleben: 8,
};

export type LageCounts = Record<LageCategory, number>;
export type LageScores = Record<LageCategory, number>;

export interface LocationScoresData {
  computedAt: string;
  lat: number;
  lon: number;
  /** Geocoding-Genauigkeit: volle Adresse, Straße oder nur Ort */
  precision: "adresse" | "strasse" | "ort";
  scores: LageScores;
  counts: LageCounts;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Zählungen → Scores 0–5. Für POI-Kategorien wächst der Score mit der Wurzel
 * der Anzahl (die ersten Läden/Haltestellen zählen mehr als der zwanzigste);
 * "ruhe" ist invers: Lärmquellen (große Straßen/Bahnen im Nahbereich) senken
 * den Score von 5 ab.
 */
export function computeLageScores(counts: LageCounts): LageScores {
  const scores = {} as LageScores;
  for (const cat of LAGE_CATEGORIES) {
    if (cat === "ruhe") {
      // 0 Lärmquellen → 5,0 · jede weitere senkt deutlich, Boden bei 0
      scores.ruhe = round1(Math.max(0, 5 - counts.ruhe * 1.25));
      continue;
    }
    const full = FULL_SCORE_COUNT[cat];
    const ratio = Math.min(1, Math.sqrt(counts[cat] / full));
    scores[cat] = round1(5 * ratio);
  }
  return scores;
}

/** Gesamtscore als Mittel der Kategorien (eine Nachkommastelle) */
export function overallLageScore(scores: LageScores): number {
  const values = LAGE_CATEGORIES.map((c) => scores[c]);
  return round1(values.reduce((a, b) => a + b, 0) / values.length);
}
