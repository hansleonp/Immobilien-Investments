"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CashflowValue, ScoreBadge } from "@/components/properties/badges";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { INACTIVE_STATUSES } from "@/lib/constants";
import { formatEuro } from "@/lib/format";
import type { EnrichedProperty } from "@/types";

export function TopDealsCard({ rows }: { rows: EnrichedProperty[] }) {
  const top = useMemo(
    () =>
      rows
        .filter((r) => !INACTIVE_STATUSES.includes(r.property.status))
        .sort((a, b) => (b.score.score ?? -1) - (a.score.score ?? -1))
        .slice(0, 5),
    [rows]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Deals</CardTitle>
        <CardAction>
          <Link
            href="/immobilien"
            className="text-sm text-green-700 hover:underline"
          >
            Alle Objekte →
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <div className="flex h-24 flex-col items-center justify-center gap-1 text-sm text-neutral-400">
            Noch keine aktiven Objekte.
            <Link
              href="/immobilien/neu"
              className="text-green-700 hover:underline"
            >
              Erstes Objekt erfassen →
            </Link>
          </div>
        ) : (
          <ul className="divide-y">
            {top.map((r) => (
              <li key={r.property.id}>
                <Link
                  href={`/immobilien/${r.property.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-neutral-50"
                >
                  <ScoreBadge score={r.score.score} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {r.property.title}
                    </p>
                    <p className="text-xs text-neutral-500">{r.property.city}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <CashflowValue
                      value={r.finance.cashflow}
                      className="text-sm"
                    />
                    <p className="text-xs text-neutral-500 tabular-nums">
                      {formatEuro(r.property.price)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
