"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
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
import Link from "next/link";
import { enrichProperty } from "@/lib/finance/enrich";
import { useProperties } from "@/lib/queries/properties";
import { useMarketPrices, useSettings } from "@/lib/queries/settings";
import { INACTIVE_STATUSES } from "@/lib/constants";
import { propertyColumns } from "./property-columns";
import type { EnrichedProperty } from "@/types";

export function PropertyTable({ showInactive = false }: { showInactive?: boolean }) {
  const router = useRouter();
  const { data: properties, isLoading: loadingProperties } = useProperties();
  const { data: settings } = useSettings();
  const { data: marketPrices } = useMarketPrices();
  const [sorting, setSorting] = useState<SortingState>([{ id: "score", desc: true }]);

  const rows: EnrichedProperty[] = useMemo(() => {
    if (!properties || !settings) return [];
    return properties
      .filter((p) => showInactive || !INACTIVE_STATUSES.includes(p.status))
      .map((p) => enrichProperty(p, settings, marketPrices ?? []));
  }, [properties, settings, marketPrices, showInactive]);

  const table = useReactTable({
    data: rows,
    columns: propertyColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loadingProperties || !settings) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (rows.length === 0) {
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
    <div className="overflow-x-auto rounded-lg border bg-white">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer select-none whitespace-nowrap text-xs"
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
      </div>
    </div>
  );
}
