// Pure Parsing-Logik für den E-Mail-Suchagenten-Import (M11).
// Kein Supabase, kein Netzwerk — vollständig testbar.

import * as cheerio from "cheerio";
import { parseGermanNumber } from "@/lib/link-import/extract";

export interface InboundEmail {
  subject: string;
  html: string;
  text: string;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Provider-Adapter: normalisiert eingehende Webhook-Payloads auf
 * { subject, html, text }. Unterstützt Postmark ({ Subject, HtmlBody,
 * TextBody }), Cloudflare-Worker ({ subject, html, text }) und ein
 * generisches Format ({ subject, html/body, text }).
 * Liefert null, wenn kein verwertbarer Inhalt gefunden wird.
 */
export function parseInboundPayload(body: unknown): InboundEmail | null {
  if (body == null || typeof body !== "object" || Array.isArray(body)) return null;
  const rec = body as Record<string, unknown>;

  // Postmark-Format
  if ("HtmlBody" in rec || "TextBody" in rec || "Subject" in rec) {
    const html = str(rec.HtmlBody);
    const text = str(rec.TextBody);
    if (html || text) return { subject: str(rec.Subject), html, text };
  }

  // Cloudflare-Worker- bzw. generisches Format
  const html = str(rec.html) || str(rec.body);
  const text = str(rec.text);
  if (html || text) return { subject: str(rec.subject), html, text };

  return null;
}

/** Query-Params, die reine Tracking-Parameter sind und entfernt werden */
function isTrackingParam(key: string): boolean {
  return /^utm_/i.test(key) || key === "ref" || key === "cid";
}

/** Prüft, ob eine URL wie ein Inserats-Link aussieht (nicht Startseite/Abmelden etc.) */
function isListingUrl(u: URL): boolean {
  const host = u.hostname.toLowerCase();
  const path = u.pathname;
  if (host === "immobilienscout24.de" || host.endsWith(".immobilienscout24.de")) {
    return /\/expose\/\d+/.test(path);
  }
  if (host === "kleinanzeigen.de" || host.endsWith(".kleinanzeigen.de")) {
    return /\/s-anzeige\//.test(path);
  }
  if (host === "immowelt.de" || host.endsWith(".immowelt.de")) {
    return /\/expose\//i.test(path);
  }
  if (host === "immonet.de" || host.endsWith(".immonet.de")) {
    return /\d{6,}/.test(path);
  }
  return false;
}

/**
 * Normalisiert eine Inserats-URL: Fragment entfernen, Tracking-Query-Params
 * (utm_*, ref, cid) entfernen — restliche Params bleiben erhalten.
 * Liefert null bei unparsebaren URLs.
 */
export function normalizeListingUrl(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  u.hash = "";
  for (const key of [...new Set(u.searchParams.keys())]) {
    if (isTrackingParam(key)) u.searchParams.delete(key);
  }
  return u.toString();
}

/** Floskeln, die als Link-Text keinen Titel hergeben */
const BORING_LINK_TEXT =
  /^(hier( klicken)?|klicke?n? sie hier|jetzt ansehen|ansehen|anzeigen|zum (inserat|angebot|exposé|expose)|zur anzeige|mehr( erfahren)?|details?|weiter|link|öffnen)\W*$/i;

/** Link-Text als Titel-Kandidat: getrimmt, max 200 Zeichen, keine Floskel/URL */
function titleCandidate(raw: string): string | null {
  const t = raw.replace(/\s+/g, " ").trim().slice(0, 200).trim();
  if (t.length < 4) return null;
  if (/^(https?:\/\/|www\.)/i.test(t)) return null;
  if (BORING_LINK_TEXT.test(t)) return null;
  return t;
}

export interface ExtractedLink {
  url: string;
  title: string | null;
}

/**
 * Findet alle Inserats-Links in einer Suchagenten-Mail: <a href> im HTML
 * (via cheerio) plus nackte URLs im Text-Teil. URLs werden normalisiert
 * und innerhalb der Mail dedupliziert; der Link-Text dient als
 * Titel-Kandidat.
 */
export function extractListingLinks(html: string, text: string): ExtractedLink[] {
  // Map behält Einfüge-Reihenfolge → stabile Ausgabe
  const found = new Map<string, string | null>();

  const add = (rawUrl: string, title: string | null): void => {
    const normalized = normalizeListingUrl(rawUrl);
    if (!normalized) return;
    let u: URL;
    try {
      u = new URL(normalized);
    } catch {
      return;
    }
    if (!isListingUrl(u)) return;
    const existing = found.get(normalized);
    if (existing === undefined) {
      found.set(normalized, title);
    } else if (existing === null && title) {
      // Duplikat mit besserem Titel → Titel nachrüsten
      found.set(normalized, title);
    }
  };

  if (html) {
    try {
      const $ = cheerio.load(html);
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        add(href.trim(), titleCandidate($(el).text()));
      });
    } catch {
      // defektes HTML → nur Text-Teil auswerten
    }
  }

  // Nackte URLs im Text-Teil (Plain-Text-Mails)
  if (text) {
    const urlRegex = /https?:\/\/[^\s"'<>()\[\]]+/g;
    for (const match of text.match(urlRegex) ?? []) {
      // Satzzeichen am Ende abschneiden ("…/expose/123." → "…/expose/123")
      add(match.replace(/[.,;:!?]+$/, ""), null);
    }
  }

  return [...found.entries()].map(([url, title]) => ({ url, title }));
}

