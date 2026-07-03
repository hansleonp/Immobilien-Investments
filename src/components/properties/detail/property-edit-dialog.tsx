"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONDITION_META,
  CONDITIONS,
  RENTAL_STATUS_META,
} from "@/lib/constants";
import { useUpdateProperty } from "@/lib/queries/properties";
import type { PropertyCondition, PropertyInsert, PropertyRow, RentalStatus } from "@/types/database";

/** Leere Eingabe / NaN → null (analog validation/property.ts) */
function num(v: unknown): number | null {
  if (v == null || v === "" || (typeof v === "number" && Number.isNaN(v))) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/** Formularwerte: Text bleibt String, Zahlen kommen als string|number aus dem Input */
interface EditFormValues {
  title: string;
  street: string;
  zip: string;
  city: string;
  floor: string;
  rooms: number | string;
  living_area: number | string;
  construction_year: number | string;
  condition: PropertyCondition;
  rental_status: RentalStatus;
  price: number | string;
  hausgeld: number | string;
  hausgeld_non_recoverable: number | string;
  maintenance_monthly: number | string;
  planned_renovation_costs: number | string;
  current_rent_cold: number | string;
  estimated_rent_cold: number | string;
}

function defaultsFrom(p: PropertyRow): EditFormValues {
  const str = (v: string | null) => v ?? "";
  const n = (v: number | null) => (v == null ? "" : v);
  return {
    title: p.title,
    street: str(p.street),
    zip: str(p.zip),
    city: p.city,
    floor: str(p.floor),
    rooms: n(p.rooms),
    living_area: n(p.living_area),
    construction_year: n(p.construction_year),
    condition: p.condition,
    rental_status: p.rental_status,
    price: n(p.price),
    hausgeld: n(p.hausgeld),
    hausgeld_non_recoverable: n(p.hausgeld_non_recoverable),
    maintenance_monthly: n(p.maintenance_monthly),
    planned_renovation_costs: p.planned_renovation_costs === 0 ? "" : p.planned_renovation_costs,
    current_rent_cold: n(p.current_rent_cold),
    estimated_rent_cold: n(p.estimated_rent_cold),
  };
}

export function PropertyEditDialog({
  property,
  open,
  onOpenChange,
}: {
  property: PropertyRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateProperty();
  const { register, handleSubmit, reset, setValue, watch, formState } =
    useForm<EditFormValues>({ defaultValues: defaultsFrom(property) });

  // Formular an das aktuelle Objekt angleichen, wenn der Dialog geöffnet wird
  useEffect(() => {
    if (open) reset(defaultsFrom(property));
  }, [open, property, reset]);

  const condition = watch("condition");
  const rentalStatus = watch("rental_status");

  function onSubmit(values: EditFormValues) {
    const title = values.title.trim();
    if (!title) {
      toast.error("Bitte einen Titel angeben");
      return;
    }
    const str = (v: string) => (v.trim() === "" ? null : v.trim());
    const editable: Partial<PropertyInsert> = {
      title,
      street: str(values.street),
      zip: str(values.zip),
      city: values.city.trim() || property.city,
      floor: str(values.floor),
      rooms: num(values.rooms),
      living_area: num(values.living_area),
      construction_year: num(values.construction_year),
      condition: values.condition,
      rental_status: values.rental_status,
      price: num(values.price),
      hausgeld: num(values.hausgeld),
      hausgeld_non_recoverable: num(values.hausgeld_non_recoverable),
      maintenance_monthly: num(values.maintenance_monthly),
      planned_renovation_costs: num(values.planned_renovation_costs) ?? 0,
      current_rent_cold: num(values.current_rent_cold),
      estimated_rent_cold: num(values.estimated_rent_cold),
    };

    update.mutate(
      { id: property.id, values: editable },
      {
        onSuccess: () => {
          toast.success("Objektdaten gespeichert");
          onOpenChange(false);
        },
        onError: () => toast.error("Speichern fehlgeschlagen"),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Objektdaten bearbeiten</DialogTitle>
          <DialogDescription>
            Kaufpreis, Miete, Fläche und weitere Stammdaten anpassen. Kennzahlen und
            Score werden anschließend neu berechnet.
          </DialogDescription>
        </DialogHeader>

        <form
          id="property-edit-form"
          onSubmit={handleSubmit(onSubmit)}
          className="max-h-[65vh] space-y-6 overflow-y-auto pr-1"
        >
          <Section title="Basisdaten">
            <div className="sm:col-span-2">
              <Field label="Titel / Objektname">
                <Input {...register("title")} placeholder="z. B. Whg. 2. OG links" />
              </Field>
            </div>
            <Field label="Straße + Hausnummer">
              <Input {...register("street")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="PLZ">
                <Input {...register("zip")} />
              </Field>
              <Field label="Ort">
                <Input {...register("city")} />
              </Field>
            </div>
            <Field label="Etage">
              <Input {...register("floor")} placeholder="z. B. 2. OG" />
            </Field>
            <Field label="Zimmer">
              <Input type="number" step="0.5" {...register("rooms")} />
            </Field>
            <Field label="Wohnfläche (m²)">
              <Input type="number" step="0.5" {...register("living_area")} />
            </Field>
            <Field label="Baujahr">
              <Input type="number" step="1" {...register("construction_year")} />
            </Field>
            <Field label="Zustand">
              <Select
                value={condition}
                onValueChange={(v) => setValue("condition", v as PropertyCondition)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CONDITION_META[c].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Vermietungsstatus">
              <Select
                value={rentalStatus}
                onValueChange={(v) => setValue("rental_status", v as RentalStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["frei", "vermietet", "unbekannt"] as const).map((s) => (
                    <SelectItem key={s} value={s}>
                      {RENTAL_STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </Section>

          <Section title="Kaufdaten">
            <Field label="Kaufpreis (€)">
              <Input type="number" step="1000" {...register("price")} />
            </Field>
            <Field label="Hausgeld gesamt (€/Monat)">
              <Input type="number" step="10" {...register("hausgeld")} />
            </Field>
            <Field label="davon nicht umlagefähig (€/Monat)">
              <Input type="number" step="5" {...register("hausgeld_non_recoverable")} />
            </Field>
            <Field label="Instandhaltungspuffer (€/Monat)">
              <Input type="number" step="5" {...register("maintenance_monthly")} />
            </Field>
            <Field label="Geplante Sanierung (€ einmalig)">
              <Input type="number" step="1000" {...register("planned_renovation_costs")} />
            </Field>
          </Section>

          <Section title="Miete">
            <Field label="Ist-Kaltmiete (€/Monat)">
              <Input type="number" step="10" {...register("current_rent_cold")} />
            </Field>
            <Field label="Soll-/Marktkaltmiete (€/Monat)">
              <Input type="number" step="10" {...register("estimated_rent_cold")} />
            </Field>
          </Section>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            type="submit"
            form="property-edit-form"
            disabled={update.isPending || !formState.isDirty}
            className="bg-green-700 hover:bg-green-800"
          >
            {update.isPending ? "Speichern…" : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-neutral-700">{title}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
