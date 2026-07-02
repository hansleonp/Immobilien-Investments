// zod-Schemas + JSON-Schemas für die KI-Features (M12).
// Die zod-Schemas validieren die Structured-Output-Antworten der Mistral API;
// die JSON-Schema-Konstanten werden als response_format (json_schema, strict)
// mitgesendet. Mistral-Strict-Modus verlangt: additionalProperties: false und
// alle Properties in required — optionale Felder sind daher nullable.

import { z } from "zod";

// ---------- Exposé-Extraktion ----------

export const exposeExtractionSchema = z.object({
  title: z.string().nullish(),
  street: z.string().nullish(),
  zip: z.string().nullish(),
  city: z.string().nullish(),
  price: z.number().nullish(),
  living_area: z.number().nullish(),
  rooms: z.number().nullish(),
  floor: z.string().nullish(),
  construction_year: z.number().int().nullish(),
  condition: z
    .enum([
      "erstbezug",
      "saniert",
      "gepflegt",
      "renovierungsbeduerftig",
      "sanierungsbeduerftig",
      "unbekannt",
    ])
    .nullish(),
  rental_status: z.enum(["frei", "vermietet", "unbekannt"]).nullish(),
  current_rent_cold: z.number().nullish(),
  hausgeld: z.number().nullish(),
  hausgeld_non_recoverable: z.number().nullish(),
  energy_class: z.string().nullish(),
});

export type ExposeExtraction = z.infer<typeof exposeExtractionSchema>;

/** JSON-Schema für das response_format "extract_expose_data" (Mistral strict) */
export const EXPOSE_EXTRACTION_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    title: {
      type: ["string", "null"],
      description: "Kurzer Objekttitel, z. B. '3-Zimmer-Wohnung in Bonn-Beuel'",
    },
    street: { type: ["string", "null"], description: "Straße und Hausnummer" },
    zip: { type: ["string", "null"], description: "Postleitzahl" },
    city: { type: ["string", "null"], description: "Ort/Stadt" },
    price: { type: ["number", "null"], description: "Kaufpreis in Euro (Zahl ohne Einheit)" },
    living_area: { type: ["number", "null"], description: "Wohnfläche in m²" },
    rooms: { type: ["number", "null"], description: "Anzahl Zimmer" },
    floor: { type: ["string", "null"], description: "Etage, z. B. '2. OG'" },
    construction_year: { type: ["integer", "null"], description: "Baujahr" },
    condition: {
      type: ["string", "null"],
      enum: [
        "erstbezug",
        "saniert",
        "gepflegt",
        "renovierungsbeduerftig",
        "sanierungsbeduerftig",
        "unbekannt",
        null,
      ],
      description: "Zustand des Objekts laut Exposé",
    },
    rental_status: {
      type: ["string", "null"],
      enum: ["frei", "vermietet", "unbekannt", null],
      description: "Vermietungsstatus: frei oder vermietet",
    },
    current_rent_cold: {
      type: ["number", "null"],
      description:
        "Aktuelle KALTmiete in €/Monat (Nettokaltmiete — NICHT Warmmiete). Nur angeben, wenn das Objekt vermietet ist und die Kaltmiete explizit genannt wird.",
    },
    hausgeld: {
      type: ["number", "null"],
      description: "Hausgeld GESAMT in €/Monat (inkl. umlagefähiger Anteile)",
    },
    hausgeld_non_recoverable: {
      type: ["number", "null"],
      description:
        "NICHT umlagefähiger Anteil des Hausgelds in €/Monat (z. B. Instandhaltungsrücklage, Verwaltung). Nur wenn explizit ausgewiesen.",
    },
    energy_class: { type: ["string", "null"], description: "Energieeffizienzklasse, z. B. 'C'" },
  },
  required: [
    "title",
    "street",
    "zip",
    "city",
    "price",
    "living_area",
    "rooms",
    "floor",
    "construction_year",
    "condition",
    "rental_status",
    "current_rent_cold",
    "hausgeld",
    "hausgeld_non_recoverable",
    "energy_class",
  ],
  additionalProperties: false,
};

// ---------- Objekt-Analyse ----------

export const propertyAnalysisSchema = z.object({
  zusammenfassung: z.string(),
  staerken: z.array(z.string()),
  risiken: z.array(
    z.object({
      titel: z.string(),
      erlaeuterung: z.string(),
      schweregrad: z.enum(["hoch", "mittel", "niedrig"]),
    })
  ),
  miete_plausibilitaet: z.string(),
  verhandlung: z.object({
    empfohlenes_angebot: z.number().nullable(),
    begruendung: z.string(),
  }),
  anfrage_nachricht: z.string(),
});

export type PropertyAnalysis = z.infer<typeof propertyAnalysisSchema>;

/** JSON-Schema für das response_format "provide_analysis" (Mistral strict) */
export const PROPERTY_ANALYSIS_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    zusammenfassung: {
      type: "string",
      description: "Kompakte Gesamteinschätzung des Objekts als Kapitalanlage (3–5 Sätze)",
    },
    staerken: {
      type: "array",
      items: { type: "string" },
      description: "Konkrete Stärken des Objekts (je ein kurzer Punkt)",
    },
    risiken: {
      type: "array",
      items: {
        type: "object",
        properties: {
          titel: { type: "string", description: "Kurzer Risiko-Titel" },
          erlaeuterung: { type: "string", description: "Konkrete Erläuterung des Risikos" },
          schweregrad: {
            type: "string",
            enum: ["hoch", "mittel", "niedrig"],
          },
        },
        required: ["titel", "erlaeuterung", "schweregrad"],
        additionalProperties: false,
      },
      description: "Risiken mit Schweregrad",
    },
    miete_plausibilitaet: {
      type: "string",
      description:
        "Einschätzung, ob die angesetzte Miete im Verhältnis zur Marktreferenz plausibel ist (inkl. €/m²-Vergleich)",
    },
    verhandlung: {
      type: "object",
      properties: {
        empfohlenes_angebot: {
          type: ["number", "null"],
          description:
            "Empfohlenes Erstangebot in Euro — orientiert an Break-even- und Max-Kaufpreis; null wenn keine seriöse Empfehlung möglich",
        },
        begruendung: {
          type: "string",
          description: "Begründung der Verhandlungsempfehlung",
        },
      },
      required: ["empfohlenes_angebot", "begruendung"],
      additionalProperties: false,
    },
    anfrage_nachricht: {
      type: "string",
      description:
        "Höfliche, konkrete Erstanfrage an den Anbieter (Besichtigungswunsch + Unterlagen), unterschrieben mit 'Hans-Leon Pawlaczyk'",
    },
  },
  required: [
    "zusammenfassung",
    "staerken",
    "risiken",
    "miete_plausibilitaet",
    "verhandlung",
    "anfrage_nachricht",
  ],
  additionalProperties: false,
};
