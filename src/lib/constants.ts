import type {
  AnswerStatus,
  ContactType,
  DiscardReason,
  DocumentCategory,
  LocationClass,
  PropertyCondition,
  PropertySource,
  PropertyStatus,
  RentalStatus,
  TaskPriority,
  ViewingStatus,
} from "@/types/database";

// Badge-Farbklassen: ruhige Pastelltöne, grün = positiv, rot = negativ, orange = offen
export const STATUS_META: Record<PropertyStatus, { label: string; badge: string }> = {
  neu: { label: "Neu", badge: "bg-sky-100 text-sky-800" },
  interessant: { label: "Interessant", badge: "bg-emerald-100 text-emerald-800" },
  kontaktiert: { label: "Kontaktiert", badge: "bg-blue-100 text-blue-800" },
  antwort_ausstehend: { label: "Antwort ausstehend", badge: "bg-amber-100 text-amber-800" },
  rueckmeldung_erhalten: { label: "Rückmeldung erhalten", badge: "bg-teal-100 text-teal-800" },
  besichtigung_geplant: { label: "Besichtigung geplant", badge: "bg-violet-100 text-violet-800" },
  besichtigung_erledigt: { label: "Besichtigung erledigt", badge: "bg-violet-100 text-violet-800" },
  unterlagen_pruefen: { label: "Unterlagen prüfen", badge: "bg-amber-100 text-amber-800" },
  angebot_vorbereiten: { label: "Angebot vorbereiten", badge: "bg-orange-100 text-orange-800" },
  angebot_abgegeben: { label: "Angebot abgegeben", badge: "bg-orange-100 text-orange-800" },
  verhandlung: { label: "Verhandlung", badge: "bg-fuchsia-100 text-fuchsia-800" },
  notarvorbereitung: { label: "Notarvorbereitung", badge: "bg-indigo-100 text-indigo-800" },
  gekauft: { label: "Gekauft", badge: "bg-green-600 text-white" },
  abgelehnt: { label: "Abgelehnt", badge: "bg-red-100 text-red-800" },
  verworfen: { label: "Verworfen", badge: "bg-neutral-200 text-neutral-600" },
};

export const PROPERTY_STATUSES = Object.keys(STATUS_META) as PropertyStatus[];

/** Lage-Einstufung nach bulwiengesa-Städtesystem (A/B/C/D) */
export const LOCATION_CLASS_META: Record<
  LocationClass,
  { label: string; badge: string; hint: string }
> = {
  A: { label: "A-Lage", badge: "bg-emerald-100 text-emerald-800", hint: "Top-Metropole" },
  B: {
    label: "B-Lage",
    badge: "bg-blue-100 text-blue-800",
    hint: "Großstadt, national/regional bedeutend",
  },
  C: { label: "C-Lage", badge: "bg-amber-100 text-amber-800", hint: "wichtiges Regionalzentrum" },
  D: {
    label: "D-Lage",
    badge: "bg-neutral-200 text-neutral-700",
    hint: "kleinere Stadt, regionale Funktion",
  },
};

export const LOCATION_CLASSES: LocationClass[] = ["A", "B", "C", "D"];

/** Status, die ein Objekt aus der aktiven Suche nehmen */
export const INACTIVE_STATUSES: PropertyStatus[] = ["verworfen", "abgelehnt", "gekauft"];

export const ANSWER_STATUS_META: Record<AnswerStatus, { label: string; badge: string }> = {
  keine_anfrage: { label: "Keine Anfrage", badge: "bg-neutral-100 text-neutral-600" },
  anfrage_gesendet: { label: "Anfrage gesendet", badge: "bg-blue-100 text-blue-800" },
  antwort_ausstehend: { label: "Antwort ausstehend", badge: "bg-amber-100 text-amber-800" },
  antwort_erhalten: { label: "Antwort erhalten", badge: "bg-emerald-100 text-emerald-800" },
  kein_interesse_anbieter: { label: "Kein Interesse (Anbieter)", badge: "bg-red-100 text-red-800" },
  objekt_verkauft: { label: "Objekt verkauft", badge: "bg-neutral-200 text-neutral-600" },
  besichtigung_vereinbart: { label: "Besichtigung vereinbart", badge: "bg-violet-100 text-violet-800" },
  unterlagen_erhalten: { label: "Unterlagen erhalten", badge: "bg-teal-100 text-teal-800" },
};

