"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  parseImmoMetricaCsv,
  type ImmoMetricaRow,
} from "@/lib/import/immometrica";
import { useMarketPrices } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/client";
import type {
  Json,
  MarketPriceRow,
  PriceHistoryEntry,
  PropertyInsert,
  PropertyRow,
} from "@/types/database";

type ExistingProperty = Pick<
  PropertyRow,
  | "id"
  | "source"
  | "source_url"
  | "external_id"
  | "price"
  | "listed_at"
  | "street"
  | "zip"
  | "hausgeld"
  | "construction_year"
  | "condition"
  | "current_rent_cold"
  | "price_history"
>;

interface ImportResult {
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
}

function marketRent(city: string, prices: MarketPriceRow[]): number | null {
  const normalized = city.trim().toLowerCase();
  return (
    prices.find((p) => p.city.trim().toLowerCase() === normalized)?.rent_per_sqm ?? null
  );
}

/** Merge einer CSV-Zeile in ein bestehendes Objekt: nur fehlende Felder füllen */
function buildPatch(row: ImmoMetricaRow, existing: ExistingProperty): Partial<PropertyInsert> {
  const patch: Partial<PropertyInsert> = {};

  // Inseratsdatum: setzen wenn leer — oder das (echte) frühere Datum übernehmen
  if (row.listedAt && (!existing.listed_at || row.listedAt < existing.listed_at)) {
    patch.listed_at = row.listedAt;
  }
  if (row.street && !existing.street) patch.street = row.street;
  if (row.zip && !existing.zip) patch.zip = row.zip;
  if (row.hausgeld != null && existing.hausgeld == null) patch.hausgeld = row.hausgeld;
  if (row.constructionYear != null && existing.construction_year == null) {
    patch.construction_year = row.constructionYear;
  }
  if (row.currentRentCold != null && existing.current_rent_cold == null) {
    patch.current_rent_cold = row.currentRentCold;
  }
  if (row.condition !== "unbekannt" && existing.condition === "unbekannt") {
    patch.condition = row.condition;
  }
  // Preisänderung → Preis aktualisieren + Historie fortschreiben
  if (row.price != null && existing.price !== row.price) {
    const history: PriceHistoryEntry[] = Array.isArray(existing.price_history)
      ? (existing.price_history as PriceHistoryEntry[])
      : [];
    patch.price = row.price;
    patch.price_history = [
      ...history,
      { date: new Date().toISOString().slice(0, 10), price: row.price },
    ] as Json;
  }
  return patch;
}

export function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ImmoMetricaRow[]>([]);
  const [parseSkipped, setParseSkipped] = useState(0);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: marketPrices } = useMarketPrices();

  async function handleFile(file: File) {
    const text = await file.text();
    const parsed = parseImmoMetricaCsv(text);
    if (parsed.rows.length === 0) {
      toast.error("Keine verwertbaren Zeilen — ist das der ImmoMetrica-CSV-Export?");
      return;
    }
    setRows(parsed.rows);
    setParseSkipped(parsed.skipped);
    setResult(null);
  }

  async function handleImport() {
    setImporting(true);
    try {
      const supabase = createClient();
      const { data: existingData, error } = await supabase
        .from("properties")
        .select(
          "id, source, source_url, external_id, price, listed_at, street, zip, hausgeld, construction_year, condition, current_rent_cold, price_history"
        );
      if (error) throw error;
      const existing = (existingData ?? []) as ExistingProperty[];

      const byUrl = new Map(existing.filter((e) => e.source_url).map((e) => [e.source_url!, e]));
      const byExtId = new Map(
        existing
          .filter((e) => e.external_id)
          .map((e) => [`${e.source}:${e.external_id}`, e])
      );

      const res: ImportResult = { created: 0, updated: 0, unchanged: 0, skipped: parseSkipped };

      for (const row of rows) {
        const match =
          byUrl.get(row.sourceUrl) ??
          (row.externalId ? byExtId.get(`${row.source}:${row.externalId}`) : undefined);

        if (match) {
          const patch = buildPatch(row, match);
          if (Object.keys(patch).length === 0) {
            res.unchanged++;
            continue;
          }
          const { error: updateError } = await supabase
            .from("properties")
            .update(patch)
            .eq("id", match.id);
          if (updateError) throw updateError;
          res.updated++;
          continue;
        }

        // Neu: als Lead anlegen — Soll-Miete aus Marktmieten, wenn keine Ist-Miete
        const rentPerSqm = marketRent(row.city, marketPrices ?? []);
        const estimatedRent =
          row.currentRentCold == null && rentPerSqm != null && row.livingArea != null
            ? Math.round(rentPerSqm * row.livingArea)
            : null;
        const insert: PropertyInsert = {
          title: row.title,
          street: row.street,
          zip: row.zip,
          city: row.city,
          source: row.source,
          source_url: row.sourceUrl,
          external_id: row.externalId,
          status: "lead",
          listed_at: row.listedAt,
          price: row.price,
          living_area: row.livingArea,
          rooms: row.rooms,
          construction_year: row.constructionYear,
          hausgeld: row.hausgeld,
          current_rent_cold: row.currentRentCold,
          estimated_rent_cold: estimatedRent,
          condition: row.condition,
          price_history: (row.price != null
            ? [{ date: row.listedAt ?? new Date().toISOString().slice(0, 10), price: row.price }]
            : []) as Json,
        };
        const { error: insertError } = await supabase.from("properties").insert(insert);
        if (insertError) throw insertError;
        res.created++;
      }

      setResult(res);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success(
        `Import fertig: ${res.created} neu, ${res.updated} aktualisiert, ${res.unchanged} unverändert`
      );
    } catch (e) {
      toast.error(`Import fehlgeschlagen: ${e instanceof Error ? e.message : "Unbekannt"}`);
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setRows([]);
    setParseSkipped(0);
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="size-3.5" /> Import
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ImmoMetrica-CSV importieren</DialogTitle>
            <DialogDescription>
              Suchergebnis-Export (Export (CSV)) aus ImmoMetrica: neue Treffer landen
              als Leads mit echtem Inseratsdatum, bestehende Objekte werden ergänzt
              (Datum, Adresse, Hausgeld, Preisänderungen → Historie).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-neutral-200"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            {rows.length > 0 && !result && (
              <p className="text-sm text-neutral-600">
                <span className="font-medium">{rows.length} Inserate</span> erkannt
                {parseSkipped > 0 && `, ${parseSkipped} Zeilen ohne Link/Ort übersprungen`}
                {" — "}
                {rows.filter((r) => r.listedAt).length} mit Inseratsdatum.
              </p>
            )}
            {result && (
              <div className="rounded-lg bg-neutral-50 p-3 text-sm">
                <p className="font-medium">Import abgeschlossen</p>
                <ul className="mt-1 space-y-0.5 text-neutral-600">
                  <li>✅ {result.created} neue Leads angelegt</li>
                  <li>🔄 {result.updated} bestehende Objekte ergänzt</li>
                  <li>➖ {result.unchanged} unverändert</li>
                  {result.skipped > 0 && <li>⏭ {result.skipped} Zeilen übersprungen</li>}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {result ? "Schließen" : "Abbrechen"}
            </Button>
            {!result && (
              <Button
                className="bg-green-700 hover:bg-green-800"
                disabled={rows.length === 0 || importing}
                onClick={handleImport}
              >
                {importing ? "Importiere…" : `${rows.length} Inserate importieren`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
