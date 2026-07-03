// Score 0–100 nach Spec §6.2, mit Renormalisierung fehlender Kriterien:
// Ein frisch erfasstes Objekt mit nur Preis + Miete bekommt sofort einen Score
// aus den verfügbaren Kriterien; er wird schärfer, je mehr Daten ergänzt werden.

import type { FinanceResult, Assumptions } from "./calc";
import type { PropertyRow } from "@/types/database";

export interface CriterionScore {
  key: "rendite" | "cashflow" | "markt" | "lage" | "vermietbarkeit" | "zustand";
  label: string;
  weight: number;
  /** 0–100 oder null, wenn Eingaben fehlen */
  value: number | null;
}

export interface ScoreResult {
  /** 0–100 oder null, wenn weder Rendite noch Cashflow berechenbar sind */
  score: number | null;
  /** true, wenn score_override den berechneten Wert übersteuert */
  isOverride: boolean;
  breakdown: CriterionScore[];
  recommendation: "interessant" | "beobachten" | "ablehnen" | null;
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function ratingToScore(rating: number | null): number | null {
  if (rating == null) return null;
  return ((rating - 1) / 4) * 100;
}

export function computeScore(args: {
  finance: FinanceResult;
  ratings: Pick<PropertyRow, "location_rating" | "rentability_rating" | "condition_rating">;
  scoreOverride?: number | null;
  /** Kaufpreis-Referenz €/m² für die Stadt des Objekts (aus market_prices), sonst null */
  marketPricePerSqm: number | null;
  assumptions: Pick<Assumptions, "targetYield" | "minCashflow">;
}): ScoreResult {
  const { finance, ratings, marketPricePerSqm, assumptions } = args;

  // Rendite: 50 Punkte exakt bei Zielrendite, ±2 Prozentpunkte spannen die Skala auf.
  // Bewertet wird die Effektivrendite (auf Gesamtkosten inkl. Nebenkosten) — realistischer
  // als die Bruttorendite auf den reinen Kaufpreis.
  const renditeScore =
    finance.effectiveYield != null
      ? clamp(50 + (finance.effectiveYield - assumptions.targetYield) * 25)
      : null;

  // Cashflow: 50 Punkte bei Mindestcashflow, ±200 € spannen die Skala auf
  const cashflowScore =
    finance.cashflow != null
      ? clamp(50 + (finance.cashflow - assumptions.minCashflow) * 0.25)
      : null;

  // Preis vs. Markt: 20 % unter Markt = 100, auf Marktniveau = 50, 20 % darüber = 0
  const marktScore =
    finance.pricePerSqm != null && marketPricePerSqm != null && marketPricePerSqm > 0
      ? clamp(((1.2 - finance.pricePerSqm / marketPricePerSqm) / 0.4) * 100)
      : null;

  const breakdown: CriterionScore[] = [
    { key: "rendite", label: "Rendite", weight: 25, value: renditeScore },
    { key: "cashflow", label: "Cashflow", weight: 25, value: cashflowScore },
    { key: "markt", label: "Preis vs. Markt", weight: 20, value: marktScore },
    { key: "lage", label: "Lage", weight: 10, value: ratingToScore(ratings.location_rating) },
    {
      key: "vermietbarkeit",
      label: "Vermietbarkeit",
      weight: 10,
      value: ratingToScore(ratings.rentability_rating),
    },
    {
      key: "zustand",
      label: "Zustand/Risiko",
      weight: 10,
      value: ratingToScore(ratings.condition_rating),
    },
  ];

  let score: number | null = null;

  // Ohne die beiden Kernkriterien ist ein Score nicht aussagekräftig
  if (renditeScore != null || cashflowScore != null) {
    const available = breakdown.filter((c) => c.value != null);
    const totalWeight = available.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight > 0) {
      const weighted = available.reduce((sum, c) => sum + c.value! * c.weight, 0);
      score = Math.round(weighted / totalWeight);
    }
  }

  const isOverride = args.scoreOverride != null;
  const effective = args.scoreOverride ?? score;

  const recommendation =
    effective == null
      ? null
      : effective >= 70
        ? "interessant"
        : effective >= 40
          ? "beobachten"
          : "ablehnen";

  return { score: effective, isOverride, breakdown, recommendation };
}