export const ANSWER_STATUSES = Object.keys(ANSWER_STATUS_META) as AnswerStatus[];

export const SOURCE_META: Record<PropertySource, { label: string }> = {
  immoscout24: { label: "ImmoScout24" },
  kleinanzeigen: { label: "Kleinanzeigen" },
  immowelt: { label: "Immowelt" },
  immonet: { label: "Immonet" },
  makler: { label: "Makler" },
  bank: { label: "Bank/Sparkasse" },
  sonstige: { label: "Sonstige" },
  manuell: { label: "Manuell" },
};

export const SOURCES = Object.keys(SOURCE_META) as PropertySource[];

export const CONDITION_META: Record<PropertyCondition, { label: string }> = {
  erstbezug: { label: "Erstbezug/Neubau" },
  saniert: { label: "Saniert" },
  gepflegt: { label: "Gepflegt" },
  renovierungsbeduerftig: { label: "Renovierungsbedürftig" },
  sanierungsbeduerftig: { label: "Sanierungsbedürftig" },
  unbekannt: { label: "Unbekannt" },
};

export const CONDITIONS = Object.keys(CONDITION_META) as PropertyCondition[];

export const RENTAL_STATUS_META: Record<RentalStatus, { label: string }> = {
  frei: { label: "Frei" },
  vermietet: { label: "Vermietet" },
  unbekannt: { label: "Unbekannt" },
};

export const CONTACT_TYPE_META: Record<ContactType, { label: string }> = {
  plattform: { label: "Plattformnachricht" },
  email: { label: "E-Mail" },
  telefon: { label: "Telefon" },
  whatsapp: { label: "WhatsApp" },
  persoenlich: { label: "Persönlich" },
  sonstiges: { label: "Sonstiges" },
};

export const CONTACT_TYPES = Object.keys(CONTACT_TYPE_META) as ContactType[];

export const PRIORITY_META: Record<TaskPriority, { label: string; badge: string }> = {
  hoch: { label: "Hoch", badge: "bg-red-100 text-red-800" },
  mittel: { label: "Mittel", badge: "bg-amber-100 text-amber-800" },
  niedrig: { label: "Niedrig", badge: "bg-neutral-100 text-neutral-600" },
};

export const PRIORITIES = Object.keys(PRIORITY_META) as TaskPriority[];

export const VIEWING_STATUS_META: Record<ViewingStatus, { label: string; badge: string }> = {
  geplant: { label: "Geplant", badge: "bg-violet-100 text-violet-800" },
  erledigt: { label: "Erledigt", badge: "bg-emerald-100 text-emerald-800" },
  abgesagt: { label: "Abgesagt", badge: "bg-neutral-200 text-neutral-600" },
};

export const DISCARD_REASON_META: Record<DiscardReason, { label: string }> = {
  zu_teuer: { label: "Zu teuer" },
  schlechte_lage: { label: "Schlechte Lage" },
  schlechter_zustand: { label: "Schlechter Zustand" },
  negativer_cashflow: { label: "Cashflow zu negativ" },
  hausgeld_zu_hoch: { label: "Hausgeld zu hoch" },
  rechtliche_bedenken: { label: "Rechtliche Bedenken" },
  verkauft: { label: "Bereits verkauft" },
  sonstiges: { label: "Sonstiges" },
};

export const DISCARD_REASONS = Object.keys(DISCARD_REASON_META) as DiscardReason[];

