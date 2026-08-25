// Zentrale Typen der Besichtigungs-App

export type Status =
  | "geplant"
  | "in_bearbeitung"
  | "abgeschlossen"
  | "weiterverfolgen"
  | "verhandeln"
  | "verworfen";

export const STATUS_LABELS: Record<Status, string> = {
  geplant: "Geplant",
  in_bearbeitung: "In Bearbeitung",
  abgeschlossen: "Abgeschlossen",
  weiterverfolgen: "Weiterverfolgen",
  verhandeln: "Verhandeln",
  verworfen: "Verworfen",
};

// Scoring-Kategorien mit Gewichten (Summe 100)
export type Category =
  | "lage"
  | "gebaeude"
  | "wohnung"
  | "technik"
  | "weg"
  | "mieter"
  | "wirtschaftlichkeit"
  | "zukunft";

export const CATEGORY_WEIGHTS: Record<Category, number> = {
  lage: 20,
  gebaeude: 15,
  wohnung: 15,
  technik: 10,
  weg: 15,
  mieter: 10,
  wirtschaftlichkeit: 10,
  zukunft: 5,
};

export const CATEGORY_LABELS: Record<Category, string> = {
  lage: "Lage & Vermietbarkeit",
  gebaeude: "Gebäudezustand",
  wohnung: "Wohnungszustand",
  technik: "Technik & Energie",
  weg: "WEG & Rücklagen",
  mieter: "Mieter & Mietpotenzial",
  wirtschaftlichkeit: "Wirtschaftlichkeit",
  zukunft: "Zukunftsfähigkeit",
};

// Anzeige-Sektionen (Wizard-Schritte)
export type SectionId =
  | "objekt"
  | "lage"
  | "gebaeude"
  | "wohnung"
  | "schimmel"
  | "technik"
  | "weg"
  | "mieter"
  | "fragen"
  | "bericht";

// Bewertungsskalen
export type Scale =
  | "rating5" // sehr gut(4) gut(3) mittel(2) schlecht(1) sehr schlecht(0)
  | "rating3" // gut(4) mittel(2) schlecht(0)
  | "bool" // ja/nein — Polarität über goodValue
  | "mold"; // kein Hinweis(4) leicht(2) deutlich(1) akut(0)

export interface FlagRule {
  severity: "critical" | "warn";
  // Flag wird ausgelöst, wenn Punktwert <= maxValue
  maxValue: number;
  label: string;
}

export interface Criterion {
  id: string;
  section: SectionId;
  group?: string; // Untergruppe innerhalb der Sektion
  label: string;
  scale: Scale;
  category: Category | null; // null = reine Info, fließt nicht in Score
  boolGood?: "ja" | "nein"; // für scale bool: welcher Wert ist gut
  flag?: FlagRule;
  hint?: string;
  custom?: boolean;
}

// Info-Felder (unbewertet) für Objekt / Technik / Mieter
export interface InfoField {
  id: string;
  section: SectionId;
  group?: string;
  label: string;
  type: "text" | "number" | "date" | "time" | "select" | "textarea" | "toggle";
  options?: string[];
  unit?: string;
  placeholder?: string;
}

export interface Answer {
  v?: number | null; // Punktwert 0–4, null = "unklar/nicht bewertbar"
  note?: string;
  photos?: string[]; // Storage-Pfade
}

export interface QuestionState {
  checked?: boolean;
  answer?: string;
}

export interface Inspection {
  id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  title: string;
  status: Status;
  propertyId?: string; // verknüpftes Objekt aus dem Immobilien-Reiter
  propertyDocs?: PropertyDoc[]; // Snapshot der Objekt-Dokumente bei Übernahme
  objekt: Record<string, string | number | boolean | undefined>;
  answers: Record<string, Answer>;
  questions: Record<string, QuestionState>;
  docs: Record<string, string>; // Dokument-Id -> Status
  report: {
    chancen?: string;
    risiken?: string;
    naechsteSchritte?: string;
    sanierungsbedarf?: string;
    notizen?: string;
  };
  score: number | null;
  scores: Partial<Record<Category, number | null>>;
  red_flags: { severity: "critical" | "warn"; label: string }[];
}

