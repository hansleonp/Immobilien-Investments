"use client";

import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { ExternalLink, Star } from "lucide-react";
import {
  AnswerStatusBadge,
  CashflowValue,
  EnergyClassBadge,
  LocationBadge,
  MarketDeltaValue,
  ScoreBadge,
  StatusBadge,
} from "./badges";
import { NotesCell } from "./notes-cell";
import { PropertyRowActions } from "./property-row-actions";
import { formatDate, formatEuro, formatFactor, formatNumber, formatPercent, formatSqm } from "@/lib/format";
import { isOverdue, lastContactEvent, nextOpenTask, nextPlannedViewing, wasContacted } from "@/lib/derive";
import {
  CONDITION_META,
  DISCARD_REASON_META,
  RENTAL_STATUS_META,
  SOURCE_META,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { EnrichedProperty } from "@/types";

/** Deutsche Labels für das Spalten-Dropdown */
export const COLUMN_LABELS: Record<string, string> = {
  objekt: "Einheit / Adresse",
  inseriert: "Inseriert am",
  ort: "Ort",
  lage: "Lage",
  etage: "Etage",
  baujahr: "Baujahr",
  zustand: "Zustand",
  vermietung: "Vermietung",
  preis: "Preis",
  preis_qm: "Preis/m²",
  flaeche: "Fläche",
  zimmer: "Zimmer",
  kaltmiete: "Kaltmiete (mtl.)",
  rendite: "Rendite (brutto)",
  rendite_eff: "Rendite (effektiv)",
  vs_markt: "vs. Markt",
  energie: "Energie",
  faktor: "Faktor (KGV)",
  cashflow: "Cashflow (mtl.)",
  score: "Bewertung",
  status: "Status",
  antwort: "Antwortstatus",
  kontaktiert: "Kontaktiert",
  letzter_kontakt: "Letzter Kontakt",
  naechste_aktion: "Nächste Aktion",
  besichtigung: "Besichtigung",
  quelle: "Quelle",
  verwerfungsgrund: "Verwerfungsgrund",
  notiz: "Notiz",
  dokumente: "Dokumente",
};

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
  col.accessor((r) => r.property.listed_at, {
    id: "inseriert",
    header: "Inseriert am",
    cell: (info) => <span className="tabular-nums">{formatDate(info.getValue())}</span>,
    sortUndefined: "last",
  }),
  col.accessor((r) => r.locationClass, {
    id: "lage",
    header: "Lage",
    cell: (info) => <LocationBadge cls={info.getValue()} />,
    sortUndefined: "last",
  }),
  col.accessor((r) => r.property.floor, {
    id: "etage",
    header: "Etage",
    cell: (info) => info.getValue() || "—",
    sortUndefined: "last",
  }),
  col.accessor((r) => r.property.construction_year, {
    id: "baujahr",
    header: "Baujahr",
    cell: (info) => info.getValue() ?? "—",
    sortUndefined: "last",
  }),
  col.accessor((r) => r.property.condition, {
    id: "zustand",
    header: "Zustand",
    cell: (info) => CONDITION_META[info.getValue()].label,
  }),
  col.accessor((r) => r.property.rental_status, {
    id: "vermietung",
    header: "Vermietung",
    cell: (info) => RENTAL_STATUS_META[info.getValue()].label,
  }),
  col.accessor((r) => r.property.price, {
    id: "preis",
    header: "Preis",
    cell: (info) => <span className="tabular-nums">{formatEuro(info.getValue())}</span>,
    sortUndefined: "last",
  }),
  col.accessor((r) => r.finance.pricePerSqm, {
    id: "preis_qm",
    header: "Preis/m²",
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
  col.accessor((r) => r.finance.effectiveYield, {
    id: "rendite_eff",
    header: "Rendite (effektiv)",
    cell: (info) => <span className="tabular-nums">{formatPercent(info.getValue())}</span>,
    sortUndefined: "last",
  }),
  // "vs. Markt" à la ImmoMetrica: % über/unter dem Referenz-€/m² der Stadt
  col.accessor(
    (r) =>
      r.finance.pricePerSqm != null && r.marketPricePerSqm != null && r.marketPricePerSqm > 0
        ? (r.finance.pricePerSqm / r.marketPricePerSqm - 1) * 100
        : undefined,
    {
      id: "vs_markt",
      header: "vs. Markt",
      cell: ({ row }) => (
        <MarketDeltaValue
          pricePerSqm={row.original.finance.pricePerSqm}
          marketPricePerSqm={row.original.marketPricePerSqm}
        />
      ),
      sortUndefined: "last",
    }
  ),
  col.accessor((r) => r.property.energy_class, {
    id: "energie",
    header: "Energie",
    cell: (info) => <EnergyClassBadge value={info.getValue()} />,
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
  col.accessor((r) => nextPlannedViewing(r.property)?.viewing_date ?? null, {
    id: "besichtigung",
    header: "Besichtigung",
    cell: ({ row }) => {
      const viewing = nextPlannedViewing(row.original.property);
      if (!viewing) return <span className="text-neutral-400">—</span>;
      return <span className="tabular-nums">{formatDate(viewing.viewing_date)}</span>;
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
  col.accessor((r) => r.property.discard_reason, {
    id: "verwerfungsgrund",
    header: "Verwerfungsgrund",
    cell: (info) => {
      const reason = info.getValue();
      if (!reason) return <span className="text-neutral-400">—</span>;
      return DISCARD_REASON_META[reason].label;
    },
    sortUndefined: "last",
  }),
  col.accessor((r) => r.property.notes, {
    id: "notiz",
    header: "Notiz",
    cell: ({ row }) => (
      <NotesCell
        propertyId={row.original.property.id}
        notes={row.original.property.notes}
      />
    ),
    sortUndefined: "last",
  }),
  col.accessor((r) => r.property.documents.length, {
    id: "dokumente",
    header: "Dokumente",
    cell: (info) => <span className="tabular-nums">{info.getValue()}</span>,
  }),
  col.display({
    id: "aktionen",
    header: "",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <PropertyRowActions row={row.original} />
      </div>
    ),
    size: 40,
  }),
];