export const DOCUMENT_CATEGORY_META: Record<DocumentCategory, { label: string }> = {
  expose: { label: "Exposé" },
  grundriss: { label: "Grundriss" },
  energieausweis: { label: "Energieausweis" },
  teilungserklaerung: { label: "Teilungserklärung" },
  wirtschaftsplan: { label: "Wirtschaftsplan" },
  hausgeldabrechnung: { label: "Hausgeldabrechnung" },
  protokoll_ev: { label: "Protokoll Eigentümerversammlung" },
  mietvertrag: { label: "Mietvertrag" },
  nebenkostenabrechnung: { label: "Nebenkostenabrechnung" },
  foto: { label: "Foto" },
  finanzierung: { label: "Finanzierungsunterlagen" },
  sonstiges: { label: "Sonstiges" },
};

export const DOCUMENT_CATEGORIES = Object.keys(DOCUMENT_CATEGORY_META) as DocumentCategory[];

/** Besichtigungs-Checkliste (Spec §11) */
/** Kaufprüfungs-Checkliste (Due Diligence) — bei jedem Objekt vor dem Kauf abarbeiten */
export const PURCHASE_CHECKLIST_SECTIONS = [
  {
    title: "Unterlagen anfordern & prüfen",
    items: [
      {
        key: "energieausweis",
        label: "Energieausweis prüfen",
        hint: "Ziel: Klasse D oder besser — bei E–H Sanierungskosten und GEG-Pflichten einplanen",
      },
      {
        key: "ev_protokolle",
        label: "Protokolle der letzten 3 Eigentümerversammlungen",
        hint: "Hinweise auf Streit in der WEG, Sanierungsstau, geplante Sonderumlagen",
      },
      {
        key: "teilungserklaerung",
        label: "Teilungserklärung + Gemeinschaftsordnung",
        hint: "Sondernutzungsrechte, Kostenverteilung, Regeln zur Vermietung",
      },
      {
        key: "wirtschaftsplan",
        label: "Wirtschaftsplan + letzte 3 Hausgeldabrechnungen",
        hint: "Entwicklung des Hausgelds, Nachzahlungen, Wirtschaftlichkeit der WEG",
      },
      {
        key: "ruecklage",
        label: "Höhe der Instandhaltungsrücklage",
        hint: "Faustregel: unter 10 €/m² Gesamtrücklage ist kritisch",
      },
      {
        key: "grundbuch",
        label: "Grundbuchauszug (Abteilung II + III)",
        hint: "Lasten, Wegerechte, Nießbrauch, eingetragene Grundschulden",
      },
      {
        key: "mietvertrag",
        label: "Mietvertrag + letzte Nebenkostenabrechnung",
        hint: "Miethöhe, Staffel-/Indexmiete, Kaution, Sonderkündigungsrechte",
      },
    ],
  },
  {
    title: "Gebäude & Technik",
    items: [
      {
        key: "sanierungsstau",
        label: "Sanierungsstau am Gemeinschaftseigentum",
        hint: "Dach, Fassade, Fenster, Aufzug — geplante Maßnahmen und Kosten erfragen",
      },
      {
        key: "heizung",
        label: "Heizung: Alter, Art, GEG-Pflichten",
        hint: "Öl-/Gasheizung älter als 20 Jahre = Austauschrisiko für die WEG",
      },
      {
        key: "leitungen_elektrik",
        label: "Zustand Leitungen & Elektrik",
        hint: "Baujahr vor 1980 ohne Modernisierung = Kostenrisiko",
      },
      { key: "feuchtigkeit", label: "Feuchtigkeit / Schimmel (v. a. Keller)" },
    ],
  },
  {
    title: "Mieter & Bewirtschaftung",
    items: [
      { key: "mietrueckstaende", label: "Mietrückstände / Zahlungshistorie erfragen" },
      {
        key: "mieterzufriedenheit",
        label: "Mieterzufriedenheit — Gespräch suchen",
        hint: "Zufriedene Langzeitmieter = stabiler Cashflow und weniger Leerstandsrisiko",
      },
      {
        key: "hausverwaltung",
        label: "Qualität der Hausverwaltung",
        hint: "Erreichbarkeit, pünktliche Abrechnungen, Rücklagenverwaltung",
      },
      {
        key: "mietspiegel",
        label: "Miete mit Mietspiegel vergleichen",
        hint: "Steigerungspotenzial erkennen — oder überhöhte Ist-Miete als Risiko",
      },
    ],
  },
  {
    title: "Recht & Finanzen",
    items: [
      {
        key: "erbbaurecht",
        label: "Kein Erbbaurecht / keine Erbpacht?",
        hint: "Falls doch: Restlaufzeit und Erbbauzins genau prüfen",
      },
      { key: "sonderumlagen", label: "Beschlossene oder absehbare Sonderumlagen" },
      { key: "finanzierung", label: "Finanzierungszusage der Bank liegt vor" },
      {
        key: "notarvertrag",
        label: "Kaufvertragsentwurf prüfen (lassen)",
        hint: "Besitzübergang, Gewährleistungsausschluss, Rücktrittsrechte, Fälligkeit",
      },
    ],
  },
] as const;

