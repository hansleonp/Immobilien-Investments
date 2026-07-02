import type { PropertySource } from "@/types/database";

/** Erkennt die Plattform anhand des Hostnamens */
export function detectSource(url: string): PropertySource {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return "sonstige";
  }
  if (hostname.includes("immobilienscout24.de")) return "immoscout24";
  if (hostname.includes("kleinanzeigen.de")) return "kleinanzeigen";
  if (hostname.includes("immowelt.de")) return "immowelt";
  if (hostname.includes("immonet.de")) return "immonet";
  return "sonstige";
}

/** Extrahiert die Inserats-ID aus der URL (für Dubletten-Erkennung) */
export function extractExternalId(url: string, source: PropertySource): string | null {
  try {
    const { pathname } = new URL(url);
    switch (source) {
      case "immoscout24": {
        const m = pathname.match(/\/expose\/(\d+)/);
        return m ? m[1] : null;
      }
      case "kleinanzeigen": {
        const m = pathname.match(/\/(\d{8,})(?:-|$)/);
        return m ? m[1] : null;
      }
      case "immowelt": {
        const m = pathname.match(/\/expose\/([a-z0-9]+)/i);
        return m ? m[1] : null;
      }
      case "immonet": {
        const m = pathname.match(/(\d{6,})/);
        return m ? m[1] : null;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}
