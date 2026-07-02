// Server-seitiger Mistral-Client (lazy Singleton).
// Nur in API-Routen / Server-Code importieren — der Key darf nie in den Client-Bundle.

import { Mistral } from "@mistralai/mistralai";

/** Exposé-Extraktion: klein, preiswert, Document-Understanding-fähig. */
export const EXTRACTION_MODEL = "mistral-small-latest";

/** Objekt-Analyse: fähiges Allround-Modell für die Investment-Bewertung. */
export const ANALYSIS_MODEL = "mistral-medium-latest";

let client: Mistral | null = null;

export function isMistralConfigured(): boolean {
  return Boolean(process.env.MISTRAL_API_KEY);
}

export function getMistral(): Mistral {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MISTRAL_API_KEY nicht konfiguriert — Key unter console.mistral.ai erstellen und in .env.local bzw. den Vercel-Umgebungsvariablen hinterlegen."
    );
  }
  if (!client) {
    client = new Mistral({ apiKey });
  }
  return client;
}
