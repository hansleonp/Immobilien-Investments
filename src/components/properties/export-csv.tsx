"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_META, SOURCE_META } from "@/lib/constants";
import type { EnrichedProperty } from "@/types";

/** Deutsche CSV-Konvention: Semikolon-getrennt, Dezimal-Komma, UTF-8 mit BOM */
function csvCell(value: string | number | null | undefined): string {
  if (value == null) return "";
  const s =
    typeof value === "number"
      ? value.toLocaleString("de-DE", { maximumFractionDigits: 2, useGrouping: false })
      : String(value);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const COLUMNS: Array<[string, (r: EnrichedProperty) => string | number | null]> = [
  ["Titel", (r) => r.property.title],
  ["Straße", (r) => r.property.street],
  ["PLZ", (r) => r.property.zip],
  ["Ort", (r) => r.property.city],
  ["Lage", (r) => r.locationClass],
  ["Status", (r) => STATUS_META[r.property.status].label],
  ["Quelle", (r) => SOURCE_META[r.property.source].label],
  ["Inseriert am", (r) => r.property.listed_at],
  ["Preis (€)", (r) => r.property.price],
  ["Fläche (m²)", (r) => r.property.living_area],
  ["Zimmer", (r) => r.property.rooms],
  ["Baujahr", (r) => r.property.construction_year],
  ["Energieklasse", (r) => r.property.energy_class],
  ["Kaltmiete (€)", (r) => r.finance.monthlyRent],
  ["€/m²", (r) => r.finance.pricePerSqm],
  ["Rendite brutto (%)", (r) => r.finance.grossYield],
  ["Rendite effektiv (%)", (r) => r.finance.effectiveYield],
  ["Faktor", (r) => r.finance.purchaseFactor],
  [
    "vs. Markt (%)",
    (r) =>
      r.finance.pricePerSqm != null && r.marketPricePerSqm != null && r.marketPricePerSqm > 0
        ? ((r.finance.pricePerSqm / r.marketPricePerSqm - 1) * 100)
        : null,
  ],
  ["Cashflow (€/Monat)", (r) => r.finance.cashflow],
  ["Max. sinnvoller Kaufpreis (€)", (r) => r.finance.maxReasonablePrice],
  ["Score", (r) => r.score.score],
  ["Link", (r) => r.property.source_url],
  ["Notiz", (r) => r.property.notes],
];

/** Exportiert die aktuell gefilterten Zeilen als CSV-Download (Excel-tauglich) */
export function ExportCsvButton({ rows }: { rows: EnrichedProperty[] }) {
  function handleExport() {
    const header = COLUMNS.map(([label]) => csvCell(label)).join(";");
    const lines = rows.map((r) => COLUMNS.map(([, get]) => csvCell(get(r))).join(";"));
    const csv = "﻿" + [header, ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `immofinder-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={rows.length === 0}>
      <Download className="size-3.5" /> CSV
    </Button>
  );
}
