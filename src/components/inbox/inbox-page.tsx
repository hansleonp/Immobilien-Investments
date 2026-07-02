"use client";

import { useState } from "react";
import { ExternalLink, Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SOURCE_META } from "@/lib/constants";
import { formatEuro, formatNumber, formatRelative, formatSqm } from "@/lib/format";
import { useInbox, useUpdateInboxItem } from "@/lib/queries/inbox";
import type { ImportInboxRow, InboxStatus, PropertySource } from "@/types/database";

const STATUS_META: Record<InboxStatus, { label: string; badge: string }> = {
  neu: { label: "Neu", badge: "bg-green-100 text-green-800" },
  uebernommen: { label: "Übernommen", badge: "bg-blue-100 text-blue-800" },
  verworfen: { label: "Verworfen", badge: "bg-neutral-200 text-neutral-600" },
};

type Filter = InboxStatus | "alle";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "neu", label: "Neu" },
  { value: "uebernommen", label: "Übernommen" },
  { value: "verworfen", label: "Verworfen" },
  { value: "alle", label: "Alle" },
];

interface ParsedMeta {
  price?: number;
  livingArea?: number;
  rooms?: number;
  city?: string;
}

function parsedMeta(item: ImportInboxRow): ParsedMeta {
  if (item.parsed == null || typeof item.parsed !== "object" || Array.isArray(item.parsed)) {
    return {};
  }
  return item.parsed as ParsedMeta;
}

/** Objekt → base64url für den ?prefill=-Query-Param des Wizards (wie extension/shared.js) */
function encodePrefill(data: Record<string, unknown>): string {
  const clean: Record<string, unknown> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value != null && value !== "") clean[key] = value;
  });
  const bytes = new TextEncoder().encode(JSON.stringify(clean));
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sourceLabel(source: string): string {
  return SOURCE_META[source as PropertySource]?.label ?? source;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-white px-6 py-16 text-center">
      <Inbox className="size-8 text-neutral-300" />
      <p className="text-sm font-medium text-neutral-600">
        Noch keine Inserate im Posteingang
      </p>
      <p className="max-w-md text-sm text-neutral-400">
        Lege auf den Portalen (ImmoScout24, Kleinanzeigen, Immowelt …) Suchagenten an
        und leite die Treffer-Mails an deine Inbound-Adresse weiter — neue Inserate
        landen dann automatisch hier. Einrichtung siehe Einstellungen.
      </p>
    </div>
  );
}

function InboxItemCard({ item }: { item: ImportInboxRow }) {
  const update = useUpdateInboxItem();
  const meta = parsedMeta(item);
  const status = STATUS_META[item.status];

  const handleTake = () => {
    const prefill = encodePrefill({
      title: item.excerpt ?? undefined,
      price: meta.price,
      living_area: meta.livingArea,
      rooms: meta.rooms,
      city: meta.city,
    });
    const params = new URLSearchParams({ url: item.source_url });
    if (prefill) params.set("prefill", prefill);
    // Erst den Wizard öffnen — der läuft unabhängig weiter —, dann Status setzen
    window.open(`/immobilien/neu?${params.toString()}`, "_blank");
    update.mutate({ id: item.id, status: "uebernommen" });
  };

  const handleDiscard = () => {
    update.mutate({ id: item.id, status: "verworfen" });
  };

  return (
    <Card size="sm">
      <CardContent className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{sourceLabel(item.source)}</Badge>
            <Badge className={status.badge}>{status.label}</Badge>
            <span className="text-xs text-neutral-400">
              {formatRelative(item.received_at)}
            </span>
          </div>
          <p className="font-medium break-words">
            {item.excerpt ?? item.subject ?? "Inserat ohne Titel"}
          </p>
          {(meta.price != null ||
            meta.livingArea != null ||
            meta.rooms != null ||
            meta.city) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {meta.price != null && (
                <Badge variant="secondary">{formatEuro(meta.price)}</Badge>
              )}
              {meta.livingArea != null && (
                <Badge variant="secondary">{formatSqm(meta.livingArea)}</Badge>
              )}
              {meta.rooms != null && (
                <Badge variant="secondary">{formatNumber(meta.rooms)} Zimmer</Badge>
              )}
              {meta.city && <Badge variant="secondary">{meta.city}</Badge>}
            </div>
          )}
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 hover:underline"
          >
            <ExternalLink className="size-3" />
            Inserat öffnen
          </a>
        </div>
        {item.status === "neu" && (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              className="bg-green-700 hover:bg-green-800"
              disabled={update.isPending}
              onClick={handleTake}
            >
              Übernehmen
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={update.isPending}
              onClick={handleDiscard}
            >
              Verwerfen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function InboxPage() {
  const { data: items, isLoading } = useInbox();
  const [filter, setFilter] = useState<Filter>("neu");

  if (isLoading || !items) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return <EmptyState />;

  const filtered = filter === "alle" ? items : items.filter((i) => i.status === filter);
  const countFor = (f: Filter) =>
    f === "alle" ? items.length : items.filter((i) => i.status === f).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
          >
            {f.label} ({countFor(f.value)})
          </Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white px-6 py-10 text-center text-sm text-neutral-400">
          Keine Einträge mit diesem Status.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <InboxItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
