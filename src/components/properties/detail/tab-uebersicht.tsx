"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashflowValue } from "@/components/properties/badges";
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

export function TabUebersicht({ enriched }: { enriched: EnrichedProperty }) {
  const { property: p, finance } = enriched;
  const nextTask = nextOpenTask(p);

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
              <span className="text-neutral-500">Kaufpreisfaktor</span>
              <span className="font-medium tabular-nums">{formatFactor(finance.purchaseFactor)}</span>
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
