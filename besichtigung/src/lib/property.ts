// Reine Berechnungen + Fabrik für die Immobilien-Suche.
import type { Property } from "./types";

export function newProperty(): Property {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
    fav: false,
    neu: true,
    quelle: "",
    link: "",
    ort: "",
    zimmer: null,
    wohnflaeche: null,
    baujahr: null,
    preis: null,
    miete: null,
    roiSoll: null,
    marktwert: null,
    cashflow: null,
    wunschpreis: null,
    wunschmiete: null,
    datum: new Date().toISOString().slice(0, 10),
    notizen: "",
  };
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

/** Best-Case-Rendite in %: 12 × Wunschmiete / Wunschpreis */
export function wunschrendite(p: Property): number | null {
  if (!p.wunschpreis || !p.wunschmiete) return null;
  return (12 * p.wunschmiete) / p.wunschpreis * 100;
}
