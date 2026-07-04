import { describe, expect, it } from "vitest";
import {
  computeLageScores,
  overallLageScore,
  LAGE_CATEGORIES,
  type LageCounts,
} from "./score";

function counts(partial: Partial<LageCounts>): LageCounts {
  const base = Object.fromEntries(LAGE_CATEGORIES.map((c) => [c, 0])) as LageCounts;
  return { ...base, ...partial };
}

describe("computeLageScores", () => {
  it("gibt 0 für POI-Kategorien ohne Treffer und 5 für Ruhe ohne Lärmquellen", () => {
    const s = computeLageScores(counts({}));
    expect(s.shopping).toBe(0);
    expect(s.oepnv).toBe(0);
    expect(s.ruhe).toBe(5);
  });

  it("erreicht die volle Punktzahl ab dem Kategorie-Schwellwert", () => {
    const s = computeLageScores(counts({ shopping: 10, essen: 15, oepnv: 8 }));
    expect(s.shopping).toBe(5);
    expect(s.essen).toBe(5);
    expect(s.oepnv).toBe(5);
  });

  it("wächst degressiv (Wurzel): die Hälfte der POIs gibt mehr als die halbe Punktzahl", () => {
    const s = computeLageScores(counts({ shopping: 5 }));
    expect(s.shopping).toBeGreaterThan(2.5);
    expect(s.shopping).toBeLessThan(5);
    expect(s.shopping).toBeCloseTo(3.5, 1); // 5·√(5/10) ≈ 3,54 → 3,5
  });

  it("senkt Ruhe je Lärmquelle und clampt bei 0", () => {
    expect(computeLageScores(counts({ ruhe: 1 })).ruhe).toBe(3.8);
    expect(computeLageScores(counts({ ruhe: 2 })).ruhe).toBe(2.5);
    expect(computeLageScores(counts({ ruhe: 10 })).ruhe).toBe(0);
  });

  it("clampt POI-Kategorien bei 5, auch bei sehr vielen Treffern", () => {
    expect(computeLageScores(counts({ nachtleben: 500 })).nachtleben).toBe(5);
  });
});

describe("overallLageScore", () => {
  it("mittelt über alle Kategorien", () => {
    const perfect = computeLageScores(
      counts({ shopping: 99, essen: 99, natur: 99, kultur: 99, sport: 99, medizin: 99, oepnv: 99, nachtleben: 99, ruhe: 0 })
    );
    expect(overallLageScore(perfect)).toBe(5);
    const empty = computeLageScores(counts({ ruhe: 10 }));
    expect(overallLageScore(empty)).toBe(0);
  });
});
