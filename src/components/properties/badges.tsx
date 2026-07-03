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
