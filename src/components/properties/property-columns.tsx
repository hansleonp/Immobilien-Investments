"use client";

import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { ExternalLink, Star } from "lucide-react";
import { CashflowValue, ScoreBadge, StatusBadge, AnswerStatusBadge } from "./badges";
import { formatDate, formatEuro, formatFactor, formatNumber, formatPercent, formatSqm } from "@/lib/format";
import { isOverdue, lastContactEvent, nextOpenTask, wasContacted } from "@/lib/derive";
import { SOURCE_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { EnrichedProperty } from "@/types";

const col = createColumnHelper<EnrichedProperty>();

export const propertyColumns = [
  col.accessor((r) => r.property.title, {
    id: "objekt",
    header: "Einheit / Adresse",
    cell: ({ row }) => {
      const p = row.original.property;
      return (
        <div className="flex items-center gap-2">
          {p.is_favorite && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />}
          <div className="min-w-0">
            <div className="truncate font-medium">{p.title}</div>
            <div className="truncate text-xs text-neutral-500">
              {[p.street, [p.zip, p.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
            </div>
          </div>
        </div>
      );
    },
    size: 260,
  }),
  col.accessor((r) => r.property.city, {
    id: "ort",
    header: "Ort",
    cell: (info) => info.getValue() || "—",
  }),
  col.accessor((r) => r.property.price, {
    id: "preis",
    header: "Preis",
    cell: (info) => <span className="tabular-nums">{formatEuro(info.getValue())}</span>,
    sortUndefined: "last",
  }),
  col.accessor((r) => r.property.living_area, {
    id: "flaeche",
    header: "Fläche",
    cell: (info) => <span className="tabular-nums">{formatSqm(info.getValue())}</span>,
  }),
  col.accessor((r) => r.property.rooms, {
    id: "zimmer",
    header: "Zi.",
    cell: (info) => formatNumber(info.getValue()),
  }),
  col.accessor((r) => r.finance.monthlyRent, {
    id: "kaltmiete",
    header: "Kaltmiete (mtl.)",
    cell: (info) => <span className="tabular-nums">{formatEuro(info.getValue())}</span>,
  }),
  col.accessor((r) => r.finance.grossYield, {
    id: "rendite",
    header: "Rendite (brutto)",
    cell: (info) => <span className="tabular-nums">{formatPercent(info.getValue())}</span>,
    sortUndefined: "last",
  }),
  col.accessor((r) => r.finance.purchaseFactor, {
    id: "faktor",
    header: "Faktor (KGV)",
    cell: (info) => <span className="tabular-nums">{formatFactor(info.getValue())}</span>,
    sortUndefined: "last",
  }),
  col.accessor((r) => r.finance.cashflow, {
    id: "cashflow",
    header: "Cashflow (mtl.)",
    cell: (info) => <CashflowValue value={info.getValue()} />,
    sortUndefined: "last",
  }),
  col.accessor((r) => r.score.score, {
    id: "score",
    header: "Bewertung",
    cell: (info) => <ScoreBadge score={info.getValue()} />,
    sortUndefined: "last",
  }),
  col.accessor((r) => r.property.status, {
    id: "status",
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  col.accessor((r) => r.property.answer_status, {
    id: "antwort",
    header: "Antwortstatus",
    cell: (info) => <AnswerStatusBadge status={info.getValue()} />,
  }),
  col.accessor((r) => wasContacted(r.property), {
    id: "kontaktiert",
    header: "Kontaktiert",
    cell: (info) =>
      info.getValue() ? (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <span className="size-2 rounded-full bg-green-500" /> Ja
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <span className="size-2 rounded-full bg-red-400" /> Nein
        </span>
      ),
  }),
  col.accessor((r) => lastContactEvent(r.property)?.event_date ?? null, {
    id: "letzter_kontakt",
    header: "Letzter Kontakt",
    cell: ({ row }) => {
      const event = lastContactEvent(row.original.property);
      if (!event) return <span className="text-neutral-400">—</span>;
      return (
        <div className="text-sm">
          <div>{formatDate(event.event_date)}</div>
          <div className="truncate text-xs text-neutral-500">{event.summary}</div>
        </div>
      );
    },
    sortUndefined: "last",
  }),
  col.accessor((r) => nextOpenTask(r.property)?.due_date ?? null, {
    id: "naechste_aktion",
    header: "Nächste Aktion",
    cell: ({ row }) => {
      const task = nextOpenTask(row.original.property);
      if (!task) return <span className="text-neutral-400">—</span>;
      const overdue = isOverdue(task.due_date);
      return (
        <div className="text-sm">
          <div className={cn("font-medium", overdue ? "text-red-600" : "text-amber-700")}>
            {task.title}
          </div>
          {task.due_date && (
            <div className={cn("text-xs", overdue ? "text-red-500" : "text-neutral-500")}>
              {formatDate(task.due_date)}
            </div>
          )}
        </div>
      );
    },
    sortUndefined: "last",
  }),
  col.accessor((r) => r.property.source, {
    id: "quelle",
    header: "Quelle",
    cell: ({ row }) => {
      const p = row.original.property;
      const label = SOURCE_META[p.source].label;
      return p.source_url ? (
        <Link
          href={p.source_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-green-700 hover:underline"
        >
          {label} <ExternalLink className="size-3" />
        </Link>
      ) : (
        <span className="text-sm text-neutral-500">{label}</span>
      );
    },
  }),
];
