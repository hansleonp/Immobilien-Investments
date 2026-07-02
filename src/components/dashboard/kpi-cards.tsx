"use client";

import Link from "next/link";
import { subDays } from "date-fns";
import {
  Archive,
  Building2,
  CalendarDays,
  Hourglass,
  KeyRound,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { INACTIVE_STATUSES } from "@/lib/constants";
import { wasContacted } from "@/lib/derive";
import type { ViewingWithRelations } from "@/lib/queries/viewings";
import type { EnrichedProperty } from "@/types";

type Kpi = {
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
};

export function KpiCards({
  rows,
  viewings,
}: {
  rows: EnrichedProperty[];
  viewings: ViewingWithRelations[];
}) {
  const now = new Date();
  const weekAgo = subDays(now, 7);
  const active = rows.filter(
    (r) => !INACTIVE_STATUSES.includes(r.property.status)
  );

  const kpis: Kpi[] = [
    {
      label: "Aktiv in der Suche",
      value: active.length,
      icon: Building2,
      href: "/immobilien",
    },
    {
      label: "Neu diese Woche",
      value: rows.filter((r) => new Date(r.property.created_at) >= weekAgo)
        .length,
      icon: Sparkles,
      href: "/immobilien?status=neu",
    },
    {
      label: "Kontaktiert",
      value: active.filter((r) => wasContacted(r.property)).length,
      icon: Send,
      href: "/immobilien?kontaktiert=ja",
    },
    {
      label: "Antwort ausstehend",
      value: active.filter((r) =>
        ["anfrage_gesendet", "antwort_ausstehend"].includes(
          r.property.answer_status
        )
      ).length,
      icon: Hourglass,
      href: "/immobilien?status=antwort_ausstehend",
    },
    {
      label: "Besichtigungen geplant",
      value: viewings.filter(
        (v) => v.status === "geplant" && new Date(v.viewing_date) >= now
      ).length,
      icon: CalendarDays,
      href: "/immobilien?besichtigung=1",
    },
    {
      label: "Verworfen",
      value: rows.filter((r) => r.property.status === "verworfen").length,
      icon: Archive,
      href: "/immobilien?status=verworfen&inaktive=1",
    },
    {
      label: "Gekauft",
      value: rows.filter((r) => r.property.status === "gekauft").length,
      icon: KeyRound,
      href: "/immobilien?status=gekauft&inaktive=1",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {kpis.map((kpi) => (
        <Link key={kpi.label} href={kpi.href} className="group">
          <Card className="h-full gap-0 py-4 transition-shadow group-hover:shadow-md">
            <CardContent className="px-4">
              <kpi.icon className="size-4 text-neutral-400" />
              <p className="mt-2 text-2xl font-semibold tabular-nums">
                {kpi.value}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">{kpi.label}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