// Anpassungen der Kriterien (Einstellungen)
export interface CriteriaSettings {
  added: Criterion[];
  renamed: Record<string, string>;
  hidden: string[];
}

export const EMPTY_SETTINGS: CriteriaSettings = { added: [], renamed: {}, hidden: [] };

export interface DocDef {
  id: string;
  label: string;
}

export const DOC_STATUS = ["nicht angefordert", "angefordert", "erhalten", "geprüft", "auffällig"] as const;

// ============================================================
// Immobilien-Suche (Reiter "Immobilien") — Spalten wie die
// ImmoMetrica-Tabelle, mobil als Karten + Formular.
// ============================================================

export const PROPERTY_QUELLEN = [
  "ImmoScout24",
  "Kleinanzeigen",
  "Immowelt",
  "Immonet",
  "ImmoMetrica",
  "Makler",
  "Sonstige",
] as const;
export type PropertyQuelle = (typeof PROPERTY_QUELLEN)[number];

export const PROPERTY_DOC_KATEGORIEN = [
  "Exposé",
  "Grundriss",
  "Energieausweis",
  "Teilungserklärung",
  "Wirtschaftsplan",
  "Hausgeldabrechnung",
  "Protokoll ETV",
  "Mietvertrag",
  "Nebenkostenabrechnung",
  "Foto",
  "Finanzierung",
  "Sonstiges",
] as const;
export type PropertyDocKategorie = (typeof PROPERTY_DOC_KATEGORIEN)[number];

export interface PropertyDoc {
  id: string;
  name: string; // Originaldateiname
  path: string; // Pfad im Storage-Bucket "documents"
  mime: string;
  size: number; // Bytes
  kategorie: string;
  uploaded_at: string; // ISO
}

// Ein datierter Verlaufseintrag (z. B. „Montag kontaktiert", „Dienstag angerufen")
export interface NoteEntry {
  id: string;
  ts: string; // ISO-Zeitstempel
  text: string;
}

export const PROPERTY_STATUS = [
  "Neu",
  "Interessant",
  "Kontaktiert",
  "Besichtigung",
  "Verhandlung",
  "Gekauft",
  "Verworfen",
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUS)[number];

export interface Property {
  id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  fav: boolean;
  neu: boolean;
  status: string[]; // Mehrfachauswahl möglich
  quelle: string;
  link: string; // Portal-URL zum Inserat
  titel: string; // Name des Inserats
  ort: string; // Stadtteil / Stadt
  adresse: string; // optionale genaue Adresse (Straße, Nr.) für punktgenaue Karte
  lat: number | null; // Geokoordinaten (gecacht)
  lng: number | null;
  zimmer: number | null;
  wohnflaeche: number | null; // m²
  baujahr: number | null;
  preis: number | null; // €
  miete: number | null; // Kaltmiete €/Monat
  roiSoll: number | null; // ROI (s) — soll, in %, z. B. 5.2
  marktwert: number | null; // € (Schätzung)
  cashflow: number | null; // €/Monat
  /** Nicht umlagefähiges Hausgeld inkl. Rücklagenzuführung, €/Monat.
   *  Wenn null, schätzt property.ts über INVEST.lastProQm. */
  nichtUmlagefaehig?: number | null;
  wunschpreis: number | null; // Best Case
  wunschmiete: number | null; // Best Case
  datum: string; // YYYY-MM-DD
  notizen: string;
  ansprechpartner: string; // Name des Ansprechpartners (Makler/Eigentümer)
  telefon: string;
  email: string;
  wiedervorlage: string; // YYYY-MM-DD — erneut melden/nachfassen; "" = keine
  history: NoteEntry[]; // Verlauf: datierte Einträge
  docs: PropertyDoc[]; // hochgeladene Dokumente (Exposé, Grundriss, …)
}
