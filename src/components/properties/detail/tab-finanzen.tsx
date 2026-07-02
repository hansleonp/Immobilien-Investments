"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CashflowValue } from "@/components/properties/badges";
import { useUpdateProperty } from "@/lib/queries/properties";
import { formatEuro, formatEuroCents, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EnrichedProperty } from "@/types";
import type { PropertyRow, SettingsRow } from "@/types/database";

type OverrideField = {
  key: keyof Pick<
    PropertyRow,
    | "equity_percent_override"
    | "interest_rate_override"
    | "repayment_rate_override"
    | "purchase_costs_percent_override"
  >;
  label: string;
  settingsKey: keyof Pick<
    SettingsRow,
    "equity_percent" | "interest_rate" | "repayment_rate" | "purchase_costs_percent"
  >;
  step: string;
};

const OVERRIDE_FIELDS: OverrideField[] = [
  { key: "equity_percent_override", label: "Eigenkapitalquote (%)", settingsKey: "equity_percent", step: "1" },
  { key: "interest_rate_override", label: "Zinssatz (% p.a.)", settingsKey: "interest_rate", step: "0.01" },
  { key: "repayment_rate_override", label: "Tilgung (% p.a.)", settingsKey: "repayment_rate", step: "0.01" },
  { key: "purchase_costs_percent_override", label: "Kaufnebenkosten (%)", settingsKey: "purchase_costs_percent", step: "0.01" },
];

function Row({
  label,
  value,
  indent = false,
  bold = false,
  negative = false,
}: {
  label: string;
  value: React.ReactNode;
  indent?: boolean;
  bold?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-1.5 text-sm",
        bold && "border-t font-semibold",
        indent && "pl-4"
      )}
    >
      <span className={cn(!bold && "text-neutral-500")}>{label}</span>
      <span className={cn("tabular-nums", negative && "text-red-600")}>{value}</span>
    </div>
  );
}

export function TabFinanzen({
  enriched,
  settings,
}: {
  enriched: EnrichedProperty;
  settings: SettingsRow;
}) {
  const { property: p, finance: f } = enriched;
  const update = useUpdateProperty();

  const priceDelta =
    f.maxReasonablePrice != null && p.price != null
      ? f.maxReasonablePrice - p.price
      : null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kauf & Finanzierung</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Kaufpreis" value={formatEuro(f.price)} />
          <Row label={`+ Kaufnebenkosten`} value={formatEuro(f.purchaseCosts)} indent />
          {p.planned_renovation_costs > 0 && (
            <Row label="+ Geplante Sanierung" value={formatEuro(p.planned_renovation_costs)} indent />
          )}
          <Row label="Gesamtkosten" value={formatEuro(f.totalCost)} bold />
          <Row label="− Eigenkapital" value={formatEuro(f.equityAmount)} indent />
          <Row label="Darlehen" value={formatEuro(f.loanAmount)} bold />
          <Row label="Zins (mtl.)" value={formatEuroCents(f.monthlyInterest)} indent />
          <Row label="Tilgung (mtl.)" value={formatEuroCents(f.monthlyRepayment)} indent />
          <Row label="Monatsrate" value={formatEuroCents(f.monthlyRate)} bold />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monatlicher Cashflow</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Kaltmiete" value={formatEuro(f.monthlyRent)} />
          <Row label="− Nicht umlagefähiges Hausgeld" value={formatEuro(f.nonRecoverableMonthly)} indent negative />
          <Row label="− Instandhaltungspuffer" value={formatEuro(f.maintenanceMonthly)} indent negative />
          <Row label="− Monatsrate (Zins + Tilgung)" value={formatEuroCents(f.monthlyRate)} indent negative />
          <Row label="Cashflow" value={<CashflowValue value={f.cashflow} className="text-base" />} bold />

          <div className="mt-4 space-y-1.5 rounded-lg bg-neutral-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Break-even-Kaufpreis (CF = 0)</span>
              <span className="font-medium tabular-nums">{formatEuro(f.breakEvenPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">
                Max. sinnvoller Kaufpreis
                {f.bindingConstraint === "cashflow" && " (Cashflow-Grenze)"}
                {f.bindingConstraint === "rendite" && " (Rendite-Grenze)"}
              </span>
              <span className="font-medium tabular-nums">{formatEuro(f.maxReasonablePrice)}</span>
            </div>
            {priceDelta != null && (
              <div className="flex justify-between border-t pt-1.5">
                <span className="text-neutral-500">vs. Angebotspreis</span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    priceDelta >= 0 ? "text-green-700" : "text-red-600"
                  )}
                >
                  {priceDelta >= 0 ? "+" : "−"}
                  {formatEuro(Math.abs(priceDelta))}
                </span>
              </div>
            )}
            <p className="pt-1 text-xs text-neutral-400">
              Zielrendite {formatPercent(settings.target_yield)} · Mindest-Cashflow{" "}
              {settings.min_cashflow} €/Monat (Einstellungen)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Annahmen für dieses Objekt</CardTitle>
          <CardDescription>
            Leer = globaler Standard aus den Einstellungen. Ein eigener Wert überschreibt
            ihn nur für dieses Objekt.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OVERRIDE_FIELDS.map((field) => (
            <OverrideInput
              key={field.key}
              field={field}
              currentOverride={p[field.key]}
              defaultValue={settings[field.settingsKey]}
              onSave={(value) =>
                update.mutate(
                  { id: p.id, values: { [field.key]: value } },
                  { onSuccess: () => toast.success("Annahme aktualisiert") }
                )
              }
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function OverrideInput({
  field,
  currentOverride,
  defaultValue,
  onSave,
}: {
  field: OverrideField;
  currentOverride: number | null;
  defaultValue: number;
  onSave: (value: number | null) => void;
}) {
  const [value, setValue] = useState(
    currentOverride != null ? String(currentOverride) : ""
  );

  function commit() {
    if (value === "") {
      if (currentOverride != null) onSave(null);
      return;
    }
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return;
    if (n === defaultValue) {
      if (currentOverride != null) onSave(null);
      return;
    }
    if (n !== currentOverride) onSave(n);
  }

  return (
    <div className="space-y-1.5">
      <Label className="flex items-center justify-between">
        {field.label}
        {currentOverride != null && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            title="Auf Standard zurücksetzen"
            onClick={() => {
              setValue("");
              onSave(null);
            }}
          >
            <RotateCcw className="size-3" />
          </Button>
        )}
      </Label>
      <Input
        type="number"
        step={field.step}
        placeholder={`Standard: ${defaultValue}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        className={cn(currentOverride != null && "border-amber-400 bg-amber-50")}
      />
    </div>
  );
}
