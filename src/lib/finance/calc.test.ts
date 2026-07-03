import { describe, expect, it } from "vitest";
import {
  computeFinance,
  maxPriceForCashflow,
  requiredRentForCashflow,
  resolveAssumptions,
  resolveFinanceInput,
  type Assumptions,
  type FinanceInput,
} from "./calc";

// Durchgerechnetes Beispiel aus dem Umsetzungsplan
const ASSUMPTIONS: Assumptions = {
  equityPercent: 20,
  interestRate: 3.7,
  repaymentRate: 2.0,
  purchaseCostsPercent: 12.07,
  targetYield: 4.0,
  minCashflow: 0,
};

const INPUT: FinanceInput = {
  price: 200_000,
  monthlyRent: 750,
  nonRecoverableMonthly: 90,
  maintenanceMonthly: 60,
  plannedRenovation: 0,
  livingArea: 60,
};

describe("computeFinance", () => {
  const r = computeFinance(INPUT, ASSUMPTIONS);

  it("berechnet Gesamtkosten, Eigenkapital und Darlehen", () => {
    expect(r.purchaseCosts).toBeCloseTo(24_140, 0);
    expect(r.totalCost).toBeCloseTo(224_140, 0);
    expect(r.equityAmount).toBeCloseTo(44_828, 0);
    expect(r.loanAmount).toBeCloseTo(179_312, 0);
  });

  it("berechnet die Annuitätenrate", () => {
    expect(r.monthlyRate).toBeCloseTo(851.73, 1);
    expect(r.monthlyInterest).toBeCloseTo(552.88, 1);
    expect(r.monthlyRepayment).toBeCloseTo(298.85, 1);
  });

  it("berechnet Cashflow, Rendite und KGV", () => {
    expect(r.cashflow).toBeCloseTo(-251.73, 1);
    expect(r.grossYield).toBeCloseTo(4.5, 5);
    expect(r.purchaseFactor).toBeCloseTo(22.22, 1);
    expect(r.pricePerSqm).toBeCloseTo(3333.33, 1);
  });

  it("berechnet Preisgrenzen und die bindende Grenze", () => {
    expect(r.maxPriceYield).toBeCloseTo(225_000, 0);
    expect(r.breakEvenPrice).toBeCloseTo(140_889.4, 0);
    // minCashflow = 0 → Cashflow-Grenze = Break-even, und sie ist die bindende
    expect(r.maxPriceCashflow).toBeCloseTo(140_889.4, 0);
    expect(r.maxReasonablePrice).toBeCloseTo(140_889.4, 0);
    expect(r.bindingConstraint).toBe("cashflow");
  });

  it("ist null-safe bei fehlenden Eingaben", () => {
    const empty = computeFinance(
      {
        price: null,
        monthlyRent: null,
        nonRecoverableMonthly: null,
        maintenanceMonthly: null,
        plannedRenovation: 0,
        livingArea: null,
      },
      ASSUMPTIONS
    );
    expect(empty.cashflow).toBeNull();
    expect(empty.grossYield).toBeNull();
    expect(empty.purchaseFactor).toBeNull();
    expect(empty.maxReasonablePrice).toBeNull();
    expect(empty.bindingConstraint).toBeNull();
  });

  it("liefert Kennzahlen auch ohne Nebenkosten-Angaben (nur Preis + Miete)", () => {
    const partial = computeFinance(
      { ...INPUT, nonRecoverableMonthly: null, maintenanceMonthly: null },
      ASSUMPTIONS
    );
    expect(partial.grossYield).toBeCloseTo(4.5, 5);
    expect(partial.cashflow).toBeNull();
  });
});

