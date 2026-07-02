// POST /api/ai/expose — Exposé-PDF an Mistral schicken und strukturierte
// Objektdaten extrahieren (Document Understanding + Structured Output, zod-validiert).

import { MistralError } from "@mistralai/mistralai/models/errors";
import { getMistral, isMistralConfigured, EXTRACTION_MODEL } from "@/lib/ai/client";
import {
  EXPOSE_EXTRACTION_JSON_SCHEMA,
  exposeExtractionSchema,
} from "@/lib/ai/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15 MB

const SYSTEM_PROMPT = `Du bist ein präziser deutscher Immobilien-Extraktions-Assistent.
Du bekommst ein Immobilien-Exposé als PDF und extrahierst daraus strukturierte Objektdaten als JSON.

Regeln:
- Übernimm NUR Werte, die explizit im Exposé stehen. Keine Schätzungen, keine Ableitungen, keine Annahmen.
- Fehlende Angaben setzt du auf null.
- Verwechsle die Kaltmiete NICHT mit der Warmmiete: current_rent_cold ist ausschließlich die Nettokaltmiete. Steht nur eine Warmmiete im Exposé, setze current_rent_cold auf null.
- Unterscheide beim Hausgeld sauber zwischen dem GESAMTEN Hausgeld (hausgeld) und dem NICHT umlagefähigen Anteil (hausgeld_non_recoverable). Ist der nicht umlagefähige Anteil nicht explizit ausgewiesen, setze ihn auf null.
- Geldbeträge und Flächen als reine Zahlen ohne Einheiten (z. B. 189000, nicht "189.000 €").
- condition und rental_status nur setzen, wenn das Exposé eine klare Aussage dazu macht — sonst null.`;

export async function POST(request: Request) {
  if (!isMistralConfigured()) {
    return Response.json(
      { error: "MISTRAL_API_KEY nicht konfiguriert" },
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
    const mistral = getMistral();
    const response = await mistral.chat.complete({
      model: EXTRACTION_MODEL,
      maxTokens: 2048,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "document_url",
              documentUrl: `data:application/pdf;base64,${base64}`,
              documentName: file.name,
            },
            {
              type: "text",
              text: "Extrahiere die Objektdaten aus diesem Immobilien-Exposé.",
            },
          ],
        },
      ],
      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          name: "extract_expose_data",
          description:
            "Die aus dem Exposé extrahierten Objektdaten. Nur explizit genannte Werte, alles andere null.",
          schemaDefinition: EXPOSE_EXTRACTION_JSON_SCHEMA,
          strict: true,
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.length === 0) {
      return Response.json(
        { error: "KI-Antwort enthielt keine extrahierten Daten" },
        { status: 502 }
      );
    }

    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      return Response.json(
        { error: "KI-Antwort war kein gültiges JSON" },
        { status: 502 }
      );
    }

    const parsed = exposeExtractionSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json(
        { error: "KI-Antwort konnte nicht validiert werden" },
        { status: 502 }
      );
    }

    return Response.json({ data: parsed.data });
  } catch (err) {
    if (err instanceof MistralError) {
      console.error("[ai/expose] Mistral API error:", err.statusCode, err.message);
      return Response.json(
        { error: "Mistral-API-Fehler beim Auslesen des Exposés" },
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
