// POST /api/ai/analyze — KI-Investment-Analyse für ein Objekt.
// Lädt Objekt + Settings + Marktpreise über den Server-Supabase-Client mit
// Nutzer-Session (RLS greift), berechnet Kennzahlen serverseitig, holt eine
// strukturierte Analyse von Claude (erzwungenes Tool-Use) und cached das
// Ergebnis in properties.ai_analysis / ai_analyzed_at.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getAnthropic, isAnthropicConfigured, MODEL } from "@/lib/ai/client";
import {
  PROPERTY_ANALYSIS_JSON_SCHEMA,
  propertyAnalysisSchema,
} from "@/lib/ai/schemas";
import { createClient } from "@/lib/supabase/server";
import {
  computePropertyFinance,
  resolveAssumptions,
  type Assumptions,
  type FinanceResult,
} from "@/lib/finance/calc";
import { computeScore, type ScoreResult } from "@/lib/finance/score";
import { marketPriceForCity } from "@/lib/finance/enrich";
import { CONDITION_META, RENTAL_STATUS_META, STATUS_META } from "@/lib/constants";
import type { ContactRow, MarketPriceRow, PropertyRow } from "@/types/database";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({ propertyId: z.string().min(1) });

const SYSTEM_PROMPT = `Du bist ein erfahrener deutscher Immobilien-Investment-Berater für Kapitalanlagen (Vermietung).
Du analysierst Wohnimmobilien nüchtern und konkret auf Basis der übergebenen Daten und Kennzahlen — keine Werbesprache, keine Rechtsberatung.

Regeln:
- Argumentiere mit den konkreten Zahlen aus dem Kontext (Rendite, Cashflow, €/m² vs. Marktreferenz).
- Die Verhandlungsempfehlung (empfohlenes_angebot) soll sich am Break-even-Kaufpreis und am maximal sinnvollen Kaufpreis orientieren; sie darf den Angebotspreis unterschreiten, muss aber realistisch verhandelbar bleiben. Ist keine seriöse Empfehlung möglich (z. B. Miete unbekannt), setze null und begründe das.
- Fehlende Daten benennst du als offene Punkte statt sie zu erfinden.
- anfrage_nachricht: eine höfliche, konkrete Erstanfrage an den Anbieter auf Deutsch — Interesse am Objekt, Bitte um einen Besichtigungstermin sowie um Unterlagen (Teilungserklärung, aktuelle Hausgeldabrechnung, Protokolle der letzten Eigentümerversammlungen). Keine Platzhalter wie [Name]. Unterschrieben mit "Hans-Leon Pawlaczyk".`;

function eur(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "unbekannt";
  return `${Math.round(value).toLocaleString("de-DE")} €`;
}

function numOrUnknown(value: number | null | undefined, unit = ""): string {
  if (value == null || Number.isNaN(value)) return "unbekannt";
  return `${value.toLocaleString("de-DE", { maximumFractionDigits: 2 })}${unit}`;
}

