"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, Check, ExternalLink, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CashflowValue, ScoreBadge } from "@/components/properties/badges";
import { RatingStars } from "@/components/properties/rating-stars";

import {
  computeFinance,
  type Assumptions,
  type FinanceInput,
} from "@/lib/finance/calc";
import { computeScore } from "@/lib/finance/score";
import { marketPriceForCity } from "@/lib/finance/enrich";
import type { ExposeExtraction } from "@/lib/ai/schemas";
import type { ExtractedListingData } from "@/lib/link-import/extract";
import { extractFromPlainText } from "@/lib/link-import/text-extract";
import { detectSource, extractExternalId } from "@/lib/link-import/sources";
import { findDuplicate, useCreateProperty } from "@/lib/queries/properties";
import { useMarketPrices, useSettings } from "@/lib/queries/settings";
import {
  emptyPropertyForm,
  propertyFormSchema,
  toPropertyInsert,
  type PropertyFormParsed,
  type PropertyFormValues,
} from "@/lib/validation/property";
import {
  CONDITION_META,
  CONDITIONS,
  KNOWN_CITIES,
  RENTAL_STATUS_META,
  SOURCE_META,
  SOURCES,
} from "@/lib/constants";
import { formatEuro, formatEuroCents, formatFactor, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  MarketPriceRow,
  PropertyRow,
  PropertySource,
  SettingsRow,
} from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";

const DRAFT_KEY = "immofinder-wizard-draft";

interface LinkImportResult {
  source: PropertySource;
  externalId: string | null;
  blocked: boolean;
  data: ExtractedListingData;
}

/** Mapping API-Felder → Formularfelder (nur leere Felder werden befüllt) */
const IMPORT_FIELD_MAP: Array<[keyof ExtractedListingData, keyof PropertyFormValues, string]> = [
  ["title", "title", "Titel"],
  ["price", "price", "Preis"],
  ["livingArea", "living_area", "Fläche"],
  ["rooms", "rooms", "Zimmer"],
  ["street", "street", "Straße"],
  ["zip", "zip", "PLZ"],
  ["city", "city", "Ort"],
  ["imageUrl", "image_url", "Bild"],
];

/** Mapping Exposé-Extraktion (KI) → Formularfelder (nur leere Felder werden befüllt) */
const EXPOSE_FIELD_MAP: Array<[keyof ExposeExtraction, keyof PropertyFormValues, string]> = [
  ["title", "title", "Titel"],
  ["price", "price", "Preis"],
  ["living_area", "living_area", "Fläche"],
  ["rooms", "rooms", "Zimmer"],
  ["street", "street", "Straße"],
  ["zip", "zip", "PLZ"],
  ["city", "city", "Ort"],
  ["floor", "floor", "Etage"],
  ["construction_year", "construction_year", "Baujahr"],
  ["condition", "condition", "Zustand"],
  ["rental_status", "rental_status", "Vermietungsstatus"],
  ["current_rent_cold", "current_rent_cold", "Kaltmiete"],
  ["hausgeld", "hausgeld", "Hausgeld"],
  ["hausgeld_non_recoverable", "hausgeld_non_recoverable", "Nicht umlagefähig"],
  ["energy_class", "energy_class", "Energieklasse"],
];

const STEPS: Array<{ title: string; fields: Array<keyof PropertyFormValues> }> = [
  { title: "Quelle", fields: ["source_url", "source"] },
  {
    title: "Basisdaten",
    fields: ["title", "city", "living_area", "rooms", "construction_year"],
  },
  { title: "Kaufdaten", fields: ["price", "purchase_costs_percent", "hausgeld"] },
  { title: "Miete", fields: ["current_rent_cold", "estimated_rent_cold"] },
  { title: "Finanzierung", fields: ["equity_percent", "interest_rate", "repayment_rate"] },
  { title: "Bewertung", fields: [] },
];

// ---------- kleine Feld-Helfer ----------

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function NumField({
  name,
  label,
  unit,
  step = "1",
  placeholder,
  hint,
}: {
  name: keyof PropertyFormValues;
  label: string;
  unit?: string;
  step?: string;
  placeholder?: string;
  hint?: string;
}) {
  const { register, formState } = useFormContext<PropertyFormValues>();
  const error = formState.errors[name];
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label} {unit && <span className="text-xs text-neutral-400">({unit})</span>}
      </Label>
      <Input
        id={name}
        type="number"
        step={step}
        placeholder={placeholder}
        {...register(name, { valueAsNumber: true })}
      />
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
      {error && <p className="text-xs text-red-600">{String(error.message)}</p>}
    </div>
  );
}

