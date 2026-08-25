// Reine Berechnungen + Fabrik für die Immobilien-Suche.
import type { NoteEntry, Property } from "./types";

export function newProperty(): Property {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
    fav: false,
    neu: true,
    status: ["Neu"],
    quelle: "",
    link: "",
    titel: "",
    ort: "",
    adresse: "",
    lat: null,
    lng: null,
    zimmer: null,
    wohnflaeche: null,
    baujahr: null,
    preis: null,
    miete: null,
    roiSoll: null,
    marktwert: null,
    cashflow: null,
    nichtUmlagefaehig: null,
    wunschpreis: null,
    wunschmiete: null,
    datum: "", // „Inseriert am" — bewusst leer; trägst du (oder /inserat) ein
    notizen: "",
    ansprechpartner: "",
    telefon: "",
    email: "",
    wiedervorlage: "",
    history: [],
    docs: [],
  };
}

/** YYYY-MM-DD in N Tagen ab heute. */
function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Tage seit Veröffentlichung („Inseriert am"). null = kein Datum. */
export function tageOnline(p: Property): number | null {
  if (!p.datum) return null;
  const d = new Date(p.datum + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  return days >= 0 ? days : null;
}

/** Wiedervorlage fällig? (Datum gesetzt, <= heute, nicht gekauft/verworfen) */
export function wiedervorlageFaellig(p: Property): boolean {
  if (!p.wiedervorlage) return false;
  const st = statusList(p.status);
  if (st.includes("Gekauft") || st.includes("Verworfen")) return false;
  return p.wiedervorlage <= new Date().toISOString().slice(0, 10);
}

/** €/m² = Preis / Wohnfläche */
export function preisProQm(p: Property): number | null {
  if (!p.preis || !p.wohnflaeche) return null;
  return p.preis / p.wohnflaeche;
}

/** Marktwert-Abweichung als Bruchteil: Preis / Marktwert − 1 (negativ = unter Markt) */
export function marktwertPct(p: Property): number | null {
  if (!p.preis || !p.marktwert) return null;
  return p.preis / p.marktwert - 1;
}

/** Best-Case-Bruttorendite in %: 12 × Wunschmiete / Wunschpreis */
export function wunschrendite(p: Property): number | null {
  if (!p.wunschpreis || !p.wunschmiete) return null;
  return (12 * p.wunschmiete) / p.wunschpreis * 100;
}

/** Kaufnebenkosten-Aufschlag für die Nettorendite (~10 %). */
export const NEBENKOSTEN_PCT = 0.1;

/** Kaufpreisfaktor = Preis / Jahres(kalt)miete (Vervielfältiger). */
export function kaufpreisfaktor(preis: number | null, miete: number | null): number | null {
  if (!preis || !miete) return null;
  return preis / (12 * miete);
}

/** Bruttorendite in %: 12 × Miete / Preis. */
export function bruttoRendite(preis: number | null, miete: number | null): number | null {
  if (!preis || !miete) return null;
  return (12 * miete) / preis * 100;
}

/** Nettorendite in %: 12 × Miete / (Preis × (1 + Nebenkosten)). */
export function nettoRendite(preis: number | null, miete: number | null): number | null {
  if (!preis || !miete) return null;
  return (12 * miete) / (preis * (1 + NEBENKOSTEN_PCT)) * 100;
}

/**
 * Finanzierungs-Annahmen (Stand 08/2026): 20 % Eigenkapital, Kaufnebenkosten
 * werden selbst gezahlt (nicht mitfinanziert), 4 % Zins + 2 % Tilgung.
 * Darlehen = Preis × 0,80; Monatsrate = Darlehen × 6 % / 12 = Preis × 0,004.
 *
 * ACHTUNG: Die Monatsrate enthält die Tilgung. Sie ist deshalb KEIN
 * Kostenmaßstab — ein Drittel davon ist Vermögensaufbau. Für die
 * Kaufentscheidung gilt seit 08/2026 die Eigenkapitalrendite (siehe
 * `ekRendite`), nicht mehr "Cashflow ≥ 0". Der Cashflow ist nur noch
 * Liquiditätsschranke (siehe `liquiditaet` / `INVEST.maxZuzahlung`).
 */
const EK_QUOTE = 0.2;
const ANNUITAET = 0.04 + 0.02;
export function finanzRate(preis: number | null): number | null {
  if (!preis) return null;
  const darlehen = preis * (1 - EK_QUOTE);
  return (darlehen * ANNUITAET) / 12;
}

/** Best-Case-Cashflow €/Monat = Wunschmiete − Kreditrate auf Wunschpreis. */
export function wunschCashflow(p: Property): number | null {
  if (!p.wunschpreis || !p.wunschmiete) return null;
  const rate = finanzRate(p.wunschpreis);
  if (rate == null) return null;
  return p.wunschmiete - rate;
}

/* ------------------------------------------------------------------ *
 * Investitionskriterium (ab 08/2026)
 *
 * Entscheidungsgröße ist die Eigenkapitalrendite über die Haltedauer,
 * nicht der monatliche Cashflow. Begründung: Tilgung ist Vermögens-
 * umschichtung, kein Aufwand. Ein Kriterium "Cashflow ≥ 0 inkl. Tilgung"
 * verlangt, dass der Mieter die Wohnung vollständig abbezahlt — das ist
 * in A-/B-Lagen strukturell unerfüllbar und filtert nur noch die Lage
 * weg statt den schlechten Preis.
 * ------------------------------------------------------------------ */

export const INVEST = {
  /** Sollzins p. a. */
  zins: 0.04,
  /** Anfangstilgung p. a. */
  tilgung: 0.02,
  /** Eigenkapitalquote auf den Kaufpreis (KNK kommen obendrauf). */
  ekQuote: 0.2,
  /** Haltedauer in Jahren (10 J. = Ende der Spekulationsfrist). */
  haltedauer: 10,
  /** Mietsteigerung p. a. (konservativ, unter Inflation). */
  mietsteigerung: 0.015,
  /** Steigerung der nicht umlagefähigen Kosten p. a. */
  kostensteigerung: 0.02,
  /** Wertsteigerung p. a. im Basisfall. */
  wertsteigerung: 0.015,
  /** Zielschwelle Eigenkapitalrendite p. a. (vor Steuern). */
  zielRendite: 0.06,
  /** Maximale monatliche Zuzahlung je Einheit (Liquiditätsschranke). */
  maxZuzahlung: 250,
  /**
   * Fallback für die nicht umlagefähige Eigentümerlast, wenn kein Wert
   * erfasst ist: 2,50 €/m²/Monat. Abgeleitet aus den erfassten Objekten
   * (Spanne 0,60–3,76 €/m², Schwerpunkt 2,2–2,8).
   */
  lastProQm: 2.5,
} as const;

/**
 * Lage-Veto: Stadtteile, die unabhängig von jeder Zahl ausgeschlossen sind.
 * Grund: In Bonn sind Kaufpreisfaktor und Lagequalität invers gekoppelt —
 * ein guter Faktor ist dort meist der Preis für eine Lage, die wir nicht
 * wollen (Mieterbonität, Fluktuation, Exit-Liquidität).
 */
export const LAGE_VETO = [
  "Tannenbusch",
  "Medinghoven",
  "Dransdorf",
  "Pennenfeld",
  "Auerberg",
] as const;

/** Trifft das Lage-Veto zu? Gibt den Stadtteil zurück, sonst null. */
export function lageVeto(p: Property): string | null {
  const hay = `${p.ort ?? ""} ${p.adresse ?? ""} ${p.titel ?? ""}`.toLowerCase();
  return LAGE_VETO.find((l) => hay.includes(l.toLowerCase())) ?? null;
}

/** Nicht umlagefähige Eigentümerlast €/Monat (erfasst oder geschätzt). */
export function eigentuemerlast(p: Property): number {
  if (p.nichtUmlagefaehig != null) return p.nichtUmlagefaehig;
  if (p.wohnflaeche) return p.wohnflaeche * INVEST.lastProQm;
  return 0;
}

/** Jahresannuität (Zins + Tilgung) auf das Darlehen. */
export function annuitaet(preis: number): number {
  return preis * (1 - INVEST.ekQuote) * (INVEST.zins + INVEST.tilgung);
}

/** Restschuld nach n Jahren bei konstanter Annuität. */
export function restschuld(preis: number, jahre: number): number {
  const d0 = preis * (1 - INVEST.ekQuote);
  const a = annuitaet(preis);
  const q = Math.pow(1 + INVEST.zins, jahre);
  return Math.max(0, d0 * q - a * ((q - 1) / INVEST.zins));
}

/** Eingesetztes Eigenkapital zum Kauf = EK-Anteil + Kaufnebenkosten. */
export function eigenkapital(preis: number): number {
  return preis * (INVEST.ekQuote + NEBENKOSTEN_PCT);
}

/**
 * Liquidität €/Monat im ersten Jahr, vor Steuern:
 * Kaltmiete − nicht umlagefähige Kosten − Annuität.
 * Negativ = monatlicher Zuschuss aus dem Einkommen. Das ist die
 * Liquiditätsschranke, KEIN Renditemaßstab.
 */
export function liquiditaet(p: Property, preis?: number | null, miete?: number | null): number | null {
  const kp = preis ?? p.preis;
  const m = miete ?? p.miete;
  if (!kp || !m) return null;
  return m - eigentuemerlast(p) - annuitaet(kp) / 12;
}

/** Interner Zinsfuß einer Zahlungsreihe (Bisektion, Jahresschritte). */
function irr(reihe: number[]): number | null {
  const npv = (r: number) => reihe.reduce((s, c, t) => s + c / Math.pow(1 + r, t), 0);
  let lo = -0.95;
  let hi = 1;
  if (npv(lo) * npv(hi) > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo) * npv(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

export interface EkErgebnis {
  /** Eigenkapitalrendite p. a. (IRR, vor Steuern) */
  renditePa: number | null;
  /** Eigenkapital beim Kauf (EK-Anteil + Kaufnebenkosten) */
  ekEinsatz: number;
  /** Summe der monatlichen Zuschüsse über die Haltedauer (negativ = Zuzahlung) */
  summeCashflow: number;
  /** Restschuld am Ende der Haltedauer */
  restschuldEnde: number;
  /** Verkaufserlös nach Ablösung (vor Steuern, ohne Verkaufskosten) */
  erloesNetto: number;
  /** Liquidität im ersten Jahr, €/Monat */
  liquiditaetStart: number;
}

/**
 * Eigenkapitalrendite über die Haltedauer als IRR, vor Steuern.
 * Zahlungsreihe: t0 = −Eigenkapital, t1..tn = Jahres-Cashflow,
 * tn zusätzlich = Verkaufserlös − Restschuld.
 *
 * Vor Steuern heißt: Mieteinnahmen sind unversteuert angesetzt, AfA und
 * Zinsabzug fehlen. Nach 10 Jahren ist der Veräußerungsgewinn für
 * Privatpersonen steuerfrei (§ 23 EStG), der Verkaufserlös also realistisch.
 */
export function ekRendite(
  p: Property,
  preis?: number | null,
  miete?: number | null,
  wertsteigerung: number = INVEST.wertsteigerung,
): EkErgebnis | null {
  const kp = preis ?? p.preis;
  const m0 = miete ?? p.miete;
  if (!kp || !m0) return null;

  const n = INVEST.haltedauer;
  const a = annuitaet(kp);
  const last0 = eigentuemerlast(p);
  const ek = eigenkapital(kp);

  const reihe: number[] = [-ek];
  let summe = 0;
  for (let k = 1; k <= n; k++) {
    const miete_k = m0 * Math.pow(1 + INVEST.mietsteigerung, k - 1) * 12;
    const last_k = last0 * Math.pow(1 + INVEST.kostensteigerung, k - 1) * 12;
    const cf = miete_k - last_k - a;
    summe += cf;
    reihe.push(cf);
  }
  const rest = restschuld(kp, n);
  const wert = kp * Math.pow(1 + wertsteigerung, n);
  const erloes = wert - rest;
  reihe[n] += erloes;

  return {
    renditePa: irr(reihe),
    ekEinsatz: ek,
    summeCashflow: summe,
    restschuldEnde: rest,
    erloesNetto: erloes,
    liquiditaetStart: m0 - last0 - a / 12,
  };
}

export interface InvestUrteil {
  ok: boolean;
  /** "veto" | "liquiditaet" | "rendite" | "ok" | "unbekannt" */
  grund: string;
  text: string;
  renditePa: number | null;
  /** Stressfall ohne Wertsteigerung */
  renditeOhneWert: number | null;
  liquiditaetStart: number | null;
}

/**
 * Kaufkriterium: Lage-Veto → Liquiditätsschranke → Eigenkapitalrendite.
 * Bewertet wird der Kaufpreis (nicht der Wunschpreis).
 */
export function investUrteil(p: Property, preis?: number | null, miete?: number | null): InvestUrteil {
  const veto = lageVeto(p);
  if (veto) {
    return {
      ok: false,
      grund: "veto",
      text: `Lage-Veto: ${veto}`,
      renditePa: null,
      renditeOhneWert: null,
      liquiditaetStart: null,
    };
  }
  const basis = ekRendite(p, preis, miete);
  const stress = ekRendite(p, preis, miete, 0);
  if (!basis) {
    return {
      ok: false,
      grund: "unbekannt",
      text: "Preis oder Miete fehlt",
      renditePa: null,
      renditeOhneWert: null,
      liquiditaetStart: null,
    };
  }
  const liq = basis.liquiditaetStart;
  const r = basis.renditePa;
  const gemeinsam = { renditePa: r, renditeOhneWert: stress?.renditePa ?? null, liquiditaetStart: liq };

  if (liq < -INVEST.maxZuzahlung) {
    return {
      ok: false,
      grund: "liquiditaet",
      text: `Zuzahlung ${Math.round(-liq)} €/M über Grenze ${INVEST.maxZuzahlung} €/M`,
      ...gemeinsam,
    };
  }
  if (r == null || r < INVEST.zielRendite) {
    return {
      ok: false,
      grund: "rendite",
      text: `EK-Rendite ${r == null ? "n/a" : (r * 100).toFixed(1) + " %"} unter Ziel ${(INVEST.zielRendite * 100).toFixed(0)} %`,
      ...gemeinsam,
    };
  }
  return { ok: true, grund: "ok", text: `EK-Rendite ${(r * 100).toFixed(1)} % p. a.`, ...gemeinsam };
}

/**
 * Maximalpreis, bei dem die Ziel-EK-Rendite gerade erreicht wird.
 * Monotone Suche über den Preis (Bisektion).
 */
export function maxPreisFuerZiel(p: Property, miete?: number | null): number | null {
  const m = miete ?? p.miete;
  if (!m) return null;
  let lo = 1000;
  let hi = 2_000_000;
  const r = (preis: number) => ekRendite(p, preis, m)?.renditePa ?? -1;
  if (r(lo) < INVEST.zielRendite) return null;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (r(mid) >= INVEST.zielRendite) lo = mid;
    else hi = mid;
  }
  return Math.round(lo / 500) * 500;
}

/** Status immer als Liste zurückgeben (verträgt Alt-Daten als String). */
export function statusList(status: string[] | string | null | undefined): string[] {
  if (Array.isArray(status)) return status.length ? status : ["Neu"];
  if (typeof status === "string" && status) return [status];
  return ["Neu"];
}

/**
 * Patch beim Status-Wechsel: setzt die neue Status-Liste und hängt — wenn
 * „Kontaktiert" neu hinzukommt — automatisch einen Zeitstempel an die Notizen
 * an, ohne Bestehendes zu überschreiben.
 */
export function statusChangePatch(prev: Property, next: string[]): Partial<Property> {
  const patch: Partial<Property> = { status: next };
  const wasContacted = statusList(prev.status).includes("Kontaktiert");
  const nowContacted = next.includes("Kontaktiert");
  if (nowContacted && !wasContacted) {
    patch.history = [...(prev.history ?? []), newNoteEntry("Als kontaktiert markiert")];
    // Automatische Wiedervorlage in 7 Tagen, falls noch keine gesetzt
    if (!prev.wiedervorlage) patch.wiedervorlage = isoInDays(7);
  }
  return patch;
}

/** Neuen Verlaufseintrag mit aktuellem Zeitstempel erzeugen. */
export function newNoteEntry(text: string): NoteEntry {
  return { id: crypto.randomUUID(), ts: new Date().toISOString(), text };
}

/** Verlaufseintrag hübsch formatieren: „Do, 24.07. · 14:30". */
export function formatNoteTs(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  const day = d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
  const time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time}`;
}

/** Farb-Stil je Status (Hintergrund-Tint + Textfarbe) für Badges */
export function statusStyle(status: string): { background: string; color: string } {
  switch (status) {
    case "Interessant": return { background: "#D7F5DD", color: "#176B33" };
    case "Kontaktiert": return { background: "#DCEAFB", color: "#1B4B8A" };
    case "Besichtigung": return { background: "#EDE3FB", color: "#5B3E9B" };
    case "Verhandlung": return { background: "#FBE1F1", color: "#8E2C66" };
    case "Gekauft": return { background: "#166534", color: "#FFFFFF" };
    case "Verworfen": return { background: "#FEE4E2", color: "#B42318" };
    case "Neu":
    default: return { background: "#E1F0FF", color: "#1F4E78" };
  }
}