export const PURCHASE_CHECKLIST_TOTAL = PURCHASE_CHECKLIST_SECTIONS.reduce(
  (sum, s) => sum + s.items.length,
  0
);

export const VIEWING_CHECKLIST_ITEMS = [
  { key: "zustand_gebaeude", label: "Zustand Gebäude" },
  { key: "zustand_wohnung", label: "Zustand Wohnung" },
  { key: "treppenhaus", label: "Treppenhaus" },
  { key: "dach_fassade_fenster", label: "Dach / Fassade / Fenster" },
  { key: "heizung", label: "Heizung" },
  { key: "elektrik", label: "Elektrik" },
  { key: "bad_kueche", label: "Bad / Küche" },
  { key: "feuchtigkeit_schimmel", label: "Feuchtigkeit / Schimmel" },
  { key: "laerm", label: "Lärm" },
  { key: "parkplatz", label: "Parkplatz" },
  { key: "oepnv", label: "ÖPNV-Anbindung" },
  { key: "vermietbarkeit", label: "Vermietbarkeit" },
  { key: "renovierungsbedarf", label: "Renovierungsbedarf" },
  { key: "bauchgefuehl", label: "Bauchgefühl" },
] as const;

/** Score-Bänder (Spec §6.2) */
export const SCORE_BANDS = [
  { min: 85, label: "Sehr interessant", color: "text-green-700", ring: "ring-green-600" },
  { min: 70, label: "Interessant", color: "text-emerald-600", ring: "ring-emerald-500" },
  { min: 55, label: "Durchschnittlich", color: "text-amber-600", ring: "ring-amber-500" },
  { min: 40, label: "Schwach", color: "text-orange-600", ring: "ring-orange-500" },
  { min: 0, label: "Ablehnen", color: "text-red-600", ring: "ring-red-500" },
] as const;

export function scoreBand(score: number) {
  return SCORE_BANDS.find((b) => score >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

/** Zielregion — Vorschlagsliste für Ort-Auswahl (freie Eingabe bleibt möglich) */
export const KNOWN_CITIES = [
  "Bad Honnef",
  "Königswinter",
  "Bonn",
  "Rheinbreitbach",
  "Unkel",
  "Linz am Rhein",
  "Sankt Augustin",
  "Hennef",
  "Siegburg",
  "Remagen",
] as const;

/** Aufgaben-Schnellvorlagen (Spec §4.4) */
export const TASK_PRESETS = [
  "Nachfassen",
  "Unterlagen anfordern",
  "Exposé prüfen",
  "Hausgeldabrechnung prüfen",
  "Teilungserklärung prüfen",
  "Besichtigung organisieren",
  "Finanzierung prüfen",
  "Angebot vorbereiten",
] as const;
