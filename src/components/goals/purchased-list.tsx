"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { CashflowValue } from "@/components/properties/badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatEuro, formatFactor, formatPercent } from "@/lib/format";
import type { EnrichedProperty } from "@/types";

function sumOrNull(values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v != null);
  if (present.length === 0) return null;
  return present.reduce((acc, v) => acc + v, 0);
}

function avgOrNull(values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v != null);
  if (present.length === 0) return null;
  return present.reduce((acc, v) => acc + v, 0) / present.length;
}

export function PurchasedList({ purchased }: { purchased: EnrichedProperty[] }) {
  const sorted = [...purchased].sort((a, b) =>
    (a.property.purchased_at ?? "").localeCompare(b.property.purchased_at ?? "")
  );

  const totalInvestment = sumOrNull(sorted.map((r) => r.finance.totalCost));
  const totalCashflow = sumOrNull(sorted.map((r) => r.finance.cashflow));
  const avgYield = avgOrNull(sorted.map((r) => r.finance.grossYield));
  const avgFactor = avgOrNull(sorted.map((r) => r.finance.purchaseFactor));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Gekaufte Objekte {sorted.length > 0 && `(${sorted.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.length === 0 ? (
          <div className="flex h-24 flex-col items-center justify-center gap-1 text-sm text-neutral-400">
            <KeyRound className="size-5" />
            Noch keine Wohnung gekauft — dein erstes Ziel wartet.
          </div>
        ) : (
          <>
            <ul className="divide-y">
              {sorted.map((r) => (
                <li key={r.property.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/immobilien/${r.property.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {r.property.title}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      Gekauft am {formatDate(r.property.purchased_at)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatEuro(r.property.price)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Summen */}
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-neutral-50 p-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-neutral-500">Gesamtinvestition</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">
                  {formatEuro(totalInvestment)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Cashflow / Monat</p>
                <p className="mt-0.5 text-sm">
                  <CashflowValue value={totalCashflow} className="font-semibold" />
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Ø Bruttorendite</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">
                  {formatPercent(avgYield)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Ø Kaufpreisfaktor</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">
                  {formatFactor(avgFactor)}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