describe("maxPriceForCashflow", () => {
  it("ist nicht bindend bei 100 % Eigenkapital", () => {
    expect(
      maxPriceForCashflow(0, INPUT, { ...ASSUMPTIONS, equityPercent: 100 })
    ).toBeNull();
  });

  it("ist nicht bindend ohne Zins und Tilgung", () => {
    expect(
      maxPriceForCashflow(0, INPUT, { ...ASSUMPTIONS, interestRate: 0, repaymentRate: 0 })
    ).toBeNull();
  });

  it("gibt 0 zurück, wenn die Kosten die Miete übersteigen", () => {
    expect(
      maxPriceForCashflow(
        0,
        { ...INPUT, monthlyRent: 100, nonRecoverableMonthly: 200, maintenanceMonthly: 50 },
        ASSUMPTIONS
      )
    ).toBe(0);
  });

  it("zieht geplante Sanierungskosten vom finanzierbaren Preis ab", () => {
    const without = maxPriceForCashflow(0, INPUT, ASSUMPTIONS)!;
    const withRenovation = maxPriceForCashflow(
      0,
      { ...INPUT, plannedRenovation: 20_000 },
      ASSUMPTIONS
    )!;
    expect(withRenovation).toBeLessThan(without);
  });
});

describe("requiredRentForCashflow", () => {
  // Fixture P=200000, k=12.07, e=20, i=3.7, t=2.0, H=90, I=60 → Rate ≈ 851,73
  it("berechnet die für CF = 0 nötige Kaltmiete", () => {
    const rent = requiredRentForCashflow(0, INPUT, ASSUMPTIONS)!;
    expect(rent).toBeCloseTo(90 + 60 + 851.73, 1); // ≈ 1001,73
  });

  it("erhöht die nötige Miete um genau den Ziel-Cashflow", () => {
    const base = requiredRentForCashflow(0, INPUT, ASSUMPTIONS)!;
    const withTarget = requiredRentForCashflow(200, INPUT, ASSUMPTIONS)!;
    expect(withTarget - base).toBeCloseTo(200, 5);
  });

  it("Gegenprobe: computeFinance mit dieser Miete liefert den Ziel-Cashflow", () => {
    const rent = requiredRentForCashflow(0, INPUT, ASSUMPTIONS)!;
    const r = computeFinance({ ...INPUT, monthlyRent: rent }, ASSUMPTIONS);
    expect(r.cashflow).toBeCloseTo(0, 5);
  });

  it("ist null-safe bei fehlendem Preis oder fehlenden Nebenkosten", () => {
    expect(requiredRentForCashflow(0, { ...INPUT, price: null }, ASSUMPTIONS)).toBeNull();
    expect(
      requiredRentForCashflow(0, { ...INPUT, nonRecoverableMonthly: null }, ASSUMPTIONS)
    ).toBeNull();
  });
});

describe("resolveAssumptions / resolveFinanceInput", () => {
  const settings = {
    equity_percent: 20,
    interest_rate: 3.7,
    repayment_rate: 2.0,
    purchase_costs_percent: 12.07,
    target_yield: 4.0,
    min_cashflow: 0,
    maintenance_per_sqm: 1.0,
    non_recoverable_per_sqm: 0.6,
  };

  it("nutzt Overrides vor den Defaults", () => {
    const a = resolveAssumptions(
      {
        equity_percent_override: 30,
        interest_rate_override: null,
        repayment_rate_override: null,
        purchase_costs_percent_override: null,
      },
      settings
    );
    expect(a.equityPercent).toBe(30);
    expect(a.interestRate).toBe(3.7);
  });

  it("bevorzugt Ist-Miete vor Soll-Miete und nutzt €/m²-Fallbacks", () => {
    const input = resolveFinanceInput(
      {
        price: 200_000,
        living_area: 60,
        current_rent_cold: 750,
        estimated_rent_cold: 800,
        hausgeld_non_recoverable: null,
        maintenance_monthly: null,
        planned_renovation_costs: 0,
      },
      settings
    );
    expect(input.monthlyRent).toBe(750);
    expect(input.maintenanceMonthly).toBeCloseTo(60, 5); // 1,00 €/m² × 60 m²
    expect(input.nonRecoverableMonthly).toBeCloseTo(36, 5); // 0,60 €/m² × 60 m²
  });

  it("nutzt Soll-Miete, wenn keine Ist-Miete vorliegt", () => {
    const input = resolveFinanceInput(
      {
        price: 200_000,
        living_area: null,
        current_rent_cold: null,
        estimated_rent_cold: 800,
        hausgeld_non_recoverable: null,
        maintenance_monthly: null,
        planned_renovation_costs: 0,
      },
      settings
    );
    expect(input.monthlyRent).toBe(800);
    expect(input.maintenanceMonthly).toBeNull(); // keine Fläche → kein Fallback
  });
});
