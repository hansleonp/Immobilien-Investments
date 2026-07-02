"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { ViewingWithRelations } from "@/lib/queries/viewings";

export function UpcomingViewingsCard({
  viewings,
}: {
  viewings: ViewingWithRelations[];
}) {
  const upcoming = useMemo(() => {
    const now = new Date();
    return viewings
      .filter((v) => v.status === "geplant" && new Date(v.viewing_date) >= now)
      .sort((a, b) => a.viewing_date.localeCompare(b.viewing_date))
      .slice(0, 5);
  }, [viewings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nächste Besichtigungen</CardTitle>
        <CardAction>
          <Link
            href="/besichtigungen"
            className="text-sm text-green-700 hover:underline"
          >
            Alle Besichtigungen →
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <div className="flex h-24 flex-col items-center justify-center gap-1 text-sm text-neutral-400">
            <CalendarDays className="size-5" />
            Keine Besichtigung geplant.
          </div>
        ) : (
          <ul className="divide-y">
            {upcoming.map((v) => (
              <li key={v.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  {v.properties ? (
                    <Link
                      href={`/immobilien/${v.properties.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {v.properties.title}
                    </Link>
                  ) : (
                    <span className="text-sm text-neutral-500">
                      Objekt gelöscht
                    </span>
                  )}
                  <p className="text-xs text-neutral-500">
                    {formatDateTime(v.viewing_date)}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-neutral-500">
                  {formatRelative(v.viewing_date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
