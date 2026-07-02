import { describe, expect, it } from "vitest";
import { computeFinance, type Assumptions, type FinanceInput } from "./calc";
import { computeScore } from "./score";

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

const NO_RATINGS = {
  location_rating: null,
  rentability_rating: null,
  condition_rating: null,
};

describe("computeScore", () => {
  const finance = computeFinance(INPUT, ASSUMPTIONS);

  it("renormalisiert bei fehlenden Ratings (nur Rendite/Cashflow/Markt)", () => {
    const r = computeScore({
      finance,
      ratings: NO_RATINGS,
      marketPricePerSqm: 3400,
      assumptions: ASSUMPTIONS,
    });
    // Rendite 62,5 · Cashflow 0 (geclampt) · Markt ~54,9 über 70 % Gewicht → 38
    expect(r.score).toBe(38);
    expect(r.recommendation).toBe("ablehnen");
    expect(r.isOverride).toBe(false);
  });

  it("renormalisiert ohne Marktreferenz auf Rendite + Cashflow", () => {
    const r = computeScore({
      finance,
      ratings: NO_RATINGS,
      marketPricePerSqm: null,
      assumptions: ASSUMPTIONS,
    });
    // (62,5·25 + 0·25) / 50 = 31,25 → 31
    expect(r.score).toBe(31);
  });

  it("bezieht manuelle Ratings mit voller Gewichtung ein", () => {
    const r = computeScore({
      finance,
      ratings: { location_rating: 4, rentability_rating: 3, condition_rating: 2 },
      marketPricePerSqm: 3400,
      assumptions: ASSUMPTIONS,
    });
    // + Lage 75·10, Vermietbarkeit 50·10, Zustand 25·10 → 41,6 → 42
    expect(r.score).toBe(42);
  });

  it("clampt Kriterien auf 0–100", () => {
    const great = computeFinance(
      { ...INPUT, price: 100_000, monthlyRent: 900 },
      ASSUMPTIONS
    );
    const r = computeScore({
      finance: great,
      ratings: NO_RATINGS,
      marketPricePerSqm: null,
      assumptions: ASSUMPTIONS,
    });
    // Rendite 10,8 % → weit über Skala → 100; Cashflow positiv
    expect(r.score).toBeGreaterThan(90);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("liefert null ohne Rendite und Cashflow", () => {
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
    const r = computeScore({
      finance: empty,
      ratings: { location_rating: 5, rentability_rating: 5, condition_rating: 5 },
      marketPricePerSqm: 3400,
      assumptions: ASSUMPTIONS,
    });
    expect(r.score).toBeNull();
    expect(r.recommendation).toBeNull();
  });

  it("lässt score_override gewinnen und markiert ihn", () => {
    const r = computeScore({
      finance,
      ratings: NO_RATINGS,
      scoreOverride: 80,
      marketPricePerSqm: 3400,
      assumptions: ASSUMPTIONS,
    });
    expect(r.score).toBe(80);
    expect(r.isOverride).toBe(true);
    expect(r.recommendation).toBe("interessant");
  });
});
