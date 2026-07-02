"use client";

import { useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarDays, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { VIEWING_STATUS_META } from "@/lib/constants";
import { formatDateTime, formatRelative } from "@/lib/format";
import {
  useAllViewings,
  useUpdateViewing,
  type ViewingWithRelations,
} from "@/lib/queries/viewings";
import type { ViewingStatus } from "@/types/database";

const VIEWING_STATUSES = Object.keys(VIEWING_STATUS_META) as ViewingStatus[];

export function ViewingsPage() {
  const { data: viewings, isLoading } = useAllViewings();

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const all = viewings ?? [];
    const upcoming = all
      .filter((v) => v.status === "geplant" && new Date(v.viewing_date) >= now)
      .sort((a, b) => a.viewing_date.localeCompare(b.viewing_date));
    const past = all
      .filter((v) => v.status !== "geplant" || new Date(v.viewing_date) < now)
      .sort((a, b) => b.viewing_date.localeCompare(a.viewing_date));
    return { upcoming, past };
  }, [viewings]);

  if (isLoading) return <Skeleton className="h-72 w-full" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Anstehend {upcoming.length > 0 && `(${upcoming.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="flex h-24 flex-col items-center justify-center gap-1 text-sm text-neutral-400">
              <CalendarDays className="size-5" />
              Keine anstehende Besichtigung. Termine planst du direkt am Objekt.
            </div>
          ) : (
            <ul className="divide-y">
              {upcoming.map((v) => (
                <ViewingLine key={v.id} viewing={v} showRelative />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Vergangen / Sonstige {past.length > 0 && `(${past.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {past.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-400">
              Noch keine vergangenen Besichtigungen.
            </p>
          ) : (
            <ul className="divide-y">
              {past.map((v) => (
                <ViewingLine key={v.id} viewing={v} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ViewingLine({
  viewing: v,
  showRelative = false,
}: {
  viewing: ViewingWithRelations;
  showRelative?: boolean;
}) {
  const updateViewing = useUpdateViewing();
  const p = v.properties;
  const address = p
    ? [p.street, [p.zip, p.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")
    : null;

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
      <div className="w-40 shrink-0">
        <div className="text-sm font-medium tabular-nums">
          {formatDateTime(v.viewing_date)}
        </div>
        {showRelative && (
          <div className="text-xs text-neutral-500">{formatRelative(v.viewing_date)}</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {p ? (
          <Link
            href={`/immobilien/${p.id}`}
            className="text-sm font-medium text-green-700 hover:underline"
          >
            {p.title}
          </Link>
        ) : (
          <span className="text-sm text-neutral-400">Objekt gelöscht</span>
        )}
        <div className="flex flex-wrap gap-x-3 text-xs text-neutral-500">
          {(v.location || address) && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" /> {v.location || address}
            </span>
          )}
          {v.contacts?.name && (
            <span className="flex items-center gap-1">
              <User className="size-3" /> {v.contacts.name}
            </span>
          )}
        </div>
        {v.notes && (
          <p className="mt-0.5 truncate text-xs text-neutral-400">{v.notes}</p>
        )}
      </div>
      <Select
        value={v.status}
        onValueChange={(val) => {
          const status = (val as ViewingStatus) ?? v.status;
          if (status === v.status) return;
          updateViewing.mutate(
            { id: v.id, values: { status } },
            {
              onSuccess: () =>
                toast.success(`Status: ${VIEWING_STATUS_META[status].label}`),
              onError: () => toast.error("Status konnte nicht geändert werden"),
            }
          );
        }}
      >
        <SelectTrigger size="sm" className="w-28 shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VIEWING_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {VIEWING_STATUS_META[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </li>
  );
}
