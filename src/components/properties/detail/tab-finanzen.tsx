"use client";

import { useMemo, useState } from "react";
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
import { CashflowValue, ScoreBadge } from "@/components/properties/badges";
import {
  computeFinance,
  requiredRentForCashflow,
  resolveAssumptions,
  resolveFinanceInput,
  type FinanceInput,
} from "@/lib/finance/calc";
import { computeScore } from "@/lib/finance/score";
import { marketPriceForCity } from "@/lib/finance/enrich";
import { useUpdateProperty } from "@/lib/queries/properties";
import { formatEuro, formatEuroCents, formatFactor, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EnrichedProperty } from "@/types";
import type { MarketPriceRow, PropertyRow, SettingsRow } from "@/types/database";

/** Leere Eingabe / NaN → null (analog Wizard) */
function num(v: unknown): number | null {
  if (v == null || v === "" || (typeof v === "number" && Number.isNaN(v))) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

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
  marketPrices,
}: {
  enriched: EnrichedProperty;
  settings: SettingsRow;
  marketPrices: MarketPriceRow[];
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

      <ScenarioCalculator
        property={p}
        settings={settings}
        marketPrices={marketPrices}
      />
    </div>
  );
}

function ScenarioCalculator({
  property: p,
  settings,
  marketPrices,
}: {
  property: PropertyRow;
  settings: SettingsRow;
  marketPrices: MarketPriceRow[];
}) {
  const update = useUpdateProperty();

  // Ist-Werte als Ausgangspunkt: Preis und effektive Miete (Ist vor Soll)
  const actualPrice = p.price;
  const actualRent = p.current_rent_cold ?? p.estimated_rent_cold;

  const [priceInput, setPriceInput] = useState(
    actualPrice != null ? String(actualPrice) : ""
  );
  const [rentInput, setRentInput] = useState(
    actualRent != null ? String(actualRent) : ""
  );

  const scenarioPrice = num(priceInput);
  const scenarioRent = num(rentInput);

  const { finance, score, requiredRent } = useMemo(() => {
    // Nebenkosten aus dem echten Objekt ableiten (inkl. €/m²-Fallbacks)
    const base = resolveFinanceInput(p, settings);
    const assumptions = resolveAssumptions(p, settings);

    const input: FinanceInput = {
      price: scenarioPrice,
      monthlyRent: scenarioRent,
      nonRecoverableMonthly: base.nonRecoverableMonthly,
      maintenanceMonthly: base.maintenanceMonthly,
      plannedRenovation: base.plannedRenovation,
      livingArea: base.livingArea,
    };

    const finance = computeFinance(input, assumptions);
    const marketPricePerSqm =
      marketPriceForCity(p.city, marketPrices)?.price_per_sqm ?? null;
    const score = computeScore({
      finance,
      ratings: p,
      marketPricePerSqm,
      assumptions,
    });
    const requiredRent = requiredRentForCashflow(
      settings.min_cashflow,
      input,
      assumptions
    );
    return { finance, score, requiredRent };
  }, [p, settings, marketPrices, scenarioPrice, scenarioRent]);

  const priceDelta =
    finance.maxReasonablePrice != null && scenarioPrice != null
      ? finance.maxReasonablePrice - scenarioPrice
      : null;

  // requiredRent kann rechnerisch < 0 sein → für die Anzeige auf 0 clampen
  const requiredRentDisplay = requiredRent != null ? Math.max(0, requiredRent) : null;
  const rentMeetsTarget =
    requiredRent != null && scenarioRent != null && scenarioRent >= requiredRent;

  const isDirty =
    scenarioPrice !== actualPrice || scenarioRent !== actualRent;

  function resetToActual() {
    setPriceInput(actualPrice != null ? String(actualPrice) : "");
    setRentInput(actualRent != null ? String(actualRent) : "");
  }

  function applyScenario() {
    update.mutate(
      {
        id: p.id,
        values: { price: scenarioPrice, current_rent_cold: scenarioRent },
      },
      {
        onSuccess: () => toast.success("Szenario übernommen"),
        onError: () => toast.error("Übernehmen fehlgeschlagen"),
      }
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Szenario-Rechner</CardTitle>
        <CardDescription>
          Kaufpreis und Miete frei durchspielen — die Finanzierungsannahmen des Objekts
          bleiben gleich. Nichts wird gespeichert, bis du „Übernehmen" klickst.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="scenario-price">Kaufpreis (Szenario)</Label>
            <Input
              id="scenario-price"
              type="number"
              step="1000"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scenario-rent">Kaltmiete (Szenario, mtl.)</Label>
            <Input
              id="scenario-rent"
              type="number"
              step="10"
              value={rentInput}
              onChange={(e) => setRentInput(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ScenarioMetric
            label="Cashflow (mtl.)"
            value={<CashflowValue value={finance.cashflow} />}
          />
          <ScenarioMetric label="Bruttorendite" value={formatPercent(finance.grossYield)} />
          <ScenarioMetric label="Kaufpreisfaktor" value={formatFactor(finance.purchaseFactor)} />
          <ScenarioMetric
            label="Score"
            value={<ScoreBadge score={score.score} />}
          />
        </div>

        <div className="space-y-2 rounded-lg bg-neutral-50 p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-neutral-500">
              Max. sinnvoller Kaufpreis bei dieser Miete
              {finance.bindingConstraint === "cashflow" && " (Cashflow-Grenze)"}
              {finance.bindingConstraint === "rendite" && " (Rendite-Grenze)"}
            </span>
            <span className="font-semibold tabular-nums">
              {formatEuro(finance.maxReasonablePrice)}
            </span>
          </div>
          {priceDelta != null && (
            <div className="flex items-center justify-between border-t pt-1.5">
              <span className="text-neutral-500">ggü. Szenario-Preis</span>
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
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-1.5">
            <span className="text-neutral-500">
              Nötige Kaltmiete für Cashflow ≥ {settings.min_cashflow} € bei diesem Kaufpreis
            </span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                rentMeetsTarget ? "text-green-700" : "text-amber-600"
              )}
            >
              {formatEuroCents(requiredRentDisplay)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={resetToActual} disabled={!isDirty}>
            <RotateCcw className="size-4" /> Auf Ist-Werte zurücksetzen
          </Button>
          <Button
            onClick={applyScenario}
            disabled={!isDirty || update.isPending}
            className="bg-green-700 hover:bg-green-800"
          >
            Als Objektwerte übernehmen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ScenarioMetric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-base font-semibold tabular-nums">{value}</div>
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
