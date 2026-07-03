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
  const k = key.toLowerCase();
  return (
    /^utm_/.test(k) ||
    /^wt_/.test(k) || // Webtrekk (u. a. ImmoScout24)
    /^adj_/.test(k) || // Adjust (u. a. Immowelt: adj_t)
    ["ref", "cid", "pid", "gclid", "fbclid", "mc_cid", "mc_eid", "extid"].includes(k)
  );
}

/**
 * Portal-Suchagenten-Mails verpacken Inserats-Links oft in Klick-Tracking-URLs
 * (z. B. links.immowelt.de/… oder email.immobilienscout24.de/…). Die echte
 * Inserats-URL steckt dann meist als (URL-codierter) Parameter oder Pfadteil
 * darin. Diese Funktion versucht, sie herauszulösen; liefert null, wenn keine
 * eingebettete Inserats-URL gefunden wird.
 */
export function unwrapTrackingUrl(rawUrl: string): string | null {
  const candidates: string[] = [];

  // 1) Werte aller Query-Parameter als mögliche Ziel-URL
  try {
    for (const value of new URL(rawUrl).searchParams.values()) candidates.push(value);
  } catch {
    // keine parsebare URL → nur der String-Scan unten
  }

  // 2) Ganze URL ein-/zweifach dekodieren und nach eingebetteter Portal-URL suchen
  let decoded = rawUrl;
  for (let i = 0; i < 2; i++) {
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      break;
    }
  }
  // An jeder http(s)://-Grenze auftrennen, damit verschachtelte Links
  // (Tracker-URL enthält die Ziel-URL im Pfad) einzeln geprüft werden.
  for (const part of decoded.split(/(?=https?:\/\/)/i)) {
    const m = part.match(/^https?:\/\/[^\s"'<>]+/i);
    if (m) candidates.push(m[0]);
  }

  for (const candidate of candidates) {
    let dec = candidate;
    try {
      dec = decodeURIComponent(candidate);
    } catch {
      // schon dekodiert / ungültig — Rohwert weiterverwenden
    }
    try {
      if (isListingUrl(new URL(dec))) return dec;
    } catch {
      // kein gültiger URL-Kandidat
    }
  }
  return null;
}

/** Prüft, ob eine URL wie ein Inserats-Link aussieht (nicht Startseite/Abmelden etc.) */
export function isListingUrl(u: URL): boolean {
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
  /^(hier( klicken)?|klicke?n? sie hier|jetzt ansehen|ansehen|anzeigen|zum (inserat|angebot|exposé|expose|objekt)|zur (anzeige|immobilie)|mehr( erfahren| informationen| infos| dazu)?|details?|weiter|link|öffnen)\W*$/i;

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

/** Markennamen der unterstützten Portale — auch in Tracker-Subdomains enthalten */
const PORTAL_BRAND = /immowelt|immobilienscout24|kleinanzeigen|immonet/i;

/** Gehört die URL (auch als Klick-Tracker-Subdomain) zu einem der Portale? */
export function isPortalHost(rawUrl: string): boolean {
  try {
    return PORTAL_BRAND.test(new URL(rawUrl).hostname);
  } catch {
    return false;
  }
}

/**
 * Wandelt einen rohen Link synchron in eine normalisierte Inserats-URL um:
 * direkter Inserats-Link oder per unwrapTrackingUrl eingebettete URL.
 * Liefert null, wenn ohne Netzwerk-Auflösung kein Inserat erkennbar ist.
 */
export function toListingUrl(rawUrl: string): string | null {
  for (const candidate of [rawUrl, unwrapTrackingUrl(rawUrl)]) {
    if (!candidate) continue;
    const normalized = normalizeListingUrl(candidate);
    if (!normalized) continue;
    try {
      if (isListingUrl(new URL(normalized))) return normalized;
    } catch {
      // ungültige URL — nächster Kandidat
    }
  }
  return null;
}

/**
 * Alle Links einer Mail (roh, unnormalisiert, aber dedupliziert): <a href>
 * im HTML plus nackte URLs im Text-Teil. Der Link-Text dient als
 * Titel-Kandidat. Grundlage sowohl für die synchrone Inserats-Erkennung als
 * auch für die netzwerkbasierte Tracker-Auflösung im Webhook.
 */
export function extractAllLinks(html: string, text: string): ExtractedLink[] {
  // Map behält Einfüge-Reihenfolge → stabile Ausgabe
  const found = new Map<string, string | null>();

  const add = (rawUrl: string, title: string | null): void => {
    if (!/^https?:\/\//i.test(rawUrl)) return;
    const existing = found.get(rawUrl);
    if (existing === undefined) found.set(rawUrl, title);
    else if (existing === null && title) found.set(rawUrl, title);
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

/**
 * Findet die direkt (ohne Netzwerk) erkennbaren Inserats-Links einer Mail:
 * direkte Portal-Links und im Tracking-Link eingebettete URLs. URLs werden
 * normalisiert und dedupliziert; der beste Link-Text gewinnt als Titel.
 * Klick-Tracker ohne eingebettete Ziel-URL (z. B. click.by.immowelt.de) werden
 * hier NICHT aufgelöst — das übernimmt resolveListingUrl im Webhook.
 */
export function extractListingLinks(html: string, text: string): ExtractedLink[] {
  const found = new Map<string, string | null>();
  for (const { url, title } of extractAllLinks(html, text)) {
    const listing = toListingUrl(url);
    if (!listing) continue;
    const existing = found.get(listing);
    if (existing === undefined) found.set(listing, title);
    else if (existing === null && title) found.set(listing, title);
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

  // Format A (ImmoScout24 u. a.): "53604 Bad Honnef" — PLZ vor Ort
  const zipFirst = text.match(
    /\b\d{5}\s+([A-ZÄÖÜ][a-zäöüß.-]+(?:\s+(?:am|an der|bei)\s+\w+|\s+[A-ZÄÖÜ][a-zäöüß.-]+)?)/
  );
  // Format B (Immowelt): "Stadtteil, Stadt / … (53125)" — Ort vor PLZ in Klammern.
  // Die Stadt ist der Teil nach dem Komma, vor optionalem " / …" und der PLZ.
  const parenZip = text.match(
    /,\s*([A-ZÄÖÜ][A-Za-zäöüß .-]+?)(?:\s*\/[^(]*)?\s*\(\d{5}\)/
  );
  if (zipFirst) meta.city = zipFirst[1].trim();
  else if (parenZip) meta.city = parenZip[1].trim();

  return meta;
}

/**
 * Wählt aus den Link-Texten eines Inserats (mehrere <a> zeigen auf denselben
 * Treffer) den beschreibenden Titel: der längste Text, der weder reiner Preis
 * noch Eckdaten- oder Ortsangabe ist. Liefert null, wenn keiner taugt.
 */
export function bestListingTitle(titles: Array<string | null>): string | null {
  const candidates = titles
    .map((t) => (t ?? "").trim())
    .filter((t) => t.length >= 4)
    .filter((t) => !/€|\bEUR\b/.test(t)) // kein Preis
    .filter((t) => !/^\d+(?:[.,]\d)?\s*(?:zi\.?|zimmer|·|m²)/i.test(t)) // keine Eckdaten
    .filter((t) => !/\(\d{5}\)/.test(t)); // keine Ortszeile
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => b.length - a.length)[0];
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
