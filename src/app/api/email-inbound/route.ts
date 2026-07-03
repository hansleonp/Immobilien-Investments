// Inbound-E-Mail-Webhook (M11): nimmt Suchagenten-Mails als JSON entgegen
// (Cloudflare Email Routing / Postmark), extrahiert Inserats-Links und legt
// deduplizierte Posteingang-Einträge an.
//
// Auth: ?secret=… oder Header x-inbound-secret muss EMAIL_INBOUND_SECRET
// entsprechen. Der Webhook kommt ohne Supabase-Session an → Service-Role-
// Client, Ziel-User via EMAIL_INBOUND_USER_ID.

import { timingSafeEqual, createHash } from "node:crypto";

import {
  extractAllLinks,
  extractListingMeta,
  isListingUrl,
  isPortalHost,
  normalizeListingUrl,
  parseInboundPayload,
  toListingUrl,
  type ExtractedLink,
} from "@/lib/email-import/parse";
import { resolveListingUrl } from "@/lib/email-import/resolve";
import { detectSource, extractExternalId } from "@/lib/link-import/sources";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ImportInboxInsert, Json } from "@/types/database";

/**
 * Ermittelt alle Inserats-Links einer Mail: erst synchron (direkte + im
 * Tracking-Link eingebettete URLs), dann per Netzwerk-Redirect für opake
 * Portal-Klick-Tracker (z. B. click.by.immowelt.de). Ergebnis normalisiert
 * und dedupliziert, bester Titel gewinnt.
 */
async function collectListingLinks(html: string, text: string): Promise<ExtractedLink[]> {
  const direct: ExtractedLink[] = [];
  const trackers: ExtractedLink[] = [];
  for (const link of extractAllLinks(html, text)) {
    const listing = toListingUrl(link.url);
    if (listing) direct.push({ url: listing, title: link.title });
    else if (isPortalHost(link.url)) trackers.push(link);
  }

  const resolved = await Promise.all(
    trackers.map(async (link) => {
      const url = await resolveListingUrl(link.url);
      return url ? { url, title: link.title } : null;
    })
  );

  const found = new Map<string, string | null>();
  for (const link of [...direct, ...resolved]) {
    if (!link) continue;
    const normalized = normalizeListingUrl(link.url);
    if (!normalized) continue;
    try {
      if (!isListingUrl(new URL(normalized))) continue;
    } catch {
      continue;
    }
    const existing = found.get(normalized);
    if (existing === undefined) found.set(normalized, link.title);
    else if (existing === null && link.title) found.set(normalized, link.title);
  }
  return [...found.entries()].map(([url, title]) => ({ url, title }));
}

/** Timing-sicherer Vergleich über SHA-256-Hashes (gleiche Länge garantiert) */
function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expectedSecret = process.env.EMAIL_INBOUND_SECRET;
  const userId = process.env.EMAIL_INBOUND_USER_ID;
  if (!expectedSecret) {
    return Response.json(
      { error: "EMAIL_INBOUND_SECRET ist nicht konfiguriert" },
      { status: 503 }
    );
  }

  const provided =
    new URL(request.url).searchParams.get("secret") ??
    request.headers.get("x-inbound-secret");
  if (!secretMatches(provided, expectedSecret)) {
    return Response.json({ error: "Ungültiges Secret" }, { status: 401 });
  }

  if (!userId) {
    return Response.json(
      { error: "EMAIL_INBOUND_USER_ID ist nicht konfiguriert" },
      { status: 503 }
    );
  }
  const admin = createAdminClient();
  if (!admin) {
    return Response.json(
      {
        error:
          "Supabase-Admin-Client nicht konfiguriert (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlt)",
      },
      { status: 503 }
    );
  }

  // Unparsebare Payloads mit 200 quittieren, damit der Provider nicht retried
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ accepted: false, reason: "Kein gültiges JSON" });
  }
  const mail = parseInboundPayload(body);
  if (!mail) {
    return Response.json({ accepted: false, reason: "Unbekanntes Payload-Format" });
  }

  const links = await collectListingLinks(mail.html, mail.text);
  const debug = new URL(request.url).searchParams.get("debug") === "1";
  const errors: string[] = [];
  let created = 0;
  let skipped = 0;

  for (const link of links) {
    const source = detectSource(link.url);
    const externalId = extractExternalId(link.url, source);

    // Dedup gegen bestehende Objekte: erst source+external_id, dann source_url
    let isDuplicate = false;
    if (externalId) {
      const { data } = await admin
        .from("properties")
        .select("id")
        .eq("source", source)
        .eq("external_id", externalId)
        .limit(1);
      if (data && data.length > 0) isDuplicate = true;
    }
    if (!isDuplicate) {
      const { data } = await admin
        .from("properties")
        .select("id")
        .eq("source_url", link.url)
        .limit(1);
      if (data && data.length > 0) isDuplicate = true;
    }
    if (isDuplicate) {
      skipped++;
      continue;
    }

    const meta = extractListingMeta(mail.html, link.url);
    const insert: ImportInboxInsert = {
      user_id: userId,
      source,
      source_url: link.url,
      external_id: externalId,
      subject: mail.subject || null,
      excerpt: link.title ?? (mail.subject || null),
      parsed: meta as Json,
      status: "neu",
    };

    // unique (user_id, source_url): vorhandene Einträge still überspringen
    const { data, error } = await admin
      .from("import_inbox")
      .upsert(insert, { onConflict: "user_id,source_url", ignoreDuplicates: true })
      .select("id");
    if (error) {
      console.error("email-inbound: Insert fehlgeschlagen", error.message);
      errors.push(`${link.url}: ${error.message}`);
      skipped++;
    } else if (data && data.length > 0) {
      created++;
    } else {
      skipped++;
    }
  }

  // Fehlerdetails nur mit gültigem Secret + explizitem debug=1
  return Response.json(
    debug
      ? { accepted: true, created, skipped, links: links.length, errors }
      : { accepted: true, created, skipped }
  );
}

export function GET() {
  return Response.json(
    { error: "Nur POST erlaubt" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
