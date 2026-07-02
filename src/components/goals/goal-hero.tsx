"use client";

import { differenceInCalendarMonths } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { SettingsRow } from "@/types/database";

function remainingLabel(goalYear: number): string {
  const months = Math.max(
    0,
    differenceInCalendarMonths(new Date(goalYear, 11, 31), new Date())
  );
  if (months === 0) return "Das Zieljahr ist erreicht";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "Jahr" : "Jahre"}`);
  if (rest > 0) parts.push(`${rest} ${rest === 1 ? "Monat" : "Monate"}`);
  return `Noch ${parts.join(" und ")} Zeit`;
}

function motivation(purchased: number, goal: number): string {
  if (purchased === 0)
    return "Der erste Kauf ist der schwerste — dranbleiben, die Pipeline arbeitet für dich.";
  if (purchased >= goal)
    return "Ziel erreicht — Glückwunsch! Zeit, das nächste Ziel zu setzen.";
  const left = goal - purchased;
  return `Stark! Nur noch ${left} ${left === 1 ? "Wohnung" : "Wohnungen"} bis zum Ziel.`;
}

export function GoalHero({
  purchased,
  settings,
}: {
  purchased: number;
  settings: SettingsRow;
}) {
  const goal = Math.max(1, settings.goal_units);
  const pct = Math.min(100, Math.round((purchased / goal) * 100));

  return (
    <Card>
      <CardContent className="space-y-4 py-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-3xl font-semibold tracking-tight">
            {purchased} von {settings.goal_units}{" "}
            {settings.goal_units === 1 ? "Wohnung" : "Wohnungen"} bis{" "}
            {settings.goal_year}
          </h2>
          <span className="text-sm text-neutral-500">
            {remainingLabel(settings.goal_year)}
          </span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-neutral-100"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Zielfortschritt"
        >
          <div
            className="h-full rounded-full bg-green-600 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-sm text-neutral-500">
          {pct} % geschafft · {motivation(purchased, settings.goal_units)}
        </p>
      </CardContent>
    </Card>
  );
}