function TextField({
  name,
  label,
  placeholder,
}: {
  name: keyof PropertyFormValues;
  label: string;
  placeholder?: string;
}) {
  const { register, formState } = useFormContext<PropertyFormValues>();
  const error = formState.errors[name];
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} placeholder={placeholder} {...register(name)} />
      {error && <p className="text-xs text-red-600">{String(error.message)}</p>}
    </div>
  );
}

function SelectField({
  name,
  label,
  options,
}: {
  name: keyof PropertyFormValues;
  label: string;
  options: Array<{ value: string; label: string }>;
}) {
  const { setValue, watch } = useFormContext<PropertyFormValues>();
  const value = watch(name) as string;
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select
        value={value}
        onValueChange={(v) =>
          setValue(name, v as never, { shouldDirty: true, shouldValidate: true })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ---------- Schritt 6: Live-Bewertung ----------

function EvaluationPanel({
  settings,
  marketPrices,
}: {
  settings: SettingsRow;
  marketPrices: MarketPriceRow[];
}) {
  const { control, setValue } = useFormContext<PropertyFormValues>();
  const w = useWatch({ control });

  const { finance, score, assumptions } = useMemo(() => {
    const area = num(w.living_area);
    const monthlyRent = num(w.current_rent_cold) ?? num(w.estimated_rent_cold);
    const input: FinanceInput = {
      price: num(w.price),
      monthlyRent,
      nonRecoverableMonthly:
        num(w.hausgeld_non_recoverable) ??
        (area != null ? settings.non_recoverable_per_sqm * area : null),
      maintenanceMonthly:
        num(w.maintenance_monthly) ??
        (area != null ? settings.maintenance_per_sqm * area : null),
      plannedRenovation: num(w.planned_renovation_costs) ?? 0,
      livingArea: area,
    };
    const assumptions: Assumptions = {
      equityPercent: num(w.equity_percent) ?? settings.equity_percent,
      interestRate: num(w.interest_rate) ?? settings.interest_rate,
      repaymentRate: num(w.repayment_rate) ?? settings.repayment_rate,
      purchaseCostsPercent:
        num(w.purchase_costs_percent) ?? settings.purchase_costs_percent,
      targetYield: settings.target_yield,
      minCashflow: settings.min_cashflow,
    };
    const finance = computeFinance(input, assumptions);
    const score = computeScore({
      finance,
      ratings: {
        location_rating: w.location_rating ?? null,
        rentability_rating: w.rentability_rating ?? null,
        condition_rating: w.condition_rating ?? null,
      },
      marketPricePerSqm:
        w.city != null
          ? (marketPriceForCity(w.city, marketPrices)?.price_per_sqm ?? null)
          : null,
      assumptions,
    });
    return { finance, score, assumptions };
  }, [w, settings, marketPrices]);

  const recommendation =
    score.recommendation === "interessant"
      ? { label: "Interessant — weiterverfolgen", cls: "bg-green-50 text-green-800 border-green-200" }
      : score.recommendation === "beobachten"
        ? { label: "Beobachten", cls: "bg-amber-50 text-amber-800 border-amber-200" }
        : score.recommendation === "ablehnen"
          ? { label: "Ablehnen", cls: "bg-red-50 text-red-800 border-red-200" }
          : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <ScoreBadge score={score.score} size="lg" />
        {recommendation && (
          <div className={cn("rounded-lg border px-4 py-2 text-sm font-medium", recommendation.cls)}>
            Empfehlung: {recommendation.label}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Bruttorendite" value={formatPercent(finance.grossYield)} />
        <Metric label="Kaufpreisfaktor" value={formatFactor(finance.purchaseFactor)} />
        <Metric
          label="Cashflow (mtl.)"
          value={<CashflowValue value={finance.cashflow} />}
        />
        <Metric label="Monatsrate" value={formatEuroCents(finance.monthlyRate)} />
        <Metric label="Darlehen" value={formatEuro(finance.loanAmount)} />
        <Metric label="Eigenkapital" value={formatEuro(finance.equityAmount)} />
        <Metric
          label="Max. sinnvoller Kaufpreis"
          value={formatEuro(finance.maxReasonablePrice)}
          hint={
            finance.bindingConstraint === "cashflow"
              ? `begrenzt durch Mindest-Cashflow (${settings.min_cashflow} €)`
              : finance.bindingConstraint === "rendite"
                ? `begrenzt durch Zielrendite (${assumptions.targetYield} %)`
                : undefined
          }
        />
        <Metric label="Break-even-Kaufpreis" value={formatEuro(finance.breakEvenPrice)} />
      </div>

      <div className="space-y-2 rounded-lg border bg-white p-4">
        <p className="mb-2 text-sm font-medium">Score-Aufschlüsselung</p>
        {score.breakdown.map((c) => (
          <div key={c.key} className="flex items-center gap-3 text-sm">
            <span className="w-32 text-neutral-500">{c.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
              {c.value != null && (
                <div
                  className={cn(
                    "h-full rounded-full",
                    c.value >= 70 ? "bg-green-500" : c.value >= 40 ? "bg-amber-400" : "bg-red-400"
                  )}
                  style={{ width: `${c.value}%` }}
                />
              )}
            </div>
            <span className="w-16 text-right tabular-nums text-neutral-500">
              {c.value != null ? `${Math.round(c.value)} · ${c.weight}%` : "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-lg border bg-white p-4">
        <p className="text-sm font-medium">Manuelle Einschätzung (optional, fließt in den Score ein)</p>
        <RatingStars
          label="Lage"
          value={w.location_rating ?? null}
          onChange={(v) => setValue("location_rating", v, { shouldDirty: true })}
        />
        <RatingStars
          label="Vermietbarkeit"
          value={w.rentability_rating ?? null}
          onChange={(v) => setValue("rentability_rating", v, { shouldDirty: true })}
        />
        <RatingStars
          label="Zustand/Risiko"
          value={w.condition_rating ?? null}
          onChange={(v) => setValue("condition_rating", v, { shouldDirty: true })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notiz</Label>
        <Textarea id="notes" rows={3} placeholder="Erster Eindruck, Besonderheiten…" {...useFormContext<PropertyFormValues>().register("notes")} />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-0.5 text-base font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-neutral-400">{hint}</div>}
    </div>
  );
}

// ---------- Wizard-Shell ----------

export function PropertyWizard() {
  const { data: settings } = useSettings();
  const { data: marketPrices } = useMarketPrices();

  if (!settings) {
    return <Skeleton className="h-96 w-full max-w-3xl" />;
  }
  return <WizardForm settings={settings} marketPrices={marketPrices ?? []} />;
}

function loadDraft(): PropertyFormValues | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as PropertyFormValues) : null;
  } catch {
    return null;
  }
}

/** Prefill aus Query-Params: ?url=… (Link) oder ?prefill=<base64url-JSON> (Extension/Posteingang) */
function applyPrefill(
  base: PropertyFormValues,
  searchParams: URLSearchParams
): PropertyFormValues {
  const result = { ...base };
  const url = searchParams.get("url");
  if (url) {
    result.source_url = url;
    result.source = detectSource(url);
  }
  const prefill = searchParams.get("prefill");
  if (prefill) {
    try {
      const base64 = prefill.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const decoded = JSON.parse(
        new TextDecoder().decode(
          Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
        )
      ) as Partial<PropertyFormValues>;
      Object.assign(result, decoded);
      if (result.source_url && (!prefill || !decoded.source)) {
        result.source = detectSource(result.source_url);
      }
    } catch {
      // ungültiges Prefill ignorieren
    }
  }
  return result;
}

function WizardForm({
  settings,
  marketPrices,
}: {
  settings: SettingsRow;
  marketPrices: MarketPriceRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createProperty = useCreateProperty();
  const [step, setStep] = useState(0);
  const [duplicate, setDuplicate] = useState<Pick<
    PropertyRow,
    "id" | "title" | "status"
  > | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<LinkImportResult | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [exposeFields, setExposeFields] = useState<string[] | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [pasteFound, setPasteFound] = useState<string[] | null>(null);
  const [exposeNeedsKey, setExposeNeedsKey] = useState(false);

  const form = useForm<PropertyFormValues, unknown, PropertyFormParsed>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues:
      loadDraft() ??
      applyPrefill(emptyPropertyForm(settings), new URLSearchParams(searchParams)),
    mode: "onBlur",
  });

  // Entwurf fortlaufend sichern
  useEffect(() => {
    const sub = form.watch((values) => {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {
        // Speicher voll o. ä. — Entwurf ist nice-to-have
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  // Quelle automatisch aus dem Link erkennen
  const sourceUrl = form.watch("source_url");
  useEffect(() => {
    if (sourceUrl && /^https?:\/\//.test(sourceUrl)) {
      const detected = detectSource(sourceUrl);
      if (detected !== "sonstige") form.setValue("source", detected);
    }
  }, [sourceUrl, form]);

  async function handleLinkImport() {
    const url = form.getValues("source_url");
    if (!url || !/^https?:\/\//.test(url) || importing) return;
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/link-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = (await res.json()) as LinkImportResult;

      const isEmpty = (v: unknown) =>
        v == null || v === "" || (typeof v === "number" && Number.isNaN(v));

      for (const [from, to] of IMPORT_FIELD_MAP) {
        const value = result.data[from];
        if (value !== undefined && isEmpty(form.getValues(to))) {
          form.setValue(to, value as never, { shouldDirty: true });
        }
      }
      setImportResult(result);
    } catch {
      toast.error("Auslesen fehlgeschlagen — bitte Verbindung prüfen und erneut versuchen.");
    } finally {
      setImporting(false);
    }
  }

  function handlePasteExtract() {
    if (!pasteText.trim()) return;
    const data = extractFromPlainText(pasteText);
    const isEmpty = (v: unknown) =>
      v == null || v === "" || (typeof v === "number" && Number.isNaN(v));
    const mapping: Array<[unknown, keyof PropertyFormValues, string]> = [
      [data.title, "title", "Titel"],
      [data.price, "price", "Preis"],
      [data.livingArea, "living_area", "Fläche"],
      [data.rooms, "rooms", "Zimmer"],
      [data.street, "street", "Straße"],
      [data.zip, "zip", "PLZ"],
      [data.city, "city", "Ort"],
      [data.floor, "floor", "Etage"],
      [data.constructionYear, "construction_year", "Baujahr"],
      [data.hausgeld, "hausgeld", "Hausgeld"],
      [data.currentRentCold, "current_rent_cold", "Kaltmiete"],
    ];
    const found: string[] = [];
    for (const [value, to, label] of mapping) {
      if (value == null) continue;
      found.push(label);
      if (isEmpty(form.getValues(to))) {
        form.setValue(to, value as never, { shouldDirty: true });
      }
    }
    setPasteFound(found);
    if (found.length === 0) {
      toast.info("Im eingefügten Text wurden keine Daten erkannt.");
    }
  }

  async function handleExposeExtract() {
    if (!pdfFile || extracting) return;
    setExtracting(true);
    setExposeFields(null);
    setExposeNeedsKey(false);
    try {
      const fd = new FormData();
      fd.append("file", pdfFile);
      const res = await fetch("/api/ai/expose", { method: "POST", body: fd });
      if (res.status === 503) {
        setExposeNeedsKey(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { data } = (await res.json()) as { data: ExposeExtraction };

      // "unbekannt" bei Selects gilt als leer (Default-Wert)
      const isEmpty = (v: unknown) =>
        v == null ||
        v === "" ||
        v === "unbekannt" ||
        (typeof v === "number" && Number.isNaN(v));

      const found: string[] = [];
      for (const [from, to, label] of EXPOSE_FIELD_MAP) {
        const value = data[from];
        if (value == null || value === "unbekannt") continue;
        found.push(label);
        if (isEmpty(form.getValues(to))) {
          form.setValue(to, value as never, { shouldDirty: true });
        }
      }
      setExposeFields(found);
    } catch {
      toast.error("Exposé-Auslesen fehlgeschlagen — bitte erneut versuchen.");
    } finally {
      setExtracting(false);
    }
  }

  async function checkForDuplicate() {
    const url = form.getValues("source_url");
    const source = form.getValues("source");
    if (!url) {
      setDuplicate(null);
      return;
    }
    const externalId = extractExternalId(url, source);
    const existing = await findDuplicate({ sourceUrl: url, source, externalId });
    setDuplicate(existing);
  }

  async function goNext() {
    const valid = await form.trigger(STEPS[step].fields as never[]);
    if (!valid) return;
    if (step === 0) await checkForDuplicate();
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function onSubmit(values: PropertyFormParsed) {
    const externalId = values.source_url
      ? extractExternalId(values.source_url, values.source)
      : null;
    const property = toPropertyInsert(values, settings, { externalId });
    const contact = values.contact_name
      ? {
          name: values.contact_name,
          phone: values.contact_phone,
          email: values.contact_email,
          platform: values.source !== "manuell" ? SOURCE_META[values.source].label : null,
        }
      : null;

    createProperty.mutate(
      { property, contact },
      {
        onSuccess: (row) => {
          sessionStorage.removeItem(DRAFT_KEY);
          toast.success("Immobilie angelegt");
          router.push(`/immobilien/${row.id}`);
        },
        onError: (e) =>
          toast.error(
            e.message.includes("duplicate")
              ? "Dieses Inserat existiert bereits (gleiche Quelle + Inserats-ID)."
              : "Speichern fehlgeschlagen"
          ),
      }
    );
  }

  const cityOptions = useMemo(() => {
    const fromMarket = marketPrices.map((m) => m.city);
    return Array.from(new Set([...KNOWN_CITIES, ...fromMarket]));
  }, [marketPrices]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl">
        {/* Stepper */}
        <div className="mb-6 flex items-center gap-1 overflow-x-auto">
          {STEPS.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                i === step
                  ? "bg-green-700 text-white"
                  : i < step
                    ? "bg-green-100 text-green-800"
                    : "bg-neutral-100 text-neutral-400"
              )}
            >
              {i < step ? <Check className="size-3" /> : <span>{i + 1}</span>}
              {s.title}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === 0 && (
              <div className="space-y-4">
                <TextField
                  name="source_url"
                  label="Inserats-Link"
                  placeholder="https://www.immobilienscout24.de/expose/…"
                />
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLinkImport}
                    disabled={!(sourceUrl && /^https?:\/\//.test(sourceUrl)) || importing}
                  >
                    {importing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {importing ? "Wird ausgelesen…" : "Daten auslesen"}
                  </Button>
                </div>
                {importResult?.blocked && (
                  <>
                    <Alert className="border-amber-300 bg-amber-50">
                      <AlertTriangle className="size-4 text-amber-600" />
                      <AlertTitle>Automatisches Auslesen blockiert</AlertTitle>
                      <AlertDescription>
                        Diese Seite blockiert Server-Abrufe (bei ImmoScout24 üblich).
                        Kein Problem: Entweder auf der Inseratsseite den Knopf der
                        Chrome-Erweiterung nutzen — oder unten den Seiteninhalt
                        einfügen.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2 rounded-lg border bg-white p-3">
                      <Label htmlFor="paste-text">
                        Seiteninhalt einfügen{" "}
                        <span className="font-normal text-neutral-400">
                          (auf der Inseratsseite Strg/Cmd+A, kopieren, hier einfügen)
                        </span>
                      </Label>
                      <Textarea
                        id="paste-text"
                        rows={4}
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder="Kompletten Seitentext hier einfügen…"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePasteExtract}
                          disabled={!pasteText.trim()}
                        >
                          <Sparkles className="size-3.5" /> Aus Text übernehmen
                        </Button>
                        {pasteFound && pasteFound.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {pasteFound.map((label) => (
                              <Badge key={label} variant="secondary" className="font-normal">
                                {label} ✓
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {importResult && !importResult.blocked && (
                  Object.keys(importResult.data).length > 0 ? (
                    <div className="flex items-start gap-3 rounded-lg border bg-white p-3">
                      {importResult.data.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={importResult.data.imageUrl}
                          alt=""
                          className="size-16 shrink-0 rounded-md object-cover"
                        />
                      )}
                      <div className="min-w-0 space-y-1.5">
                        <p className="truncate text-sm font-medium">
                          {importResult.data.title ?? "Daten gefunden"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {IMPORT_FIELD_MAP.filter(
                            ([from]) => importResult.data[from] !== undefined
                          ).map(([from, , label]) => (
                            <Badge key={from} variant="secondary" className="font-normal">
                              {label} ✓
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-neutral-400">
                          Gefundene Werte wurden in leere Felder übernommen — bitte in
                          den nächsten Schritten prüfen.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      Keine auslesbaren Daten gefunden — bitte die Felder in den
                      nächsten Schritten manuell ausfüllen.
                    </p>
                  )
                )}
                <div className="space-y-3 border-t pt-4">
                  <Label htmlFor="expose-pdf">Oder Exposé-PDF hochladen</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="expose-pdf"
                      type="file"
                      accept="application/pdf,.pdf"
                      className="max-w-xs"
                      onChange={(e) => {
                        setPdfFile(e.target.files?.[0] ?? null);
                        setExposeFields(null);
                        setExposeNeedsKey(false);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleExposeExtract}
                      disabled={!pdfFile || extracting}
                    >
                      {extracting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      {extracting ? "Wird ausgelesen…" : "Exposé auslesen"}
                    </Button>
                  </div>
                  {exposeNeedsKey && (
                    <Alert className="border-amber-300 bg-amber-50">
                      <AlertTriangle className="size-4 text-amber-600" />
                      <AlertTitle>
                        KI-Auslesen benötigt einen Anthropic-API-Key
                      </AlertTitle>
                      <AlertDescription>
                        Einrichtung: API-Key auf console.anthropic.com erstellen
                        und als ANTHROPIC_API_KEY in .env.local (lokal) bzw. in den
                        Vercel-Umgebungsvariablen hinterlegen, dann neu starten.
                      </AlertDescription>
                    </Alert>
                  )}
                  {exposeFields &&
                    (exposeFields.length > 0 ? (
                      <div className="space-y-1.5 rounded-lg border bg-white p-3">
                        <div className="flex flex-wrap gap-1">
                          {exposeFields.map((label) => (
                            <Badge key={label} variant="secondary" className="font-normal">
                              {label} ✓
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-neutral-400">
                          Gefundene Werte wurden in leere Felder übernommen — bitte in
                          den nächsten Schritten prüfen.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500">
                        Keine auslesbaren Daten im PDF gefunden — bitte die Felder
                        manuell ausfüllen.
                      </p>
                    ))}
                </div>
                <SelectField
                  name="source"
                  label="Quelle"
                  options={SOURCES.map((s) => ({ value: s, label: SOURCE_META[s].label }))}
                />
                {duplicate && (
                  <Alert className="border-amber-300 bg-amber-50">
                    <AlertTriangle className="size-4 text-amber-600" />
                    <AlertTitle>Bereits vorhanden</AlertTitle>
                    <AlertDescription>
                      Dieses Inserat ist schon erfasst: „{duplicate.title}“.{" "}
                      <Link
                        href={`/immobilien/${duplicate.id}`}
                        className="font-medium underline"
                      >
                        Objekt öffnen
                      </Link>{" "}
                      — oder trotzdem fortfahren.
                    </AlertDescription>
                  </Alert>
                )}
                <p className="text-xs text-neutral-400">
                  Ohne Link einfach „Manuell“ wählen und weiter. Mit Link versucht
                  „Daten auslesen“, Titel, Preis, Fläche & Adresse automatisch zu
                  übernehmen.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <TextField name="title" label="Titel / Objektname" placeholder="z. B. Whg. 2. OG links, Hauptstraße 45" />
                </div>
                <TextField name="street" label="Straße + Hausnummer" />
                <div className="grid grid-cols-2 gap-3">
                  <TextField name="zip" label="PLZ" />
                  <SelectField
                    name="city"
                    label="Ort"
                    options={cityOptions.map((c) => ({ value: c, label: c }))}
                  />
                </div>
                <NumField name="living_area" label="Wohnfläche" unit="m²" step="0.5" />
                <NumField name="rooms" label="Zimmer" step="0.5" />
                <TextField name="floor" label="Etage" placeholder="z. B. 2. OG" />
                <NumField name="construction_year" label="Baujahr" step="1" />
                <SelectField
                  name="condition"
                  label="Zustand"
                  options={CONDITIONS.map((c) => ({ value: c, label: CONDITION_META[c].label }))}
                />
                <SelectField
                  name="rental_status"
                  label="Vermietungsstatus"
                  options={(["frei", "vermietet", "unbekannt"] as const).map((s) => ({
                    value: s,
                    label: RENTAL_STATUS_META[s].label,
                  }))}
                />
                <div className="sm:col-span-2 mt-2 border-t pt-4">
                  <p className="mb-3 text-sm font-medium">Anbieter / Ansprechpartner (optional)</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <TextField name="contact_name" label="Name" />
                    <TextField name="contact_phone" label="Telefon" />
                    <TextField name="contact_email" label="E-Mail" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NumField name="price" label="Kaufpreis" unit="€" step="1000" />
                <NumField
                  name="purchase_costs_percent"
                  label="Kaufnebenkosten"
                  unit="%"
                  step="0.01"
                  hint={`Standard: ${settings.purchase_costs_percent} % — Abweichung wird als Override gespeichert`}
                />
                <NumField name="hausgeld" label="Hausgeld gesamt" unit="€/Monat" step="10" />
                <NumField
                  name="hausgeld_non_recoverable"
                  label="davon nicht umlagefähig"
                  unit="€/Monat"
                  step="5"
                  hint={`Leer = Schätzung ${settings.non_recoverable_per_sqm} €/m²`}
                />
                <NumField
                  name="maintenance_monthly"
                  label="Instandhaltungspuffer"
                  unit="€/Monat"
                  step="5"
                  hint={`Leer = ${settings.maintenance_per_sqm} €/m²`}
                />
                <NumField
                  name="planned_renovation_costs"
                  label="Geplante Sanierung"
                  unit="€ einmalig"
                  step="1000"
                />
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NumField
                  name="current_rent_cold"
                  label="Ist-Kaltmiete"
                  unit="€/Monat"
                  step="10"
                  hint="Bei vermieteten Objekten"
                />
                <NumField
                  name="estimated_rent_cold"
                  label="Soll-/Marktkaltmiete"
                  unit="€/Monat"
                  step="10"
                  hint="Geschätzte erzielbare Miete"
                />
                <RentHint marketPrices={marketPrices} />
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NumField
                  name="equity_percent"
                  label="Eigenkapitalquote"
                  unit="%"
                  step="1"
                  hint={`Standard: ${settings.equity_percent} %`}
                />
                <NumField
                  name="interest_rate"
                  label="Zinssatz"
                  unit="% p.a."
                  step="0.01"
                  hint={`Standard: ${settings.interest_rate} %`}
                />
                <NumField
                  name="repayment_rate"
                  label="Anfängliche Tilgung"
                  unit="% p.a."
                  step="0.01"
                  hint={`Standard: ${settings.repayment_rate} %`}
                />
                <NumField name="fixed_rate_years" label="Zinsbindung" unit="Jahre" step="1" />
              </div>
            )}

            {step === 5 && (
              <EvaluationPanel settings={settings} marketPrices={marketPrices} />
            )}
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Zurück
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext} className="bg-green-700 hover:bg-green-800">
              Weiter
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={createProperty.isPending}
              className="bg-green-700 hover:bg-green-800"
            >
              {createProperty.isPending ? "Speichern…" : "Immobilie speichern"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

/** €/m²-Hinweis unter den Mietfeldern */
function RentHint({ marketPrices }: { marketPrices: MarketPriceRow[] }) {
  const { control } = useFormContext<PropertyFormValues>();
  const w = useWatch({ control });
  const area = num(w.living_area);
  const rent = num(w.current_rent_cold) ?? num(w.estimated_rent_cold);
  const ref = w.city ? marketPriceForCity(w.city, marketPrices)?.rent_per_sqm : null;
  if (area == null || rent == null || area <= 0) return null;
  const perSqm = rent / area;
  return (
    <div className="sm:col-span-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
      Das entspricht{" "}
      <span className="font-medium">{perSqm.toLocaleString("de-DE", { maximumFractionDigits: 2 })} €/m²</span>
      {ref != null && (
        <>
          {" "}— Marktreferenz {w.city}: {ref.toLocaleString("de-DE")} €/m²{" "}
          {perSqm > ref * 1.15 && (
            <span className="text-amber-600">(deutlich über Markt — prüfen)</span>
          )}
          {perSqm < ref * 0.85 && (
            <span className="text-green-700">(unter Markt — Mietsteigerungspotenzial)</span>
          )}
        </>
      )}
      <ExternalLink className="ml-1 inline size-3 text-neutral-300" />
    </div>
  );
}