export interface ListingMeta {
  price?: number;
  livingArea?: number;
  rooms?: number;
  city?: string;
}

/** Zieht Preis/Fläche/Zimmer/Ort per Regex aus einem Text-Schnipsel */
function metaFromText(text: string): ListingMeta {
  const meta: ListingMeta = {};

  const priceMatch =
    text.match(/([\d.]{4,}(?:,\d{1,2})?)\s*(?:€|EUR)/) ??
    text.match(/(?:€|EUR)\s*([\d.]{4,}(?:,\d{1,2})?)/);
  if (priceMatch) {
    const price = parseGermanNumber(priceMatch[1]);
    if (price != null && price > 0) meta.price = price;
  }

  const areaMatch = text.match(/([\d.,]+)\s*m²/);
  if (areaMatch) {
    const area = parseGermanNumber(areaMatch[1]);
    if (area != null && area > 0) meta.livingArea = area;
  }

  const roomsMatch =
    text.match(/(\d+(?:[.,]5)?)\s*[-\s]?Zimmer/i) ??
    text.match(/Zimmer:?\s*(\d+(?:[.,]5)?)/i);
  if (roomsMatch) {
    const rooms = parseGermanNumber(roomsMatch[1]);
    if (rooms != null && rooms > 0) meta.rooms = rooms;
  }

  const zipCityMatch = text.match(
    /\b\d{5}\s+([A-ZÄÖÜ][a-zäöüß.-]+(?:\s+(?:am|an der|bei)\s+\w+|\s+[A-ZÄÖÜ][a-zäöüß.-]+)?)/
  );
  if (zipCityMatch) {
    meta.city = zipCityMatch[1].trim();
  }

  return meta;
}

/**
 * Best-effort-Metadaten zum Link: sucht im HTML den <a> zur URL und liest
 * aus dem Text des umgebenden Containers Preis (€), m², Zimmer und Ort.
 * Fehlschlag ist ok — dann {}.
 */
export function extractListingMeta(html: string, url: string): ListingMeta {
  if (!html) return {};
  const target = normalizeListingUrl(url);
  if (!target) return {};

  try {
    const $ = cheerio.load(html);
    let containerText = "";

    $("a[href]").each((_, el) => {
      if (containerText) return;
      const href = $(el).attr("href");
      if (!href || normalizeListingUrl(href.trim()) !== target) return;

      // Eltern-Container hochlaufen, bis genug Text im Umfeld liegt
      let node = $(el);
      for (let depth = 0; depth < 6; depth++) {
        const parent = node.parent();
        if (parent.length === 0) break;
        node = parent;
        const text = node.text().replace(/\s+/g, " ").trim();
        if (text.length >= 40) break;
      }
      containerText = node.text().replace(/\s+/g, " ").trim();
    });

    if (!containerText) return {};
    return metaFromText(containerText);
  } catch {
    return {};
  }
}
