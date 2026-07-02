// Server-seitiger Anthropic-Client (lazy Singleton).
// Nur in API-Routen / Server-Code importieren — der Key darf nie in den Client-Bundle.

import Anthropic from "@anthropic-ai/sdk";

/** Aktuelles Sonnet: kosteneffizient, PDF-fähig, Tool-Use. */
export const MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY nicht konfiguriert — Key unter console.anthropic.com erstellen und in .env.local bzw. den Vercel-Umgebungsvariablen hinterlegen."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey });
  }
  return client;
}