function buildContext(args: {
  property: PropertyRow & { contacts: ContactRow[] };
  finance: FinanceResult;
  score: ScoreResult;
  assumptions: Assumptions;
  marketRef: MarketPriceRow | null;
}): string {
  const { property: p, finance: f, score, assumptions: a, marketRef } = args;

  const address = [p.street, [p.zip, p.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  const lines: string[] = [
    "OBJEKTDATEN",
    `Titel: ${p.title}`,
    `Adresse: ${address || "unbekannt"}`,
    `Status im Prozess: ${STATUS_META[p.status].label}`,
    `Angebotspreis: ${eur(p.price)}`,
    `Wohnfläche: ${numOrUnknown(p.living_area, " m²")}`,
    `Zimmer: ${numOrUnknown(p.rooms)}`,
    `Etage: ${p.floor ?? "unbekannt"}`,
    `Baujahr: ${p.construction_year ?? "unbekannt"}`,
    `Zustand: ${CONDITION_META[p.condition].label}`,
    `Energieklasse: ${p.energy_class ?? "unbekannt"}`,
    `Vermietungsstatus: ${RENTAL_STATUS_META[p.rental_status].label}`,
    `Ist-Kaltmiete: ${eur(p.current_rent_cold)}/Monat`,
    `Soll-/Marktkaltmiete (geschätzt): ${eur(p.estimated_rent_cold)}/Monat`,
    `Hausgeld gesamt: ${eur(p.hausgeld)}/Monat`,
    `davon nicht umlagefähig: ${eur(p.hausgeld_non_recoverable)}/Monat`,
    `Instandhaltungspuffer: ${eur(f.maintenanceMonthly)}/Monat`,
    `Geplante Sanierungskosten: ${eur(p.planned_renovation_costs)}`,
    "",
    "BERECHNETE KENNZAHLEN",
    `Gesamtkosten (inkl. Nebenkosten + Sanierung): ${eur(f.totalCost)}`,
    `Eigenkapital: ${eur(f.equityAmount)} · Darlehen: ${eur(f.loanAmount)}`,
    `Monatsrate (Zins + Tilgung): ${eur(f.monthlyRate)}`,
    `Monatlicher Cashflow: ${eur(f.cashflow)}`,
    `Bruttomietrendite: ${numOrUnknown(f.grossYield, " %")}`,
    `Kaufpreisfaktor: ${numOrUnknown(f.purchaseFactor)}`,
    `Preis pro m²: ${eur(f.pricePerSqm)}`,
    `Miete pro m²: ${numOrUnknown(f.rentPerSqm, " €/m²")}`,
    `Break-even-Kaufpreis (Cashflow = 0): ${eur(f.breakEvenPrice)}`,
    `Max. sinnvoller Kaufpreis: ${eur(f.maxReasonablePrice)}${
      f.bindingConstraint ? ` (begrenzt durch ${f.bindingConstraint === "rendite" ? "Zielrendite" : "Mindest-Cashflow"})` : ""
    }`,
    `Interner Score (0–100): ${score.score ?? "unbekannt"}${
      score.recommendation ? ` — Empfehlung: ${score.recommendation}` : ""
    }`,
    "",
    "MARKTREFERENZ",
    marketRef
      ? `${marketRef.city}: Kaufpreis-Referenz ${numOrUnknown(marketRef.price_per_sqm, " €/m²")}, Miet-Referenz ${numOrUnknown(marketRef.rent_per_sqm, " €/m²")}`
      : `Keine Marktreferenz für "${p.city}" hinterlegt.`,
    "",
    "ZIELANNAHMEN DES INVESTORS",
    `Eigenkapitalquote: ${a.equityPercent} % · Zinssatz: ${a.interestRate} % p.a. · Tilgung: ${a.repaymentRate} % p.a.`,
    `Kaufnebenkosten: ${a.purchaseCostsPercent} %`,
    `Zielrendite (brutto): ${a.targetYield} % · Mindest-Cashflow: ${a.minCashflow} €/Monat`,
  ];

  if (p.contacts.length > 0) {
    lines.push("", "ANSPRECHPARTNER");
    for (const c of p.contacts) {
      lines.push(
        `- ${c.name}${c.company ? ` (${c.company})` : ""}${c.role ? `, ${c.role}` : ""}${c.platform ? ` · via ${c.platform}` : ""}`
      );
    }
  }

  if (p.notes) {
    lines.push("", "NOTIZEN DES INVESTORS", p.notes);
  }

  return lines.join("\n");
}

export async function POST(request: Request) {
  if (!isAnthropicConfigured()) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY nicht konfiguriert" },
      { status: 503 }
    );
  }

  let propertyId: string;
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Ungültige Anfrage: propertyId fehlt" },
        { status: 400 }
      );
    }
    propertyId = parsed.data.propertyId;
  } catch {
    return Response.json({ error: "Ungültiger Request-Body" }, { status: 400 });
  }

  // Server-Client mit Nutzer-Session — RLS beschränkt auf eigene Daten
  const supabase = await createClient();

  const { data: propertyData, error: propertyError } = await supabase
    .from("properties")
    .select("*, contacts(*)")
    .eq("id", propertyId)
    .maybeSingle();
  if (propertyError) {
    console.error("[ai/analyze] Supabase-Fehler:", propertyError);
    return Response.json({ error: "Objekt konnte nicht geladen werden" }, { status: 500 });
  }
  if (!propertyData) {
    return Response.json({ error: "Immobilie nicht gefunden" }, { status: 404 });
  }
  const property = propertyData as unknown as PropertyRow & { contacts: ContactRow[] };

  const { data: settings } = await supabase.from("settings").select("*").maybeSingle();
  if (!settings) {
    return Response.json(
      { error: "Einstellungen nicht gefunden" },
      { status: 500 }
    );
  }

  const { data: marketPrices } = await supabase.from("market_prices").select("*");

  const finance = computePropertyFinance(property, settings);
  const assumptions = resolveAssumptions(property, settings);
  const marketRef = marketPriceForCity(property.city, marketPrices ?? []);
  const score = computeScore({
    finance,
    ratings: property,
    scoreOverride: property.score_override,
    marketPricePerSqm: marketRef?.price_per_sqm ?? null,
    assumptions,
  });

  const context = buildContext({ property, finance, score, assumptions, marketRef });

  try {
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [
        {
          name: "provide_analysis",
          description:
            "Liefert die strukturierte Investment-Analyse für das Objekt.",
          input_schema: PROPERTY_ANALYSIS_JSON_SCHEMA,
        },
      ],
      tool_choice: { type: "tool", name: "provide_analysis" },
      messages: [
        {
          role: "user",
          content: `Analysiere dieses Immobilienangebot als Kapitalanlage:\n\n${context}`,
        },
      ],
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return Response.json(
        { error: "KI-Antwort enthielt keine Analyse" },
        { status: 502 }
      );
    }

    const parsed = propertyAnalysisSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      console.error("[ai/analyze] Validierung fehlgeschlagen:", parsed.error.issues);
      return Response.json(
        { error: "KI-Antwort konnte nicht validiert werden" },
        { status: 502 }
      );
    }
    const analysis = parsed.data;

    // Ergebnis cachen (über denselben Server-Client — RLS greift)
    const { error: updateError } = await supabase
      .from("properties")
      .update({
        ai_analysis: analysis,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq("id", propertyId);
    if (updateError) {
      console.error("[ai/analyze] Cache-Update fehlgeschlagen:", updateError);
      // Analyse trotzdem zurückgeben — nur der Cache fehlt
    }

    return Response.json({ analysis });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error("[ai/analyze] Claude API error:", err.status, err.message);
      return Response.json(
        { error: "Claude-API-Fehler bei der Analyse" },
        { status: 502 }
      );
    }
    console.error("[ai/analyze] Unerwarteter Fehler:", err);
    return Response.json(
      { error: "Unerwarteter Fehler bei der Analyse" },
      { status: 500 }
    );
  }
}
