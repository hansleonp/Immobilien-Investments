"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashflowValue, MarketDeltaValue } from "@/components/properties/badges";
import { LageCard } from "./lage-card";
import { nextOpenTask } from "@/lib/derive";
import {
  CONDITION_META,
  RENTAL_STATUS_META,
  SOURCE_META,
} from "@/lib/constants";
import {
  formatDate,
  formatEuro,
  formatFactor,
  formatNumber,
  formatPercent,
  formatSqm,
} from "@/lib/format";
import type { EnrichedProperty } from "@/types";
import type { PriceHistoryEntry } from "@/types/database";

/** Tage seit dem Inseratsdatum (null ohne listed_at) */
function daysOnline(listedAt: string | null): number | null {
  if (!listedAt) return null;
  const ms = Date.now() - new Date(listedAt).getTime();
  return ms >= 0 ? Math.floor(ms / 86_400_000) : null;
}

/** Preis-Historie chronologisch, defensiv geparst (jsonb) */
function priceHistory(raw: unknown): PriceHistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (e): e is PriceHistoryEntry =>
      e != null && typeof e === "object" && typeof (e as PriceHistoryEntry).price === "number"
  );
}

export function TabUebersicht({ enriched }: { enriched: EnrichedProperty }) {
  const { property: p, finance, marketRentPerSqm } = enriched;
  const nextTask = nextOpenTask(p);
  const online = daysOnline(p.listed_at);
  const history = priceHistory(p.price_history);

  // Rendite (soll) à la ImmoMetrica: Marktmiete der Stadt statt Ist-Miete
  const marketRent =
    marketRentPerSqm != null && p.living_area != null
      ? marketRentPerSqm * p.living_area
      : null;
  const targetYield =
    marketRent != null && p.price != null && p.price > 0
      ? ((12 * marketRent) / p.price) * 100
      : null;

  const facts: Array<[string, string]> = [
    ["Kaufpreis", formatEuro(p.price)],
    ["Wohnfläche", formatSqm(p.living_area)],
    ["Zimmer", formatNumber(p.rooms)],
    ["Etage", p.floor ?? "—"],
    ["Baujahr", p.construction_year != null ? String(p.construction_year) : "—"],
    ["Zustand", CONDITION_META[p.condition].label],
    ["Vermietung", RENTAL_STATUS_META[p.rental_status].label],
    ["Energieklasse", p.energy_class ?? "—"],
    ["Quelle", SOURCE_META[p.source].label],
    ["€/m²", finance.pricePerSqm != null ? formatEuro(finance.pricePerSqm) : "—"],
    ["Hausgeld", formatEuro(p.hausgeld)],
    [
      "Inseriert am",
      p.listed_at
        ? `${formatDate(p.listed_at)}${online != null ? ` (${online} ${online === 1 ? "Tag" : "Tage"} online)` : ""}`
        : "—",
    ],
    ["Erfasst am", formatDate(p.created_at)],
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Eckdaten</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-neutral-500">{label}</dt>
                <dd className="text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kennzahlen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Bruttorendite</span>
              <span className="font-medium tabular-nums">{formatPercent(finance.grossYield)}</span>
            </div>
            <div className="flex justify-between">
              <span
                className="text-neutral-500"
                title="Jahreskaltmiete ÷ Gesamtkosten (inkl. Kaufnebenkosten + Sanierung)"
              >
                Effektivrendite (Gesamtkosten)
              </span>
              <span className="font-medium tabular-nums">{formatPercent(finance.effectiveYield)}</span>
            </div>
            {targetYield != null && (
              <div className="flex justify-between">
                <span
                  className="text-neutral-500"
                  title={`bei Marktmiete ${formatEuro(marketRent)} / Monat (${formatNumber(marketRentPerSqm)} €/m² in ${p.city})`}
                >
                  Rendite (soll, Marktmiete)
                </span>
                <span className="font-medium tabular-nums">{formatPercent(targetYield)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-500">Kaufpreisfaktor</span>
              <span className="font-medium tabular-nums">{formatFactor(finance.purchaseFactor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">vs. Markt (€/m²)</span>
              <MarketDeltaValue
                pricePerSqm={finance.pricePerSqm}
                marketPricePerSqm={enriched.marketPricePerSqm}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Cashflow (mtl.)</span>
              <CashflowValue value={finance.cashflow} />
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-neutral-500">Max. sinnvoller Kaufpreis</span>
              <span className="font-medium tabular-nums">{formatEuro(finance.maxReasonablePrice)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nächste Aktion</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {nextTask ? (
              <div>
                <div className="font-medium text-amber-700">{nextTask.title}</div>
                {nextTask.due_date && (
                  <div className="text-xs text-neutral-500">
                    fällig am {formatDate(nextTask.due_date)}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-neutral-400">Keine offene Aufgabe.</p>
            )}
          </CardContent>
        </Card>

        <LageCard property={p} />

        {(history.length > 0 || p.listed_at) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historie</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm">
                {p.listed_at && (
                  <li className="flex justify-between gap-2">
                    <span className="text-neutral-500">
                      {formatDate(p.listed_at)}
                    </span>
                    <span className="font-medium">Inseriert</span>
                  </li>
                )}
                {history.map((entry, i) => {
                  const prev = i > 0 ? history[i - 1].price : null;
                  const delta = prev != null ? entry.price - prev : null;
                  return (
                    <li key={`${entry.date}-${i}`} className="flex justify-between gap-2">
                      <span className="text-neutral-500">{formatDate(entry.date)}</span>
                      <span className="text-right font-medium tabular-nums">
                        {formatEuro(entry.price)}
                        {delta != null && delta !== 0 && (
                          <span
                            className={
                              delta < 0 ? "ml-1 text-green-700" : "ml-1 text-red-600"
                            }
                          >
                            ({delta < 0 ? "▼" : "▲"}
                            {Math.abs(Math.round((delta / (entry.price - delta)) * 100))} %)
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        )}

        {p.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notiz</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-neutral-600 line-clamp-6">
                {p.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
