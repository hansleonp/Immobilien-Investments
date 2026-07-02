"use client";

import Link from "next/link";
import { differenceInCalendarMonths } from "date-fns";
import { Target } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { EnrichedProperty } from "@/types";
import type { SettingsRow } from "@/types/database";

export function GoalProgressCard({
  rows,
  settings,
}: {
  rows: EnrichedProperty[];
  settings: SettingsRow;
}) {
  const purchased = rows.filter(
    (r) => r.property.status === "gekauft"
  ).length;
  const goal = Math.max(1, settings.goal_units);
  const pct = Math.min(100, Math.round((purchased / goal) * 100));
  const monthsLeft = Math.max(
    0,
    differenceInCalendarMonths(
      new Date(settings.goal_year, 11, 31),
      new Date()
    )
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="size-4 text-neutral-400" />
          Zielfortschritt
        </CardTitle>
        <CardAction>
          <Link href="/ziele" className="text-sm text-green-700 hover:underline">
            Zur Ziele-Seite →
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-2xl font-semibold tabular-nums">
          {purchased}{" "}
          <span className="text-base font-normal text-neutral-500">
            von {settings.goal_units}{" "}
            {settings.goal_units === 1 ? "Wohnung" : "Wohnungen"} bis{" "}
            {settings.goal_year}
          </span>
        </p>
        <Progress value={pct} aria-label="Zielfortschritt" />
        <p className="text-xs text-neutral-500">
          {monthsLeft > 0
            ? `Noch ${monthsLeft} ${monthsLeft === 1 ? "Monat" : "Monate"} bis Ende ${settings.goal_year}`
            : `Das Zieljahr ${settings.goal_year} ist erreicht`}
          {" · "}
          {pct} % geschafft
        </p>
      </CardContent>
    </Card>
  );
}
