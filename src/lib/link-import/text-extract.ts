// Extraktion aus eingefügtem Seiten-Text (Copy&Paste-Fallback, wenn eine
// Seite den Server-Abruf blockiert — z. B. ImmoScout24).

import { parseGermanNumber, type ExtractedListingData } from "./extract";

export interface PlainTextExtraction extends ExtractedListingData {
  hausgeld?: number;
  currentRentCold?: number;
  constructionYear?: number;
  floor?: string;
}

/** Erste Zahl nach einem Label wie "Kaufpreis", "Hausgeld", "Baujahr" finden */
function labeled(text: string, label: RegExp): number | null {
  const m = text.match(label);
  return m ? parseGermanNumber(m[1]) : null;
}

export function extractFromPlainText(raw: string): PlainTextExtraction {
  const text = raw.slice(0, 30000);
  const data: PlainTextExtraction = {};

  // Titel: erste nicht-leere Zeile mit sinnvoller Länge
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const titleLine = lines.find(
    (l) => l.length >= 10 && l.length <= 150 && !/^https?:\/\//.test(l)
  );
  if (titleLine) data.title = titleLine;

  // Kaufpreis: bevorzugt mit Label, sonst größte €-Zahl (Preis > Hausgeld/Miete)
  const price =
    labeled(text, /Kaufpreis[:\s]+([\d.,]+)/i) ??
    (() => {
      const all = [...text.matchAll(/([\d.]{4,}(?:,\d+)?)\s*€/g)]
        .map((m) => parseGermanNumber(m[1]))
        .filter((n): n is number => n != null && n > 10000);
      return all.length ? Math.max(...all) : null;
    })();
  if (price != null) data.price = price;

  const area =
    labeled(text, /Wohnfläche(?:\s*ca\.)?[:\s]+([\d.,]+)/i) ??
    parseGermanNumber(text.match(/([\d.,]+)\s*m²/)?.[1] ?? "");
  if (area != null) data.livingArea = area;

  const rooms =
    labeled(text, /Zimmer[:\s]+(\d+(?:[.,]5)?)/i) ??
    parseGermanNumber(text.match(/(\d+(?:[.,]5)?)\s*[-\s]?Zimmer/i)?.[1] ?? "");
  if (rooms != null) data.rooms = rooms;

  const yearNum = labeled(text, /Baujahr[:\s]+(\d{4})/i);
  if (yearNum != null && yearNum >= 1800 && yearNum <= 2100) {
    data.constructionYear = yearNum;
  }

  const hausgeld = labeled(text, /Hausgeld[:\s]+([\d.,]+)/i);
  if (hausgeld != null) data.hausgeld = hausgeld;

  const rentCold =
    labeled(text, /Kaltmiete[:\s]+([\d.,]+)/i) ??
    labeled(text, /Mieteinnahmen[^\d]{0,20}([\d.,]+)/i);
  if (rentCold != null) data.currentRentCold = rentCold;

  const floorMatch = text.match(/\b((?:\d+\.\s*(?:OG|Obergeschoss))|EG|Erdgeschoss|DG|Dachgeschoss|Souterrain)\b/i);
  if (floorMatch) data.floor = floorMatch[1];

  const zipCity = text.match(/\b(\d{5})\s+([A-ZÄÖÜ][a-zäöüß.-]+(?:\s+am\s+\w+|\s+[A-ZÄÖÜ][a-zäöüß.-]+)?)/);
  if (zipCity) {
    data.zip = zipCity[1];
    data.city = zipCity[2].trim();
  }

  const street = text.match(
    /\b([A-ZÄÖÜ][\wäöüß.-]*(?:straße|str\.|weg|allee|platz|gasse|ring|ufer|promenade)\s*\d+[a-z]?)/i
  );
  if (street) data.street = street[1];

  return data;
}
