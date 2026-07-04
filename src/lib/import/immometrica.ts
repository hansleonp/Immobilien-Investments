// ImmoMetrica-CSV-Import: parst den offiziellen Suchergebnis-Export
// (Semikolon-getrennt, UTF-8 mit BOM, dd.mm.yyyy-Daten, de-DE-Zahlen) und
// mappt jede Zeile auf unsere Objekt-Felder. Pure Logik — testbar; das
// Einfügen/Mergen übernimmt die Import-Dialog-Komponente.

import { detectSource, extractExternalId } from "@/lib/link-import/sources";
import type { PropertyCondition, PropertySource } from "@/types/database";

/** Minimaler CSV-Parser (RFC-4180-artig): Semikolon, doppelte Quotes, BOM */
export function parseCsv(text: string, delimiter = ";"): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((f) => f !== "")) rows.push(row);
  return rows;
}

/** "157,92" / "115000" → number; leere/0-Werte → null */
function num(value: string | undefined): number | null {
  if (!value || value.trim() === "") return null;
  const n = Number(value.trim().replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n !== 0 ? n : null;
}

/** "09.02.2026" → "2026-02-09" */
function isoDate(value: string | undefined): string | null {
  const m = value?.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

const CONDITION_MAP: Record<string, PropertyCondition> = {
  erstbezug: "erstbezug",
  saniert: "saniert",
  gepflegt: "gepflegt",
  "renovierungsbedürftig": "renovierungsbeduerftig",
  "sanierungsbedürftig": "sanierungsbeduerftig",
};

/** Bevorzugte Portal-Link-Spalten (in dieser Reihenfolge) */
const LINK_COLUMNS = [
  "Link ImmoScout",
  "Link immowelt",
  "Link Kleinanzeigen",
  "Link immonet",
];

export interface ImmoMetricaRow {
  title: string;
  street: string | null;
  zip: string | null;
  city: string;
  sourceUrl: string;
  source: PropertySource;
  externalId: string | null;
  listedAt: string | null;
  price: number | null;
  livingArea: number | null;
  rooms: number | null;
  constructionYear: number | null;
  hausgeld: number | null;
  currentRentCold: number | null;
  condition: PropertyCondition;
}

/**
 * Header + Zeile → Objekt-Felder. Liefert null für Zeilen ohne verwertbaren
 * Link (weder Portal-Link noch Details-URL) oder ohne Ort.
 */
export function mapRow(header: string[], cells: string[]): ImmoMetricaRow | null {
  const get = (col: string): string | undefined => {
    const idx = header.indexOf(col);
    return idx >= 0 ? cells[idx]?.trim() : undefined;
  };

  const city = get("Ort");
  if (!city) return null;

  // Portal-Link bevorzugen; ImmoMetrica-Details-URL als Fallback (source 'sonstige')
  let sourceUrl: string | undefined;
  for (const col of LINK_COLUMNS) {
    const v = get(col);
    if (v && /^https?:\/\//.test(v)) {
      sourceUrl = v;
      break;
    }
  }
  if (!sourceUrl) {
    const details = get("Details");
    if (details && /^https?:\/\//.test(details)) sourceUrl = details;
  }
  if (!sourceUrl) return null;

  const source = detectSource(sourceUrl);
  const externalId = extractExternalId(sourceUrl, source);

  // "Am Honnefer Kreuz 45A, 53604 Bad Honnef" → Straße vor ", PLZ Ort"
  const address = get("Adresse") ?? "";
  const street = address.split(/,\s*\d{5}/)[0]?.trim() || null;

  const zustand = (get("Zustand") ?? "").trim().toLowerCase();

  return {
    title: get("Titel") || "ImmoMetrica-Import",
    street: street && street !== address ? street : street,
    zip: get("PLZ") || null,
    city,
    sourceUrl,
    source,
    externalId,
    listedAt: isoDate(get("Datum")),
    price: num(get("Preis")),
    livingArea: num(get("Wfl.")),
    rooms: num(get("Zi")),
    constructionYear: num(get("Bj")),
    hausgeld: num(get("Hausgeld")),
    currentRentCold: num(get("Miete")),
    condition: CONDITION_MAP[zustand] ?? "unbekannt",
  };
}

/** Komplette CSV → gemappte Zeilen (unbrauchbare Zeilen werden gezählt) */
export function parseImmoMetricaCsv(text: string): {
  rows: ImmoMetricaRow[];
  skipped: number;
} {
  const parsed = parseCsv(text);
  if (parsed.length < 2) return { rows: [], skipped: 0 };
  const [header, ...body] = parsed;
  const rows: ImmoMetricaRow[] = [];
  let skipped = 0;
  for (const cells of body) {
    const mapped = mapRow(header, cells);
    if (mapped) rows.push(mapped);
    else skipped++;
  }
  return { rows, skipped };
}
