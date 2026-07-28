import { DEFAULT_CRITERIA, QUESTIONS } from "./catalog";
import type {
  Category,
  CriteriaSettings,
  Criterion,
  Inspection,
} from "./types";
import { CATEGORY_WEIGHTS } from "./types";

// Effektiver Katalog: Standard + eigene Kriterien, minus ausgeblendete, mit Umbenennungen
export function effectiveCriteria(settings: CriteriaSettings): Criterion[] {
  const base = DEFAULT_CRITERIA.filter((c) => !settings.hidden.includes(c.id)).map(
    (c) => (settings.renamed[c.id] ? { ...c, label: settings.renamed[c.id] } : c)
  );
  const added = settings.added.filter((c) => !settings.hidden.includes(c.id));
  return [...base, ...added];
}

export interface ScoreResult {
  total: number | null;
  perCategory: Partial<Record<Category, number | null>>;
  redFlags: { severity: "critical" | "warn"; label: string }[];
  answered: number;
  answerable: number;
  openQuestions: number;
  recommendation: "gruen" | "gelb" | "rot" | null;
  recommendationLabel: string;
}

// Bruttorendite in % oder null
export function grossYield(insp: Inspection): number | null {
  const preis = Number(insp.objekt.kaufpreis) || 0;
  if (preis <= 0) return null;
  const vermietet = !!insp.objekt.vermietet;
  const kalt = Number(insp.objekt.miete_geschaetzt) || 0;
  const bestandsmiete = vermietet ? Number((insp.objekt as any).miet_kalt) || 0 : 0;
  const monat = bestandsmiete > 0 ? bestandsmiete : kalt;
  if (monat <= 0) return null;
  return ((monat * 12) / preis) * 100;
}

export function pricePerSqm(insp: Inspection): number | null {
  const preis = Number(insp.objekt.kaufpreis) || 0;
  const flaeche = Number(insp.objekt.flaeche) || 0;
  if (preis <= 0 || flaeche <= 0) return null;
  return preis / flaeche;
}

function yieldScore(y: number | null): number | null {
  if (y == null) return null;
  if (y >= 5.5) return 4;
  if (y >= 4.5) return 3;
  if (y >= 3.5) return 2;
  if (y >= 2.5) return 1;
  return 0;
}

export function computeScore(insp: Inspection, settings: CriteriaSettings): ScoreResult {
  const criteria = effectiveCriteria(settings);
  const vermietet = !!insp.objekt.vermietet;

  const sums: Partial<Record<Category, { got: number; max: number }>> = {};
  const redFlags: { severity: "critical" | "warn"; label: string }[] = [];
  let answered = 0;
  let answerable = 0;

  for (const crit of criteria) {
    if (!vermietet && crit.section === "mieter") continue;
    const ans = insp.answers[crit.id];
    const v = ans?.v;
    if (crit.category) answerable++;
    if (v === undefined || v === null) continue;
    answered++;
    if (crit.category) {
      const s = (sums[crit.category] ||= { got: 0, max: 0 });
      s.got += v;
      s.max += 4;
    }
    if (crit.flag && v <= crit.flag.maxValue) {
      redFlags.push({ severity: crit.flag.severity, label: crit.flag.label });
    }
  }

  // Wirtschaftlichkeit: berechnete Rendite fließt als zusätzliches Kriterium ein
  const ys = yieldScore(grossYield(insp));
  if (ys != null) {
    const s = (sums.wirtschaftlichkeit ||= { got: 0, max: 0 });
    s.got += ys;
    s.max += 4;
  }

  const perCategory: Partial<Record<Category, number | null>> = {};
  let weightedSum = 0;
  let weightUsed = 0;
  (Object.keys(CATEGORY_WEIGHTS) as Category[]).forEach((cat) => {
    if (!vermietet && cat === "mieter") {
      perCategory[cat] = null;
      return;
    }
    const s = sums[cat];
    if (!s || s.max === 0) {
      perCategory[cat] = null;
      return;
    }
    const pct = Math.round((s.got / s.max) * 100);
    perCategory[cat] = pct;
    weightedSum += pct * CATEGORY_WEIGHTS[cat];
    weightUsed += CATEGORY_WEIGHTS[cat];
  });

  const total = weightUsed > 0 ? Math.round(weightedSum / weightUsed) : null;

  // Dedupe Red Flags
  const seen = new Set<string>();
  const flags = redFlags.filter((f) => !seen.has(f.label) && seen.add(f.label));
  const hasCritical = flags.some((f) => f.severity === "critical");

  // Offene Fragen: Maklerfragen ohne Haken + relevante Kriterien mit "unklar"
  let openQuestions = 0;
  for (const q of QUESTIONS) {
    if (!vermietet && q.group === "Vermietung") continue;
    if (!insp.questions[q.id]?.checked) openQuestions++;
  }
  for (const crit of criteria) {
    if (!vermietet && crit.section === "mieter") continue;
    if (insp.answers[crit.id]?.v === null) openQuestions++;
  }

  let recommendation: ScoreResult["recommendation"] = null;
  let recommendationLabel = "Noch keine Bewertung";
  if (total != null && answered >= 5) {
    if (total >= 75 && !hasCritical) {
      recommendation = "gruen";
      recommendationLabel = "Weiterverfolgen";
    } else if (total >= 55 || (total >= 75 && hasCritical)) {
      recommendation = "gelb";
      recommendationLabel = hasCritical ? "Nur nach Klärung der Red Flags" : "Nur nach Klärung / Preisnachlass";
    } else {
      recommendation = "rot";
      recommendationLabel = "Verwerfen";
    }
  }

  return { total, perCategory, redFlags: flags, answered, answerable, openQuestions, recommendation, recommendationLabel };
}

export function formatEUR(n: number | null | undefined, digits = 0): string {
  if (n == null || isNaN(n)) return "–";
  return n.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + " €";
}

export function formatDate(d: string | undefined): string {
  if (!d) return "–";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "–";
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}
