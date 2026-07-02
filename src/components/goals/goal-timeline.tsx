"use client";

import { Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { EnrichedProperty } from "@/types";

const START_YEAR = 2026;

export function GoalTimeline({
  purchased,
  goalYear,
}: {
  purchased: EnrichedProperty[];
  goalYear: number;
}) {
  const endYear = Math.max(goalYear, START_YEAR);
  const axisStart = new Date(START_YEAR, 0, 1).getTime();
  const axisEnd = new Date(endYear, 11, 31).getTime();
  const span = Math.max(1, axisEnd - axisStart);

  const years: number[] = [];
  for (let y = START_YEAR; y <= endYear; y++) years.push(y);

  const pctFor = (time: number) =>
    Math.min(100, Math.max(0, ((time - axisStart) / span) * 100));

  const dots = purchased
    .filter((r) => r.property.purchased_at != null)
    .map((r) => ({
      id: r.property.id,
      title: r.property.title,
      date: r.property.purchased_at as string,
      pct: pctFor(new Date(r.property.purchased_at + "T00:00:00").getTime()),
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Zeitachse bis {endYear}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mx-4 h-20">
          {/* Achse */}
          <div className="absolute top-8 right-0 left-0 h-0.5 rounded bg-neutral-200" />

          {/* Jahres-Marker */}
          {years.map((y) => {
            const pct = pctFor(new Date(y, 0, 1).getTime());
            return (
              <div key={y}>
                <div
                  className="absolute top-[26px] h-3 w-px -translate-x-1/2 bg-neutral-300"
                  style={{ left: `${pct}%` }}
                />
                <span
                  className="absolute top-11 -translate-x-1/2 text-xs text-neutral-500 tabular-nums"
                  style={{ left: `${pct}%` }}
                >
                  {y}
                </span>
              </div>
            );
          })}

          {/* Ziel-Flagge am Ende */}
          <Flag
            className="absolute top-8 right-0 size-4 -translate-y-full text-green-700"
            aria-label={`Ziel: Ende ${endYear}`}
          />

          {/* Käufe als grüne Punkte */}
          {dots.map((d) => (
            <span
              key={d.id}
              className="absolute top-8 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-600 ring-2 ring-white"
              style={{ left: `${d.pct}%` }}
              title={`${d.title} — gekauft am ${formatDate(d.date)}`}
            />
          ))}
        </div>
        {dots.length === 0 && (
          <p className="mt-2 text-center text-sm text-neutral-400">
            Noch keine Käufe auf der Zeitachse.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
