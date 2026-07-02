"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScoreBadge } from "@/components/properties/badges";
import { DiscardDialog } from "@/components/properties/discard-dialog";
import { enrichProperty } from "@/lib/finance/enrich";
import { useProperty, useUpdateProperty } from "@/lib/queries/properties";
import { useMarketPrices, useSettings } from "@/lib/queries/settings";
import { PROPERTY_STATUSES, SOURCE_META, STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PropertyStatus } from "@/types/database";
import { TabUebersicht } from "./tab-uebersicht";
import { TabFinanzen } from "./tab-finanzen";
import { TabKontakt } from "./tab-kontakt";
import { TabAufgaben } from "./tab-aufgaben";
import { TabBesichtigungen } from "./tab-besichtigungen";
import { TabDokumente } from "./tab-dokumente";
import { TabNotizen } from "./tab-notizen";
import { TabEntscheidung } from "./tab-entscheidung";

export function PropertyDetail({ id }: { id: string }) {
  const { data: property, isLoading, isError } = useProperty(id);
  const { data: settings } = useSettings();
  const { data: marketPrices } = useMarketPrices();
  const update = useUpdateProperty();
  const [discardOpen, setDiscardOpen] = useState(false);

  const enriched = useMemo(() => {
    if (!property || !settings) return null;
    return enrichProperty(property, settings, marketPrices ?? []);
  }, [property, settings, marketPrices]);

  if (isLoading || !settings) return <Skeleton className="h-96 w-full" />;
  if (isError || !property || !enriched) {
    return (
      <p className="text-sm text-red-600">
        Immobilie nicht gefunden.{" "}
        <Link href="/immobilien" className="underline">
          Zurück zur Liste
        </Link>
      </p>
    );
  }

  const p = property;
  const address = [p.street, [p.zip, p.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="mb-4">
        <Link
          href="/immobilien"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft className="size-3.5" /> Zurück zur Liste
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {p.image_url && (
            <Image
              src={p.image_url}
              alt={p.title}
              width={112}
              height={80}
              unoptimized
              className="h-20 w-28 rounded-lg object-cover"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{p.title}</h1>
              <button
                type="button"
                title={p.is_favorite ? "Favorit entfernen" : "Als Favorit markieren"}
                onClick={() =>
                  update.mutate({ id: p.id, values: { is_favorite: !p.is_favorite } })
                }
              >
                <Star
                  className={cn(
                    "size-5",
                    p.is_favorite
                      ? "fill-amber-400 text-amber-400"
                      : "text-neutral-300 hover:text-amber-300"
                  )}
                />
              </button>
            </div>
            <p className="mt-0.5 text-sm text-neutral-500">{address || "Keine Adresse erfasst"}</p>
            {p.source_url && (
              <Link
                href={p.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-green-700 hover:underline"
              >
                Inserat auf {SOURCE_META[p.source].label} öffnen{" "}
                <ExternalLink className="size-3" />
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ScoreBadge score={enriched.score.score} size="lg" />
          <Select
            value={p.status}
            onValueChange={(v) => {
              update.mutate(
                { id: p.id, values: { status: v as PropertyStatus } },
                { onSuccess: () => toast.success("Status aktualisiert") }
              );
            }}
          >
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {p.status !== "verworfen" && (
            <Button variant="outline" onClick={() => setDiscardOpen(true)}>
              <Trash2 className="size-4" /> Verwerfen
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="uebersicht">
        <div className="overflow-x-auto">
          <TabsList>
            <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
            <TabsTrigger value="finanzen">Finanzen</TabsTrigger>
            <TabsTrigger value="kontakt">Kontakt & Verlauf</TabsTrigger>
            <TabsTrigger value="aufgaben">Aufgaben</TabsTrigger>
            <TabsTrigger value="besichtigungen">Besichtigungen</TabsTrigger>
            <TabsTrigger value="dokumente">
              Dokumente
              {p.documents.length > 0 && (
                <span className="ml-1 rounded-full bg-neutral-200 px-1.5 text-xs tabular-nums text-neutral-600">
                  {p.documents.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="notizen">Notizen</TabsTrigger>
            <TabsTrigger value="entscheidung">Entscheidung</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="uebersicht" className="mt-4">
          <TabUebersicht enriched={enriched} />
        </TabsContent>
        <TabsContent value="finanzen" className="mt-4">
          <TabFinanzen enriched={enriched} settings={settings} />
        </TabsContent>
        <TabsContent value="kontakt" className="mt-4">
          <TabKontakt property={p} />
        </TabsContent>
        <TabsContent value="aufgaben" className="mt-4">
          <TabAufgaben property={p} />
        </TabsContent>
        <TabsContent value="besichtigungen" className="mt-4">
          <TabBesichtigungen property={p} />
        </TabsContent>
        <TabsContent value="dokumente" className="mt-4">
          <TabDokumente property={p} />
        </TabsContent>
        <TabsContent value="notizen" className="mt-4">
          <TabNotizen property={p} />
        </TabsContent>
        <TabsContent value="entscheidung" className="mt-4">
          <TabEntscheidung property={p} />
        </TabsContent>
      </Tabs>

      <DiscardDialog property={p} open={discardOpen} onOpenChange={setDiscardOpen} />
    </>
  );
}
