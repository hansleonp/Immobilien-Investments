"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Columns3 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { enrichProperty } from "@/lib/finance/enrich";
import { useProperties } from "@/lib/queries/properties";
import { useMarketPrices, useSettings } from "@/lib/queries/settings";
import { propertyColumns, COLUMN_LABELS } from "./property-columns";
import { applyFilters, PropertyFilters, usePropertyFilters } from "./property-filters";
import { ExportCsvButton } from "./export-csv";
import { ImportDialog } from "./import-dialog";
import type { EnrichedProperty } from "@/types";

const COLUMNS_STORAGE_KEY = "immofinder-columns";

/** Standard: diese Spalten sind ausgeblendet, alle übrigen sichtbar */
const DEFAULT_HIDDEN_COLUMNS = [
  "ort",
  "kontaktiert",
  "letzter_kontakt",
  "etage",
  "baujahr",
  "zustand",
  "vermietung",
  "preis_qm",
  "besichtigung",
  "verwerfungsgrund",
  "dokumente",
] as const;

const DEFAULT_VISIBILITY: VisibilityState = Object.fromEntries(
  DEFAULT_HIDDEN_COLUMNS.map((id) => [id, false])
);

export function PropertyTable() {
  const router = useRouter();
  const { data: properties, isLoading: loadingProperties } = useProperties();
  const { data: settings } = useSettings();
  const { data: marketPrices } = useMarketPrices();
  const { filters } = usePropertyFilters();
  const [sorting, setSorting] = useState<SortingState>([{ id: "score", desc: true }]);

  // Spalten-Sichtbarkeit: erst nach Mount aus localStorage laden (kein Hydration-Mismatch)
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(DEFAULT_VISIBILITY);
  const [visibilityLoaded, setVisibilityLoaded] = useState(false);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (stored) {
        setColumnVisibility({ ...DEFAULT_VISIBILITY, ...JSON.parse(stored) });
      }
    } catch {
      // defekter Eintrag → Defaults behalten
    }
    setVisibilityLoaded(true);
  }, []);
  useEffect(() => {
    if (!visibilityLoaded) return;
    try {
      window.localStorage.setItem(
        COLUMNS_STORAGE_KEY,
        JSON.stringify(columnVisibility)
      );
    } catch {
      // Speichern ist Komfort, kein Muss
    }
  }, [columnVisibility, visibilityLoaded]);

  // Alle enriched Rows (inkl. inaktiver — das Ausblenden übernimmt der Filter)
  const allRows: EnrichedProperty[] = useMemo(() => {
    if (!properties || !settings) return [];
    return properties.map((p) => enrichProperty(p, settings, marketPrices ?? []));
  }, [properties, settings, marketPrices]);

  const cityOptions = useMemo(
    () =>
      Array.from(new Set(allRows.map((r) => r.property.city).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, "de")
      ),
    [allRows]
  );

  const rows = useMemo(() => applyFilters(allRows, filters), [allRows, filters]);

  const leadCount = useMemo(
    () => allRows.filter((r) => r.property.status === "lead").length,
    [allRows]
  );

  const table = useReactTable({
    data: rows,
    columns: propertyColumns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loadingProperties || !settings) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (allRows.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-white">
        <p className="text-sm text-neutral-500">
          Noch keine Immobilien erfasst.
        </p>
        <Button
          className="bg-green-700 hover:bg-green-800"
          render={<Link href="/immobilien/neu" />}
        >
          + Erste Immobilie hinzufügen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PropertyFilters cityOptions={cityOptions} leadCount={leadCount} />
        <div className="flex items-center gap-2">
          <ImportDialog />
          <ExportCsvButton rows={rows} />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              <Columns3 className="size-3.5" /> Spalten
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 min-w-52 overflow-y-auto">
              <DropdownMenuLabel>Sichtbare Spalten</DropdownMenuLabel>
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) => column.toggleVisibility(checked)}
                  >
                    {COLUMN_LABELS[column.id] ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-white">
          <p className="text-sm text-neutral-500">
            Keine Immobilien entsprechen den aktiven Filtern.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none whitespace-nowrap text-xs"
                          : "select-none whitespace-nowrap text-xs"
                      }
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" && <ArrowUp className="size-3" />}
                        {header.column.getIsSorted() === "desc" && <ArrowDown className="size-3" />}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.original.property.id}
                  onClick={() => router.push(`/immobilien/${row.original.property.id}`)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="border-t px-4 py-2 text-xs text-neutral-500">
            {rows.length} {rows.length === 1 ? "Ergebnis" : "Ergebnisse"}
            {rows.length !== allRows.length && ` (von ${allRows.length})`}
          </div>
        </div>
      )}
    </div>
  );
}
