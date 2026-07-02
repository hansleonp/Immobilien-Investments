import { z } from "zod";

import {
  extractFromHtml,
  looksBlocked,
  type ExtractedListingData,
} from "@/lib/link-import/extract";
import { detectSource, extractExternalId } from "@/lib/link-import/sources";

const bodySchema = z.object({
  url: z
    .string()
    .trim()
    .refine((v) => /^https?:\/\//i.test(v), {
      message: "Nur http/https-Links werden unterstützt",
    }),
});

/** SSRF-Schutz: interne Hostnamen und private IP-Bereiche ablehnen */
function isForbiddenHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    return true;
  }

  // IPv6-Literale: Loopback und Unique-Local (fc00::/7)
  if (host.includes(":")) {
    if (host === "::1" || host === "0:0:0:0:0:0:0:1") return true;
    if (host.startsWith("fc") || host.startsWith("fd")) return true;
    return false;
  }

  // IPv4-Literale in privaten Bereichen
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
  }
  return false;
}

export async function POST(request: Request) {
  let url: string;
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return Response.json(
        { error: "Ungültige Anfrage: url muss ein http/https-Link sein" },
        { status: 400 }
      );
    }
    url = parsed.data.url;
  } catch {
    return Response.json({ error: "Ungültiger Request-Body" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return Response.json({ error: "Ungültige URL" }, { status: 400 });
  }
  if (isForbiddenHost(parsedUrl.hostname)) {
    return Response.json({ error: "Dieser Host ist nicht erlaubt" }, { status: 400 });
  }

  const source = detectSource(url);
  const externalId = extractExternalId(url, source);

  let blocked = false;
  let data: ExtractedListingData = {};

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept-Language": "de-DE,de;q=0.9",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const html = await res.text();
    if (looksBlocked(html, res.status)) {
      blocked = true;
    } else {
      try {
        data = extractFromHtml(html, res.url || url);
      } catch {
        // Parse-Probleme führen nie zu einem Fehler — leere Daten zurückgeben
        data = {};
      }
    }
  } catch {
    // Netzwerkfehler / Timeout → als blockiert behandeln
    blocked = true;
  }

  return Response.json({ source, externalId, blocked, data });
}
