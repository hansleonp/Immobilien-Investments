// Reine Finanz-Berechnungen — keine Seiteneffekte, vollständig unit-getestet.
// Konventionen: Zinssätze als Prozentzahlen (3,7 = 3,7 %), Geldbeträge monatlich in €,
// sofern nicht anders benannt. Alle Ergebnisse null-safe: fehlt eine Eingabe, ist das
// abhängige Ergebnis null (UI zeigt "—").

import type { PropertyRow, SettingsRow } from "@/types/database";

export interface Assumptions {
  equityPercent: number;
  interestRate: number;
  repaymentRate: number;
  purchaseCostsPercent: number;
  targetYield: number;
  minCashflow: number;
}

export interface FinanceInput {
  price: number | null;
  monthlyRent: number | null;
  nonRecoverableMonthly: number | null;
  maintenanceMonthly: number | null;
  plannedRenovation: number;
  livingArea: number | null;
}

export interface FinanceResult {
  // Kosten & Finanzierung
  price: number | null;
  purchaseCosts: number | null;
  totalCost: number | null;
  equityAmount: number | null;
  loanAmount: number | null;
  monthlyInterest: number | null;
  monthlyRepayment: number | null;
  monthlyRate: number | null;
  // Laufende Größen
  monthlyRent: number | null;
  nonRecoverableMonthly: number | null;
  maintenanceMonthly: number | null;
  cashflow: number | null;
  // Kennzahlen
  grossYield: number | null;
  purchaseFactor: number | null;
  pricePerSqm: number | null;
  rentPerSqm: number | null;
  // Preisgrenzen
  maxPriceYield: number | null;
  maxPriceCashflow: number | null;
  breakEvenPrice: number | null;
  maxReasonablePrice: number | null;
  bindingConstraint: "rendite" | "cashflow" | null;
}

/** Merged Objekt-Overrides über die globalen Einstellungen. */
export function resolveAssumptions(
  property: Pick<
    PropertyRow,
    | "equity_percent_override"
    | "interest_rate_override"
    | "repayment_rate_override"
    | "purchase_costs_percent_override"
  >,
  settings: Pick<
    SettingsRow,
    | "equity_percent"
    | "interest_rate"
    | "repayment_rate"
    | "purchase_costs_percent"
    | "target_yield"
    | "min_cashflow"
  >
): Assumptions {
  return {
    equityPercent: property.equity_percent_override ?? settings.equity_percent,
    interestRate: property.interest_rate_override ?? settings.interest_rate,
    repaymentRate: property.repayment_rate_override ?? settings.repayment_rate,
    purchaseCostsPercent:
      property.purchase_costs_percent_override ?? settings.purchase_costs_percent,
    targetYield: settings.target_yield,
    minCashflow: settings.min_cashflow,
  };
}

/** Leitet die Rechen-Inputs aus dem Objekt ab (Ist-Miete vor Soll-Miete, €/m²-Fallbacks). */
export function resolveFinanceInput(
  property: Pick<
    PropertyRow,
    | "price"
    | "living_area"
    | "current_rent_cold"
    | "estimated_rent_cold"
    | "hausgeld_non_recoverable"
    | "maintenance_monthly"
    | "planned_renovation_costs"
  >,
  settings: Pick<SettingsRow, "maintenance_per_sqm" | "non_recoverable_per_sqm">
): FinanceInput {
  const area = property.living_area;
  const monthlyRent = property.current_rent_cold ?? property.estimated_rent_cold;
  const maintenance =
    property.maintenance_monthly ??
    (area != null ? settings.maintenance_per_sqm * area : null);
  const nonRecoverable =
    property.hausgeld_non_recoverable ??
    (area != null ? settings.non_recoverable_per_sqm * area : null);

  return {
    price: property.price,
    monthlyRent,
    nonRecoverableMonthly: nonRecoverable,
    maintenanceMonthly: maintenance,
    plannedRenovation: property.planned_renovation_costs ?? 0,
    livingArea: area,
  };
}

/**
 * Max. Kaufpreis, bei dem der monatliche Cashflow >= minCashflow bleibt.
 * Herleitung: M − H − I − (P·(1+k/100) + R)·(1−e/100)·(i+t)/1200 >= CF_min, nach P aufgelöst.
 * Nicht bindend (null) wenn e=100 % oder i+t=0; 0 wenn selbst P=0 den Cashflow nicht erreicht.
 */
