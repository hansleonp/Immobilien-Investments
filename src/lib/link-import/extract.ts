import * as cheerio from "cheerio";

/**
 * Parst deutsche Zahlenformate: "285.000" → 285000, "1.234,56" → 1234.56,
 * "285000 €" → 285000, "58,5" → 58.5. Liefert null bei Unlesbarem.
 */
export function parseGermanNumber(s: string): number | null {
  if (typeof s !== "string") return null;
  // Alles außer Ziffern, Punkt, Komma und Minus entfernen (€, m², Leerzeichen …)
  const cleaned = s.replace(/[^\d.,-]/g, "");
  if (!/\d/.test(cleaned)) return null;

  let normalized: string;
  if (cleaned.includes(",")) {
    // Komma = Dezimaltrennzeichen, Punkte = Tausendertrennzeichen
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    // Reine Tausender-Gruppierung: "285.000", "1.234.567"
    normalized = cleaned.replace(/\./g, "");
  } else {
    // Einzelner Punkt als Dezimaltrennzeichen ("58.5") oder ganze Zahl
    normalized = cleaned;
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export interface ExtractedListingData {
  title?: string;
  imageUrl?: string;
  description?: string;
  price?: number;
  livingArea?: number;
  rooms?: number;
  zip?: string;
  city?: string;
  street?: string;
}

const RELEVANT_LD_TYPES = new Set([
  "Product",
  "Offer",
  "Place",
  "Residence",
  "Apartment",
  "SingleFamilyResidence",
  "RealEstateListing",
]);

function toNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") return parseGermanNumber(v);
  return null;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/** Sammelt alle Objekte eines JSON-LD-Blocks (einzeln, Array, @graph) rekursiv ein */
function collectLdNodes(value: unknown, out: Record<string, unknown>[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectLdNodes(item, out);
    return;
  }
  const node = asRecord(value);
  if (!node) return;
  out.push(node);
  if (node["@graph"]) collectLdNodes(node["@graph"], out);
}

function nodeTypes(node: Record<string, unknown>): string[] {
  const t = node["@type"];
  if (typeof t === "string") return [t];
  if (Array.isArray(t)) return t.filter((x): x is string => typeof x === "string");
  return [];
}

function firstString(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim() !== "") return v.trim();
  if (Array.isArray(v)) {
    for (const item of v) {
      const s = firstString(item);
      if (s) return s;
    }
    return undefined;
  }
  const rec = asRecord(v);
  // ImageObject { url: "…" }
  if (rec && typeof rec.url === "string" && rec.url.trim() !== "") return rec.url.trim();
  return undefined;
}

function extractFromLdNode(
  node: Record<string, unknown>,
  result: ExtractedListingData
): void {
  // name → title
  if (result.title === undefined && typeof node.name === "string" && node.name.trim()) {
    result.title = node.name.trim();
  }

  // offers.price / price → price
  if (result.price === undefined) {
    const offers = asRecord(Array.isArray(node.offers) ? node.offers[0] : node.offers);
    const raw = offers?.price ?? node.price;
    const price = toNumber(raw);
    if (price != null) result.price = price;
  }

  // image (String, Array oder ImageObject) → imageUrl
  if (result.imageUrl === undefined) {
    const img = firstString(node.image);
    if (img) result.imageUrl = img;
  }

  // description
  if (
    result.description === undefined &&
    typeof node.description === "string" &&
    node.description.trim()
  ) {
    result.description = node.description.trim();
  }

  // address (PostalAddress)
  const address = asRecord(node.address);
  if (address) {
    if (result.street === undefined && typeof address.streetAddress === "string") {
      result.street = address.streetAddress.trim();
    }
    if (result.zip === undefined && typeof address.postalCode === "string") {
      result.zip = address.postalCode.trim();
    }
    if (result.city === undefined && typeof address.addressLocality === "string") {
      result.city = address.addressLocality.trim();
    }
  }

  // floorSize.value → livingArea
  if (result.livingArea === undefined) {
    const floorSize = asRecord(node.floorSize);
    const area = toNumber(floorSize?.value);
    if (area != null) result.livingArea = area;
  }

  // numberOfRooms → rooms (Zahl, String oder QuantitativeValue)
  if (result.rooms === undefined) {
    const rawRooms = asRecord(node.numberOfRooms)?.value ?? node.numberOfRooms;
    const rooms = toNumber(rawRooms);
    if (rooms != null) result.rooms = rooms;
  }
}

/** Ergänzt in `target` nur Felder, die noch fehlen (frühere Quellen gewinnen) */
function fillMissing(target: ExtractedListingData, add: ExtractedListingData): void {
  for (const key of Object.keys(add) as Array<keyof ExtractedListingData>) {
    if (target[key] === undefined && add[key] !== undefined) {
      // @ts-expect-error — Schlüssel-/Wert-Typen korrespondieren per Konstruktion
      target[key] = add[key];
    }
  }
}

/**
 * Extrahiert Inserats-Metadaten aus HTML.
 * Prioritäts-Kaskade: JSON-LD > OpenGraph/Meta > Regex-Heuristik.
 */
export function extractFromHtml(html: string, url: string): ExtractedListingData {
  const result: ExtractedListingData = {};
  let $: cheerio.CheerioAPI;
  try {
    $ = cheerio.load(html);
  } catch {
    return result;
  }

  // --- a) JSON-LD ---
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text();
    if (!raw) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    const nodes: Record<string, unknown>[] = [];
    collectLdNodes(parsed, nodes);
    for (const node of nodes) {
      const types = nodeTypes(node);
      if (types.some((t) => RELEVANT_LD_TYPES.has(t))) {
        extractFromLdNode(node, result);
      }
    }
  });

  // --- b) OpenGraph / Meta ---
  const meta = (name: string): string | undefined => {
    const content = $(`meta[property="${name}"]`).attr("content");
    const trimmed = content?.trim();
    return trimmed ? trimmed : undefined;
  };
  const og: ExtractedListingData = {
    title: meta("og:title"),
    imageUrl: meta("og:image"),
    description: meta("og:description"),
  };
  const ogPrice = meta("product:price:amount");
  if (ogPrice) {
    const price = parseGermanNumber(ogPrice);
    if (price != null) og.price = price;
  }
  fillMissing(result, og);

  // --- c) Regex-Heuristik über Titel + Beschreibung + Body-Text ---
  const text = [
    result.title ?? "",
    result.description ?? "",
    $("title").text(),
    $("body").text(),
  ].join(" \n ");

  const regexData: ExtractedListingData = {};

  const priceMatch = text.match(/([\d.]{4,})\s*€/);
  if (priceMatch) {
    const price = parseGermanNumber(priceMatch[1]);
    if (price != null) regexData.price = price;
  }

  const areaMatch = text.match(/([\d.,]+)\s*m²/);
  if (areaMatch) {
    const area = parseGermanNumber(areaMatch[1]);
    if (area != null) regexData.livingArea = area;
  }

  const roomsMatch = text.match(/(\d+(?:[.,]5)?)\s*[-\s]?Zimmer/i);
  if (roomsMatch) {
    const rooms = parseGermanNumber(roomsMatch[1]);
    if (rooms != null) regexData.rooms = rooms;
  }

  const zipCityMatch = text.match(
    /\b(\d{5})\s+([A-ZÄÖÜ][a-zäöüß.-]+(?:\s+am\s+\w+|\s+\w+)?)/
  );
  if (zipCityMatch) {
    regexData.zip = zipCityMatch[1];
    regexData.city = zipCityMatch[2].trim();
  }

  fillMissing(result, regexData);

  // Relative Bild-URLs gegen die Inserats-URL auflösen
  if (result.imageUrl) {
    try {
      result.imageUrl = new URL(result.imageUrl, url).toString();
    } catch {
      delete result.imageUrl;
    }
  }

  return result;
}

const BLOCK_MARKERS = [
  "captcha",
  "akamai",
  "access denied",
  "bot detection",
  "are you a robot",
  "pardon our interruption",
];

/** Erkennt Bot-/Captcha-Sperrseiten (typisch bei ImmoScout24) */
export function looksBlocked(html: string, status: number): boolean {
  if (status >= 400) return true;
  const lower = html.toLowerCase();
  return BLOCK_MARKERS.some((marker) => lower.includes(marker));
}
