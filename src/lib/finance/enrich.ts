import type { MarketPriceRow, SettingsRow } from "@/types/database";
import type { EnrichedProperty, PropertyWithRelations } from "@/types";
import { computePropertyFinance, resolveAssumptions } from "./calc";
import { computeScore } from "./score";

export function marketPriceForCity(
  city: string,
  marketPrices: MarketPriceRow[]
): MarketPriceRow | null {
  const normalized = city.trim().toLowerCase();
  return (
    marketPrices.find((m) => m.city.trim().toLowerCase() === normalized) ?? null
  );
}

/** Reichert ein Objekt um Finanzkennzahlen und Score an (alles zur Laufzeit). */
export function enrichProperty(
  property: PropertyWithRelations,
  settings: SettingsRow,
  marketPrices: MarketPriceRow[]
): EnrichedProperty {
  const finance = computePropertyFinance(property, settings);
  const marketRef = marketPriceForCity(property.city, marketPrices);
  const score = computeScore({
    finance,
    ratings: property,
    scoreOverride: property.score_override,
    marketPricePerSqm: marketRef?.price_per_sqm ?? null,
    assumptions: resolveAssumptions(property, settings),
  });
  return { property, finance, score, locationClass: marketRef?.location_class ?? null };
}
