import { z } from "zod";
import type { PropertyInsert, SettingsRow } from "@/types/database";

/** Leere Eingaben und NaN (valueAsNumber bei leerem Feld) → null */
const numOpt = z.preprocess(
  (v) =>
    v === "" || v == null || (typeof v === "number" && Number.isNaN(v))
      ? null
      : Number(v),
  z.number().min(0).nullable()
);

const yearOpt = z.preprocess(
  (v) =>
    v === "" || v == null || (typeof v === "number" && Number.isNaN(v))
      ? null
      : Number(v),
  z.number().int().min(1800).max(2100).nullable()
);

const strOpt = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : null));

export const propertyFormSchema = z.object({
  // Schritt 1: Quelle
  source_url: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\//.test(v), {
      message: "Bitte einen gültigen Link (http/https) einfügen",
    })
    .transform((v) => (v === "" ? null : v)),
  source: z.enum([
    "immoscout24",
    "kleinanzeigen",
    "immowelt",
    "immonet",
    "makler",
    "bank",
    "sonstige",
    "manuell",
  ]),
  image_url: strOpt,

  // Schritt 2: Basisdaten
  title: z.string().trim().min(1, "Bitte einen Titel angeben"),
  listed_at: strOpt, // Inseriert am (YYYY-MM-DD), optional
  street: strOpt,
  zip: strOpt,
  city: z.string().trim().min(1, "Bitte einen Ort angeben"),
  district: strOpt,
  living_area: numOpt,
  rooms: numOpt,
  floor: strOpt,
  construction_year: yearOpt,
  condition: z.enum([
    "erstbezug",
    "saniert",
    "gepflegt",
    "renovierungsbeduerftig",
    "sanierungsbeduerftig",
    "unbekannt",
  ]),
  rental_status: z.enum(["frei", "vermietet", "unbekannt"]),
  energy_class: strOpt,
  contact_name: strOpt,
  contact_phone: strOpt,
  contact_email: strOpt,

  // Schritt 3: Kaufdaten
  price: numOpt,
  purchase_costs_percent: numOpt, // Anzeige-Wert; Override nur bei Abweichung vom Default
  hausgeld: numOpt,
  hausgeld_non_recoverable: numOpt,
  maintenance_monthly: numOpt,
  planned_renovation_costs: numOpt,

  // Schritt 4: Miete
  current_rent_cold: numOpt,
  estimated_rent_cold: numOpt,

  // Schritt 5: Finanzierung
  equity_percent: numOpt,
  interest_rate: numOpt,
  repayment_rate: numOpt,
  fixed_rate_years: numOpt,

  // Schritt 6: Bewertung
  location_rating: z.number().int().min(1).max(5).nullable(),
  rentability_rating: z.number().int().min(1).max(5).nullable(),
  condition_rating: z.number().int().min(1).max(5).nullable(),
  notes: strOpt,
});

export type PropertyFormValues = z.input<typeof propertyFormSchema>;
export type PropertyFormParsed = z.output<typeof propertyFormSchema>;

/** Default-Werte für ein leeres Formular; Finanzierungsfelder mit Settings vorbefüllt */
export function emptyPropertyForm(settings: SettingsRow): PropertyFormValues {
  return {
    source_url: "",
    source: "manuell",
    image_url: "",
    title: "",
    listed_at: "",
    street: "",
    zip: "",
    city: "",
    district: "",
    living_area: null,
    rooms: null,
    floor: "",
    construction_year: null,
    condition: "unbekannt",
    rental_status: "unbekannt",
    energy_class: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    price: null,
    purchase_costs_percent: settings.purchase_costs_percent,
    hausgeld: null,
    hausgeld_non_recoverable: null,
    maintenance_monthly: null,
    planned_renovation_costs: null,
    current_rent_cold: null,
    estimated_rent_cold: null,
    equity_percent: settings.equity_percent,
    interest_rate: settings.interest_rate,
    repayment_rate: settings.repayment_rate,
    fixed_rate_years: null,
    location_rating: null,
    rentability_rating: null,
    condition_rating: null,
    notes: "",
  };
}

/** Wandelt geparste Formularwerte in einen Property-Insert um.
 *  Finanzierungswerte werden nur als Override gespeichert, wenn sie vom Default abweichen. */
export function toPropertyInsert(
  values: PropertyFormParsed,
  settings: SettingsRow,
  extra: { externalId: string | null }
): PropertyInsert {
  const override = (value: number | null, defaultValue: number) =>
    value != null && value !== defaultValue ? value : null;

  return {
    title: values.title,
    listed_at: values.listed_at,
    street: values.street,
    zip: values.zip,
    city: values.city,
    district: values.district,
    source: values.source,
    source_url: values.source_url,
    external_id: extra.externalId,
    image_url: values.image_url,
    price: values.price,
    living_area: values.living_area,
    rooms: values.rooms,
    floor: values.floor,
    construction_year: values.construction_year,
    condition: values.condition,
    energy_class: values.energy_class,
    rental_status: values.rental_status,
    current_rent_cold: values.current_rent_cold,
    estimated_rent_cold: values.estimated_rent_cold,
    hausgeld: values.hausgeld,
    hausgeld_non_recoverable: values.hausgeld_non_recoverable,
    maintenance_monthly: values.maintenance_monthly,
    planned_renovation_costs: values.planned_renovation_costs ?? 0,
    equity_percent_override: override(values.equity_percent, settings.equity_percent),
    interest_rate_override: override(values.interest_rate, settings.interest_rate),
    repayment_rate_override: override(values.repayment_rate, settings.repayment_rate),
    purchase_costs_percent_override: override(
      values.purchase_costs_percent,
      settings.purchase_costs_percent
    ),
    fixed_rate_years: values.fixed_rate_years,
    location_rating: values.location_rating,
    rentability_rating: values.rentability_rating,
    condition_rating: values.condition_rating,
    notes: values.notes,
  };
}
