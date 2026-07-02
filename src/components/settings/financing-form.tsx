"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSettings } from "@/lib/queries/settings";
import type { SettingsRow } from "@/types/database";

type FinancingValues = Pick<
  SettingsRow,
  | "equity_percent"
  | "interest_rate"
  | "repayment_rate"
  | "purchase_costs_percent"
  | "maintenance_per_sqm"
  | "non_recoverable_per_sqm"
  | "target_yield"
  | "min_cashflow"
>;

const FIELDS: Array<{
  name: keyof FinancingValues;
  label: string;
  unit: string;
  step: string;
  hint?: string;
}> = [
  { name: "equity_percent", label: "Eigenkapitalquote", unit: "%", step: "1" },
  { name: "interest_rate", label: "Zinssatz", unit: "% p.a.", step: "0.01" },
  { name: "repayment_rate", label: "Anfängliche Tilgung", unit: "% p.a.", step: "0.01" },
  {
    name: "purchase_costs_percent",
    label: "Kaufnebenkosten",
    unit: "%",
    step: "0.01",
    hint: "NRW: 6,5 % GrESt + ~2 % Notar/Grundbuch + ggf. 3,57 % Makler",
  },
  {
    name: "maintenance_per_sqm",
    label: "Instandhaltungspuffer",
    unit: "€/m²/Monat",
    step: "0.05",
  },
  {
    name: "non_recoverable_per_sqm",
    label: "Nicht umlagefähiges Hausgeld (Schätzung)",
    unit: "€/m²/Monat",
    step: "0.05",
    hint: "Fallback, wenn beim Objekt kein Wert erfasst ist",
  },
  { name: "target_yield", label: "Zielrendite (brutto)", unit: "%", step: "0.1" },
  { name: "min_cashflow", label: "Mindest-Cashflow", unit: "€/Monat", step: "10" },
];

export function FinancingForm({ settings }: { settings: SettingsRow }) {
  const updateSettings = useUpdateSettings();
  const { register, handleSubmit, reset, formState } = useForm<FinancingValues>({
    defaultValues: settings,
  });

  useEffect(() => {
    reset(settings);
  }, [settings, reset]);

  function onSubmit(values: FinancingValues) {
    updateSettings.mutate(values, {
      onSuccess: () => toast.success("Finanzierungsannahmen gespeichert"),
      onError: () => toast.error("Speichern fehlgeschlagen"),
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Finanzierungsannahmen</CardTitle>
          <CardDescription>
            Standardwerte für alle Objekte — einzelne Immobilien können sie überschreiben.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={field.name}>
                {field.label}{" "}
                <span className="text-xs text-neutral-400">({field.unit})</span>
              </Label>
              <Input
                id={field.name}
                type="number"
                step={field.step}
                {...register(field.name, { valueAsNumber: true, required: true })}
              />
              {field.hint && (
                <p className="text-xs text-neutral-400">{field.hint}</p>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={updateSettings.isPending || !formState.isDirty}
          >
            {updateSettings.isPending ? "Speichern…" : "Speichern"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
