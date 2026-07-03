// Server-only: löst Portal-Klick-/Tracking-Links per Redirect zur echten
// Inserats-URL auf. Viele Suchagenten-Mails (v. a. Immowelt) verlinken nur
// opake Klick-Tracker (z. B. https://click.by.immowelt.de/?qs=…), deren
// Ziel-URL NICHT im Link steckt — sie ergibt sich erst aus dem 30x-Redirect
// (→ https://www.immowelt.de/expose/…). Wir folgen den Redirects manuell und
// laden die (oft bot-geblockte) Zielseite selbst nie.

import { isListingUrl, normalizeListingUrl } from "./parse";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const MAX_HOPS = 5;
const TIMEOUT_MS = 6000;

/** Verhindert SSRF auf interne/private Ziele */
function isPrivateHost(host: string): boolean {
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "0.0.0.0" ||
    host === "[::1]" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(?:1[6-9]|2\d|3[01])\./.test(host)
  );
}

/**
 * Folgt einem Klick-/Tracking-Link über bis zu MAX_HOPS Redirects und liefert
 * die erste erreichte, normalisierte Inserats-URL — oder null, wenn nichts
 * Verwertbares dabei herauskommt. Die eigentliche Inserats-Zielseite wird nie
 * geladen (Portale blocken Server-Fetches ohnehin); es zählt nur der Redirect.
 */
export async function resolveListingUrl(rawUrl: string): Promise<string | null> {
  let current = rawUrl;

  for (let hop = 0; hop < MAX_HOPS; hop++) {
    let u: URL;
    try {
      u = new URL(current);
    } catch {
      return null;
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (isPrivateHost(u.hostname.toLowerCase())) return null;

    // Schon eine Inserats-URL erreicht? Fertig — Zielseite nicht laden.
    if (isListingUrl(u)) return normalizeListingUrl(current);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*" },
      });
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
    // Body nicht auslesen — wir brauchen nur Status + Location
    res.body?.cancel?.().catch(() => {});

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return null;
      try {
        current = new URL(location, current).toString();
      } catch {
        return null;
      }
      continue;
    }

    // Kein Redirect und (noch) keine Inserats-URL → nichts Verwertbares
    return null;
  }

  return null;
}
