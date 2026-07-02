"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EnrichedProperty } from "@/types";
import type { PropertyStatus } from "@/types/database";

type Stage = {
  label: string;
  statuses: PropertyStatus[];
  barClass: string;
};

const STAGES: Stage[] = [
  { label: "Neu", statuses: ["neu"], barClass: "bg-sky-400" },
  { label: "Interessant", statuses: ["interessant"], barClass: "bg-emerald-400" },
  {
    label: "Kontaktiert",
    statuses: ["kontaktiert", "antwort_ausstehend", "rueckmeldung_erhalten"],
    barClass: "bg-blue-400",
  },
  {
    label: "Besichtigung",
    statuses: ["besichtigung_geplant", "besichtigung_erledigt"],
    barClass: "bg-violet-400",
  },
  {
    label: "Verhandlung",
    statuses: [
      "unterlagen_pruefen",
      "angebot_vorbereiten",
      "angebot_abgegeben",
      "verhandlung",
      "notarvorbereitung",
    ],
    barClass: "bg-orange-400",
  },
  { label: "Gekauft", statuses: ["gekauft"], barClass: "bg-green-600" },
];

const DROPPED: Stage[] = [
  { label: "Verworfen", statuses: ["verworfen"], barClass: "bg-neutral-300" },
  { label: "Abgelehnt", statuses: ["abgelehnt"], barClass: "bg-neutral-300" },
];

function countFor(rows: EnrichedProperty[], statuses: PropertyStatus[]): number {
  return rows.filter((r) => statuses.includes(r.property.status)).length;
}

function stageHref(stage: Stage): string {
  const params = new URLSearchParams({ status: stage.statuses.join(",") });
  // Verworfene/abgelehnte/gekaufte Objekte sind in der Liste standardmäßig ausgeblendet
  if (stage.statuses.some((s) => ["verworfen", "abgelehnt", "gekauft"].includes(s))) {
    params.set("inaktive", "1");
  }
  return `/immobilien?${params.toString()}`;
}

function FunnelRow({
  stage,
  count,
  max,
  muted,
}: {
  stage: Stage;
  count: number;
  max: number;
  muted?: boolean;
}) {
  const widthPct = count === 0 ? 0 : Math.max(6, (count / max) * 100);
  return (
    <Link
      href={stageHref(stage)}
      className="group flex items-center gap-3"
      title={`${stage.label}: ${count} ${count === 1 ? "Objekt" : "Objekte"}`}
    >
      <span
        className={cn(
          "w-28 shrink-0 text-sm",
          muted ? "text-neutral-400" : "text-neutral-600"
        )}
      >
        {stage.label}
      </span>
      <div className="h-5 flex-1 overflow-hidden rounded bg-neutral-100">
        <div
          className={cn(
            "h-full rounded transition-all group-hover:opacity-80",
            stage.barClass
          )}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span
        className={cn(
          "w-8 shrink-0 text-right text-sm font-semibold tabular-nums",
          muted && "font-normal text-neutral-400"
        )}
      >
        {count}
      </span>
    </Link>
  );
}

export function PipelineFunnel({ rows }: { rows: EnrichedProperty[] }) {
  const stageCounts = STAGES.map((s) => countFor(rows, s.statuses));
  const droppedCounts = DROPPED.map((s) => countFor(rows, s.statuses));
  const max = Math.max(1, ...stageCounts, ...droppedCounts);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {STAGES.map((stage, i) => (
          <FunnelRow
            key={stage.label}
            stage={stage}
            count={stageCounts[i]}
            max={max}
          />
        ))}
        <div className="mt-4 space-y-2 border-t pt-4">
          {DROPPED.map((stage, i) => (
            <FunnelRow
              key={stage.label}
              stage={stage}
              count={droppedCounts[i]}
              max={max}
              muted
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
