// POST /api/ai/expose — Exposé-PDF an Claude schicken und strukturierte
// Objektdaten extrahieren (erzwungenes Tool-Use, zod-validiert).

import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, isAnthropicConfigured, MODEL } from "@/lib/ai/client";
import {
  EXPOSE_EXTRACTION_JSON_SCHEMA,
  exposeExtractionSchema,
} from "@/lib/ai/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15 MB

const SYSTEM_PROMPT = `Du bist ein präziser deutscher Immobilien-Extraktions-Assistent.
Du bekommst ein Immobilien-Exposé als PDF und extrahierst daraus strukturierte Objektdaten.

Regeln:
- Übernimm NUR Werte, die explizit im Exposé stehen. Keine Schätzungen, keine Ableitungen, keine Annahmen.
- Fehlende Angaben lässt du weg bzw. setzt sie auf null.
- Verwechsle die Kaltmiete NICHT mit der Warmmiete: current_rent_cold ist ausschließlich die Nettokaltmiete. Steht nur eine Warmmiete im Exposé, lass current_rent_cold leer.
- Unterscheide beim Hausgeld sauber zwischen dem GESAMTEN Hausgeld (hausgeld) und dem NICHT umlagefähigen Anteil (hausgeld_non_recoverable). Ist der nicht umlagefähige Anteil nicht explizit ausgewiesen, lass ihn leer.
- Geldbeträge und Flächen als reine Zahlen ohne Einheiten (z. B. 189000, nicht "189.000 €").
- condition und rental_status nur setzen, wenn das Exposé eine klare Aussage dazu macht — sonst weglassen.`;

export async function POST(request: Request) {
  if (!isAnthropicConfigured()) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY nicht konfiguriert" },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "Ungültiger Request — multipart/form-data mit PDF erwartet" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Keine PDF-Datei übermittelt" }, { status: 400 });
  }
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return Response.json(
      { error: "Nur PDF-Dateien werden unterstützt" },
      { status: 400 }
    );
  }
  if (file.size > MAX_PDF_BYTES) {
    return Response.json(
      { error: "PDF zu groß — maximal 15 MB" },
      { status: 413 }
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  try {
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: [
        {
          name: "extract_expose_data",
          description:
            "Meldet die aus dem Exposé extrahierten Objektdaten. Nur explizit genannte Werte, alles andere null/weglassen.",
          input_schema: EXPOSE_EXTRACTION_JSON_SCHEMA,
        },
      ],
      tool_choice: { type: "tool", name: "extract_expose_data" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            {
              type: "text",
              text: "Extrahiere die Objektdaten aus diesem Immobilien-Exposé.",
            },
          ],
        },
      ],
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return Response.json(
        { error: "KI-Antwort enthielt keine extrahierten Daten" },
        { status: 502 }
      );
    }

    const parsed = exposeExtractionSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      return Response.json(
        { error: "KI-Antwort konnte nicht validiert werden" },
        { status: 502 }
      );
    }

    return Response.json({ data: parsed.data });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error("[ai/expose] Claude API error:", err.status, err.message);
      return Response.json(
        { error: "Claude-API-Fehler beim Auslesen des Exposés" },
        { status: 502 }
      );
    }
    console.error("[ai/expose] Unerwarteter Fehler:", err);
    return Response.json(
      { error: "Unerwarteter Fehler beim Auslesen des Exposés" },
      { status: 500 }
    );
  }
}
