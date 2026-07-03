import { Badge } from "@/components/ui/badge";
import {
  ANSWER_STATUS_META,
  LOCATION_CLASS_META,
  PRIORITY_META,
  scoreBand,
  STATUS_META,
  VIEWING_STATUS_META,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  AnswerStatus,
  LocationClass,
  PropertyStatus,
  TaskPriority,
  ViewingStatus,
} from "@/types/database";

export function StatusBadge({ status }: { status: PropertyStatus }) {
  const meta = STATUS_META[status];
  return <Badge className={cn("border-transparent", meta.badge)}>{meta.label}</Badge>;
}

export function AnswerStatusBadge({ status }: { status: AnswerStatus }) {
  const meta = ANSWER_STATUS_META[status];
  return <Badge className={cn("border-transparent", meta.badge)}>{meta.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const meta = PRIORITY_META[priority];
  return <Badge className={cn("border-transparent", meta.badge)}>{meta.label}</Badge>;
}

export function ViewingStatusBadge({ status }: { status: ViewingStatus }) {
  const meta = VIEWING_STATUS_META[status];
  return <Badge className={cn("border-transparent", meta.badge)}>{meta.label}</Badge>;
}

/** Ampelfarben je Energieeffizienzklasse (A+/A grün → H rot), wie auf dem Energieausweis */
const ENERGY_CLASS_BADGE: Record<string, string> = {
  "A+": "bg-green-600 text-white",
  A: "bg-green-500 text-white",
  B: "bg-lime-500 text-white",
  C: "bg-yellow-400 text-yellow-950",
  D: "bg-amber-400 text-amber-950",
  E: "bg-orange-400 text-white",
  F: "bg-orange-600 text-white",
  G: "bg-red-500 text-white",
  H: "bg-red-700 text-white",
};

export function EnergyClassBadge({ value }: { value: string | null }) {
  if (!value || !value.trim()) return <span className="text-neutral-300">—</span>;
  const cls = value.trim().toUpperCase();
  const badge = ENERGY_CLASS_BADGE[cls];
  if (!badge) return <span className="text-sm">{value}</span>;
  return (
    <Badge className={cn("min-w-7 justify-center border-transparent font-semibold", badge)}>
      {cls}
    </Badge>
  );
}

/** "vs. Markt": % über/unter dem Referenz-€/m² der Stadt (unter Markt = grün) */
export function MarketDeltaValue({
  pricePerSqm,
  marketPricePerSqm,
}: {
  pricePerSqm: number | null;
  marketPricePerSqm: number | null;
}) {
  if (pricePerSqm == null || marketPricePerSqm == null || marketPricePerSqm <= 0) {
    return <span className="text-neutral-300">—</span>;
  }
  const delta = (pricePerSqm / marketPricePerSqm - 1) * 100;
  const rounded = Math.round(delta);
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        rounded <= 0 ? "text-green-700" : "text-red-600"
      )}
      title={`Objekt: ${Math.round(pricePerSqm).toLocaleString("de-DE")} €/m² · Markt: ${Math.round(marketPricePerSqm).toLocaleString("de-DE")} €/m²`}
    >
      {rounded <= 0 ? "▼" : "▲"} {rounded > 0 ? "+" : ""}
      {rounded} %
    </span>
  );
}

export function LocationBadge({ cls }: { cls: LocationClass | null }) {
  if (cls == null) return <span className="text-neutral-300">—</span>;
  const meta = LOCATION_CLASS_META[cls];
  return (
    <Badge className={cn("border-transparent", meta.badge)} title={meta.hint}>
      {meta.label}
    </Badge>
  );
}

/** Score als farbiger Ring (wie in der Referenz-UI) */
export function ScoreBadge({
  score,
  size = "md",
}: {
  score: number | null;
  size?: "md" | "lg";
}) {
  if (score == null) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-neutral-100 font-semibold text-neutral-400 ring-2 ring-neutral-200",
          size === "lg" ? "size-14 text-lg" : "size-9 text-xs"
        )}
        title="Score unvollständig — Preis und Miete erfassen"
      >
        —
      </span>
    );
  }
  const band = scoreBand(score);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-white font-semibold ring-2",
        band.color,
        band.ring,
        size === "lg" ? "size-14 text-lg" : "size-9 text-xs"
      )}
      title={band.label}
    >
      {score}
    </span>
  );
}

/** Cashflow grün/rot formatiert */
export function CashflowValue({
  value,
  className,
}: {
  value: number | null;
  className?: string;
}) {
  if (value == null) return <span className={cn("text-neutral-400", className)}>—</span>;
  const rounded = Math.round(value);
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        rounded >= 0 ? "text-green-700" : "text-red-600",
        className
      )}
    >
      {rounded >= 0 ? "+" : "−"}
      {Math.abs(rounded).toLocaleString("de-DE")} €
    </span>
  );
}