export function maxPriceForCashflow(
  minCashflow: number,
  input: Pick<
    FinanceInput,
    "monthlyRent" | "nonRecoverableMonthly" | "maintenanceMonthly" | "plannedRenovation"
  >,
  a: Pick<Assumptions, "equityPercent" | "interestRate" | "repaymentRate" | "purchaseCostsPercent">
): number | null {
  const { monthlyRent: M, nonRecoverableMonthly: H, maintenanceMonthly: I } = input;
  if (M == null || H == null || I == null) return null;

  const annuityFactor = (1 - a.equityPercent / 100) * (a.interestRate + a.repaymentRate);
  if (annuityFactor <= 0) return null; // Vollfinanzierung aus EK bzw. keine Rate → Grenze nicht bindend

  const price =
    ((1200 * (M - H - I - minCashflow)) / annuityFactor - input.plannedRenovation) /
    (1 + a.purchaseCostsPercent / 100);

  return Math.max(0, price);
}

export function computeFinance(input: FinanceInput, a: Assumptions): FinanceResult {
  const { price: P, monthlyRent: M } = input;
  const H = input.nonRecoverableMonthly;
  const I = input.maintenanceMonthly;
  const R = input.plannedRenovation;

  const purchaseCosts = P != null ? (P * a.purchaseCostsPercent) / 100 : null;
  const totalCost = P != null ? P * (1 + a.purchaseCostsPercent / 100) + R : null;
  const equityAmount = totalCost != null ? (totalCost * a.equityPercent) / 100 : null;
  const loanAmount = totalCost != null ? totalCost * (1 - a.equityPercent / 100) : null;

  const monthlyInterest = loanAmount != null ? (loanAmount * a.interestRate) / 1200 : null;
  const monthlyRepayment = loanAmount != null ? (loanAmount * a.repaymentRate) / 1200 : null;
  const monthlyRate =
    loanAmount != null ? (loanAmount * (a.interestRate + a.repaymentRate)) / 1200 : null;

  const cashflow =
    M != null && H != null && I != null && monthlyRate != null
      ? M - H - I - monthlyRate
      : null;

  const grossYield = P != null && P > 0 && M != null ? ((12 * M) / P) * 100 : null;
  const purchaseFactor = P != null && M != null && M > 0 ? P / (12 * M) : null;
  const pricePerSqm =
    P != null && input.livingArea != null && input.livingArea > 0
      ? P / input.livingArea
      : null;
  const rentPerSqm =
    M != null && input.livingArea != null && input.livingArea > 0
      ? M / input.livingArea
      : null;

  const maxPriceYield =
    M != null && a.targetYield > 0 ? (1200 * M) / a.targetYield : null;
  const maxPriceCashflow = maxPriceForCashflow(a.minCashflow, input, a);
  const breakEvenPrice = maxPriceForCashflow(0, input, a);

  let maxReasonablePrice: number | null = null;
  let bindingConstraint: FinanceResult["bindingConstraint"] = null;
  if (maxPriceYield != null && maxPriceCashflow != null) {
    maxReasonablePrice = Math.min(maxPriceYield, maxPriceCashflow);
    bindingConstraint = maxPriceYield <= maxPriceCashflow ? "rendite" : "cashflow";
  } else if (maxPriceYield != null) {
    maxReasonablePrice = maxPriceYield;
    bindingConstraint = "rendite";
  } else if (maxPriceCashflow != null) {
    maxReasonablePrice = maxPriceCashflow;
    bindingConstraint = "cashflow";
  }

  return {
    price: P,
    purchaseCosts,
    totalCost,
    equityAmount,
    loanAmount,
    monthlyInterest,
    monthlyRepayment,
    monthlyRate,
    monthlyRent: M,
    nonRecoverableMonthly: H,
    maintenanceMonthly: I,
    cashflow,
    grossYield,
    purchaseFactor,
    pricePerSqm,
    rentPerSqm,
    maxPriceYield,
    maxPriceCashflow,
    breakEvenPrice,
    maxReasonablePrice,
    bindingConstraint,
  };
}

/** Bequemer Einstieg: Objekt + Einstellungen → komplettes Rechenergebnis. */
export function computePropertyFinance(
  property: PropertyRow,
  settings: SettingsRow
): FinanceResult {
  return computeFinance(
    resolveFinanceInput(property, settings),
    resolveAssumptions(property, settings)
  );
}
