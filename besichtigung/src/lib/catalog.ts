import type { Criterion, DocDef, InfoField, SectionId } from "./types";

// ============================================================
// Standard-Kriterienkatalog — pro Sektion erweiterbar über
// die Einstellungen (hinzufügen, umbenennen, ausblenden).
// ============================================================

export const SECTION_META: Record<
  SectionId,
  { title: string; subtitle: string; icon: string }
> = {
  objekt: { title: "Objekt", subtitle: "Eckdaten & Kontakt", icon: "🏠" },
  lage: { title: "Lage", subtitle: "Umfeld & Vermietbarkeit", icon: "📍" },
  gebaeude: { title: "Gebäude", subtitle: "Gemeinschaftseigentum", icon: "🏢" },
  wohnung: { title: "Wohnung", subtitle: "Zustand innen", icon: "🚪" },
  schimmel: { title: "Schimmel & Feuchte", subtitle: "Besonders kritisch prüfen", icon: "⚠️" },
  technik: { title: "Technik & Energie", subtitle: "Heizung, Fenster, Elektrik", icon: "🔧" },
  weg: { title: "WEG & Unterlagen", subtitle: "Dokumente & Rücklagen", icon: "📄" },
  mieter: { title: "Mieter & Miete", subtitle: "Nur bei vermieteten Objekten", icon: "👤" },
  fragen: { title: "Fragenliste", subtitle: "An Makler / Eigentümer", icon: "❓" },
  bericht: { title: "Ergebnis", subtitle: "Score, Red Flags & Empfehlung", icon: "📊" },
};

export const WIZARD_ORDER: SectionId[] = [
  "objekt",
  "lage",
  "gebaeude",
  "wohnung",
  "schimmel",
  "technik",
  "weg",
  "mieter",
  "fragen",
  "bericht",
];

// ---------- Objekt: Info-Felder ----------
export const OBJEKT_FIELDS: InfoField[] = [
  { id: "bezeichnung", section: "objekt", label: "Bezeichnung", type: "text", placeholder: "z. B. ETW Bad Honnef" },
  { id: "adresse", section: "objekt", label: "Adresse", type: "text", placeholder: "Straße, PLZ Ort" },
  { id: "inserat", section: "objekt", label: "Inseratslink", type: "text", placeholder: "https://…" },
  { id: "kaufpreis", section: "objekt", label: "Kaufpreis", type: "number", unit: "€" },
  { id: "flaeche", section: "objekt", label: "Wohnfläche", type: "number", unit: "m²" },
  { id: "zimmer", section: "objekt", label: "Zimmer", type: "number" },
  { id: "baujahr", section: "objekt", label: "Baujahr", type: "number" },
  { id: "etage", section: "objekt", label: "Etage", type: "text", placeholder: "z. B. 2. OG" },
  { id: "hausgeld", section: "objekt", label: "Hausgeld", type: "number", unit: "€/Monat" },
  { id: "miete_geschaetzt", section: "objekt", label: "Erzielbare Kaltmiete (geschätzt)", type: "number", unit: "€/Monat" },
  { id: "stellplatz", section: "objekt", label: "Stellplatz", type: "toggle" },
  { id: "balkon", section: "objekt", label: "Balkon", type: "toggle" },
  { id: "keller", section: "objekt", label: "Keller", type: "toggle" },
  { id: "aufzug", section: "objekt", label: "Aufzug", type: "toggle" },
  { id: "vermietet", section: "objekt", label: "Vermietet", type: "toggle" },
  { id: "datum", section: "objekt", label: "Besichtigungsdatum", type: "date" },
  { id: "ansprechpartner", section: "objekt", group: "Kontakt", label: "Ansprechpartner", type: "text" },
  { id: "telefon", section: "objekt", group: "Kontakt", label: "Telefon", type: "text" },
  { id: "email", section: "objekt", group: "Kontakt", label: "E-Mail", type: "text" },
];

// ---------- Bewertete Kriterien ----------
const c = (
  id: string,
  section: SectionId,
  label: string,
  scale: Criterion["scale"],
  category: Criterion["category"],
  extra: Partial<Criterion> = {}
): Criterion => ({ id, section, label, scale, category, ...extra });

export const DEFAULT_CRITERIA: Criterion[] = [
  // ===== Lage (Skala gut/mittel/schlecht) =====
  c("lage_strasse", "lage", "Allgemeiner Eindruck der Straße", "rating3", "lage"),
  c("lage_mikrolage", "lage", "Mikrolage", "rating3", "lage"),
  c("lage_oepnv", "lage", "ÖPNV-Anbindung", "rating3", "lage"),
  c("lage_einkauf", "lage", "Einkaufsmöglichkeiten", "rating3", "lage"),
  c("lage_aerzte", "lage", "Ärzte & Infrastruktur", "rating3", "lage"),
  c("lage_parken", "lage", "Parkmöglichkeiten", "rating3", "lage", {
    flag: { severity: "warn", maxValue: 0, label: "Schlechte Parkplatzsituation" },
  }),
  c("lage_laerm", "lage", "Lärm", "rating3", "lage", {
    flag: { severity: "warn", maxValue: 0, label: "Starke Lärmbelastung" },
  }),
  c("lage_geruch", "lage", "Gerüche", "rating3", "lage"),
  c("lage_sozial", "lage", "Soziale Umgebung", "rating3", "lage"),
  c("lage_vermietbarkeit", "lage", "Vermietbarkeit", "rating3", "lage"),
  c("lage_entwicklung", "lage", "Zukünftige Entwicklung", "rating3", "zukunft"),
  // Lage: Zusatzfragen (ja = schlecht)
  c("lage_hauptstrasse", "lage", "Hauptstraße?", "bool", "lage", { group: "Zusatzfragen", boolGood: "nein" }),
  c("lage_bahn", "lage", "Bahnstrecke?", "bool", "lage", { group: "Zusatzfragen", boolGood: "nein" }),
  c("lage_fluglaerm", "lage", "Fluglärm?", "bool", "lage", { group: "Zusatzfragen", boolGood: "nein" }),
  c("lage_gastro", "lage", "Gastronomie unter/neben der Wohnung?", "bool", "lage", { group: "Zusatzfragen", boolGood: "nein" }),
  c("lage_gewerbe", "lage", "Gewerbe/Industrie in der Nähe?", "bool", "lage", { group: "Zusatzfragen", boolGood: "nein" }),
  c("lage_hochwasser", "lage", "Hochwasser-/Starkregenrisiko?", "bool", "lage", {
    group: "Zusatzfragen",
    boolGood: "nein",
    flag: { severity: "warn", maxValue: 0, label: "Hochwasser-/Starkregenrisiko" },
  }),
  c("lage_bauprojekte", "lage", "Größere Bauprojekte erkennbar?", "bool", "zukunft", { group: "Zusatzfragen", boolGood: "nein" }),

  // ===== Gebäude (Skala sehr gut … sehr schlecht) =====
  c("geb_dach", "gebaeude", "Dach", "rating5", "gebaeude", {
    hint: "Schäden, Feuchtigkeit, Moos, fehlende Ziegel? Sanierung geplant / Nachweis?",
    flag: { severity: "critical", maxValue: 0, label: "Erhebliche Dachschäden" },
  }),
  c("geb_fassade", "gebaeude", "Fassade", "rating5", "gebaeude", {
    flag: { severity: "critical", maxValue: 0, label: "Erhebliche Fassadenschäden" },
  }),
  c("geb_balkone", "gebaeude", "Balkone", "rating5", "gebaeude", {
    flag: { severity: "critical", maxValue: 0, label: "Erhebliche Balkonschäden" },
  }),
  c("geb_fenster", "gebaeude", "Fenster (Gemeinschaftseigentum)", "rating5", "gebaeude"),
  c("geb_eingang", "gebaeude", "Hauseingang", "rating5", "gebaeude"),
  c("geb_treppenhaus", "gebaeude", "Treppenhaus", "rating5", "gebaeude"),
  c("geb_keller", "gebaeude", "Keller", "rating5", "gebaeude", { hint: "Feuchtigkeit? Geruch?" }),
  c("geb_tiefgarage", "gebaeude", "Tiefgarage", "rating5", "gebaeude"),
  c("geb_aussen", "gebaeude", "Außenanlagen", "rating5", "gebaeude"),
  c("geb_aufzug", "gebaeude", "Aufzug", "rating5", "gebaeude"),
  c("geb_muell", "gebaeude", "Müllbereich", "rating5", "gebaeude"),
  c("geb_fahrrad", "gebaeude", "Fahrradraum", "rating5", "gebaeude"),

  // ===== Wohnung =====
  c("whg_waende", "wohnung", "Wände", "rating5", "wohnung"),
  c("whg_decken", "wohnung", "Decken", "rating5", "wohnung"),
  c("whg_boeden", "wohnung", "Böden", "rating5", "wohnung"),
  c("whg_tueren", "wohnung", "Türen", "rating5", "wohnung"),
  c("whg_fenster", "wohnung", "Fenster", "rating5", "wohnung"),
  c("whg_rolllaeden", "wohnung", "Rollläden", "rating5", "wohnung"),
  c("whg_steckdosen", "wohnung", "Steckdosen", "rating5", "wohnung"),
  c("whg_sicherung", "wohnung", "Sicherungskasten", "rating5", "wohnung"),
  c("whg_heizkoerper", "wohnung", "Heizkörper", "rating5", "wohnung"),
  c("whg_sanitaer", "wohnung", "Sanitäranlagen", "rating5", "wohnung"),
  c("whg_wasserdruck", "wohnung", "Wasserdruck", "rating5", "wohnung"),
  c("whg_abfluss", "wohnung", "Abflüsse", "rating5", "wohnung"),
  c("whg_lueftung", "wohnung", "Lüftung", "rating5", "wohnung"),
  c("whg_grundriss", "wohnung", "Grundriss", "rating5", "wohnung"),
  c("whg_belichtung", "wohnung", "Belichtung", "rating5", "wohnung"),
  c("whg_kueche", "wohnung", "Küche", "rating5", "wohnung"),
  c("whg_bad", "wohnung", "Bad", "rating5", "wohnung"),
  c("whg_balkon", "wohnung", "Balkon / Außenbereich", "rating5", "wohnung"),
  c("whg_kellerraum", "wohnung", "Kellerraum", "rating5", "wohnung"),

  // ===== Schimmel & Feuchte (Skala kein Hinweis … akuter Mangel) =====
  c("mold_geruch", "schimmel", "Muffiger Geruch", "mold", "wohnung", {
    flag: { severity: "critical", maxValue: 1, label: "Deutlicher Schimmel-/Feuchteverdacht: Geruch" },
  }),
  c("mold_flecken", "schimmel", "Schwarze oder grüne Flecken", "mold", "wohnung", {
    flag: { severity: "critical", maxValue: 1, label: "Deutlicher Schimmelverdacht: Flecken" },
  }),
  c("mold_wasserflecken", "schimmel", "Gelbliche Wasserflecken", "mold", "wohnung", {
    flag: { severity: "critical", maxValue: 1, label: "Feuchteschaden: Wasserflecken" },
  }),
  c("mold_tapeten", "schimmel", "Aufgequollene Tapeten", "mold", "wohnung", {
    flag: { severity: "critical", maxValue: 1, label: "Feuchteschaden: Tapeten" },
  }),
  c("mold_farbe", "schimmel", "Abblätternde Farbe", "mold", "wohnung", {
    flag: { severity: "warn", maxValue: 1, label: "Feuchteverdacht: abblätternde Farbe" },
  }),
  c("mold_laibungen", "schimmel", "Feuchte Fensterlaibungen", "mold", "wohnung", {
    flag: { severity: "critical", maxValue: 1, label: "Feuchte Fensterlaibungen" },
  }),
  c("mold_kondens", "schimmel", "Kondenswasser an Fenstern", "mold", "wohnung", {
    flag: { severity: "warn", maxValue: 1, label: "Kondenswasserbildung" },
  }),
  c("mold_aussenwand", "schimmel", "Kalte Außenwände", "mold", "wohnung", {
    flag: { severity: "warn", maxValue: 1, label: "Kalte Außenwände" },
  }),
  c("mold_silikon", "schimmel", "Schimmel an Silikonfugen", "mold", "wohnung", {
    flag: { severity: "warn", maxValue: 1, label: "Schimmel an Silikonfugen" },
  }),
  c("mold_moebel", "schimmel", "Möbel direkt vor Außenwänden", "mold", "wohnung", {
    hint: "Kann Schimmelstellen verdecken — dahinter schauen!",
  }),
  c("mold_schraenke", "schimmel", "Verfärbungen hinter Schränken", "mold", "wohnung", {
    flag: { severity: "critical", maxValue: 1, label: "Verfärbungen hinter Schränken" },
  }),
  c("mold_keller", "schimmel", "Feuchter Keller", "mold", "gebaeude", {
    flag: { severity: "critical", maxValue: 1, label: "Feuchter Keller" },
  }),
  // Verdächtige Stellen
  c("mold_ecken", "schimmel", "Raumecken", "mold", "wohnung", { group: "Verdächtige Stellen" }),
  c("mold_fensterbank", "schimmel", "Unter Fensterbänken", "mold", "wohnung", { group: "Verdächtige Stellen" }),
  c("mold_vorhaenge", "schimmel", "Hinter Vorhängen", "mold", "wohnung", { group: "Verdächtige Stellen" }),
  c("mold_badfugen", "schimmel", "Badfugen", "mold", "wohnung", { group: "Verdächtige Stellen" }),
  c("mold_kellerwaende", "schimmel", "Kellerwände", "mold", "gebaeude", { group: "Verdächtige Stellen" }),
  c("mold_decken", "schimmel", "Decken unter Balkonen/Bädern", "mold", "wohnung", { group: "Verdächtige Stellen" }),

  // ===== Technik & Energie =====
  c("tech_heizung_zustand", "technik", "Wartungszustand Heizung", "rating5", "technik", {
    group: "Heizung",
    flag: { severity: "critical", maxValue: 0, label: "Alte Heizung ohne erkennbare Strategie" },
  }),
  c("tech_fenster_zustand", "technik", "Zustand Fenster & Dichtungen", "rating5", "technik", { group: "Fenster" }),
  c("tech_fenster_zugluft", "technik", "Zugluft spürbar?", "bool", "technik", { group: "Fenster", boolGood: "nein" }),
  c("tech_fi", "technik", "FI-Schalter vorhanden?", "bool", "technik", {
    group: "Elektrik",
    boolGood: "ja",
    flag: { severity: "warn", maxValue: 0, label: "Kein FI-Schalter" },
  }),
  c("tech_sicherung_modern", "technik", "Sicherungskasten modern?", "bool", "technik", { group: "Elektrik", boolGood: "ja" }),
  c("tech_leitungen_erneuert", "technik", "Elektrik-Leitungen erneuert?", "bool", "technik", { group: "Elektrik", boolGood: "ja" }),
  c("tech_steckdosen", "technik", "Ausreichend Steckdosen?", "bool", "technik", { group: "Elektrik", boolGood: "ja" }),
  c("tech_elektro_maengel", "technik", "Sichtbare Elektro-Mängel?", "bool", "technik", {
    group: "Elektrik",
    boolGood: "nein",
    flag: { severity: "warn", maxValue: 0, label: "Sichtbare Elektro-Mängel" },
  }),
  c("tech_wasserleitungen", "technik", "Wasserleitungen (Zustand/Alter)", "rating5", "technik", { group: "Leitungen" }),
  c("tech_abwasser", "technik", "Abwasser- & Steigleitungen", "rating5", "technik", { group: "Leitungen" }),
  c("tech_energieklasse_ok", "technik", "Energieeffizienz akzeptabel?", "bool", "zukunft", {
    group: "Energieausweis",
    boolGood: "ja",
    flag: { severity: "warn", maxValue: 0, label: "Energieklasse schwach" },
  }),

  // ===== WEG =====
  c("weg_ruecklage", "weg", "Instandhaltungsrücklage ausreichend?", "rating3", "weg", {
    hint: "Höhe? Anteil der Wohnung?",
    flag: { severity: "warn", maxValue: 0, label: "Rücklage wirkt niedrig" },
  }),
  c("weg_sonderumlage", "weg", "Sonderumlage beschlossen?", "bool", "weg", {
    boolGood: "nein",
    flag: { severity: "critical", maxValue: 0, label: "Sonderumlage beschlossen" },
  }),
  c("weg_sonderumlage_diskutiert", "weg", "Sonderumlage in Diskussion?", "bool", "weg", { boolGood: "nein" }),
  c("weg_massnahmen", "weg", "Anstehende Maßnahmen unkritisch?", "rating3", "weg", {
    hint: "Welche Sanierungen sind geplant? Finanzierung geklärt?",
    flag: { severity: "critical", maxValue: 0, label: "Größere Sanierung ohne ausreichende Rücklage" },
  }),
  c("weg_rechtsstreit", "weg", "Rechtsstreitigkeiten?", "bool", "weg", {
    boolGood: "nein",
    flag: { severity: "critical", maxValue: 0, label: "Rechtsstreit in der WEG" },
  }),
  c("weg_hausgeld_rueckstaende", "weg", "Hausgeldrückstände in der WEG?", "bool", "weg", {
    boolGood: "nein",
    flag: { severity: "critical", maxValue: 0, label: "Hausgeldrückstände in der WEG" },
  }),
  c("weg_verwaltung", "weg", "Eindruck der Verwaltung", "rating3", "weg", {
    hint: "Wie lange tätig? Häufige Wechsel? Streit?",
  }),
  c("weg_gewerbe", "weg", "Gewerbliche Nutzung / Ferienvermietung?", "bool", "weg", { boolGood: "nein" }),
  c("weg_schaeden", "weg", "Größere Schäden am Gemeinschaftseigentum?", "bool", "weg", {
    boolGood: "nein",
    flag: { severity: "critical", maxValue: 0, label: "Größere Schäden am Gemeinschaftseigentum" },
  }),
  c("weg_hausgeld_umlage", "weg", "Nicht umlagefähiger Hausgeldanteil ok?", "rating3", "wirtschaftlichkeit", {
    flag: { severity: "warn", maxValue: 0, label: "Hoher nicht umlagefähiger Hausgeldanteil" },
  }),

  // ===== Mieter (nur bei vermietet) =====
  c("miet_zahlung", "mieter", "Pünktliche Mietzahlung?", "bool", "mieter", {
    boolGood: "ja",
    flag: { severity: "critical", maxValue: 0, label: "Mietrückstände" },
  }),
  c("miet_streit", "mieter", "Streitigkeiten mit Mieter?", "bool", "mieter", {
    boolGood: "nein",
    flag: { severity: "critical", maxValue: 0, label: "Rechtsstreit / Konflikt mit Mieter" },
  }),
  c("miet_vertrag_ok", "mieter", "Mietvertrag unauffällig?", "rating3", "mieter", {
    hint: "Unbefristet? Index/Staffel? Besondere Vereinbarungen?",
  }),
  c("miet_potenzial", "mieter", "Mietsteigerungspotenzial", "rating3", "mieter", {
    hint: "Letzte Erhöhung >15 Monate? Unter Marktmiete? Modernisierung denkbar?",
    flag: { severity: "warn", maxValue: 0, label: "Mietsteigerungspotenzial nicht geprüft / gering" },
  }),

  // ===== Wirtschaftlichkeit (manuell einschätzbar, Rendite wird zusätzlich berechnet) =====
  c("wirt_preis", "bericht", "Kaufpreis angemessen?", "rating3", "wirtschaftlichkeit", {
    group: "Wirtschaftlichkeit",
    hint: "Vergleich €/m² mit ähnlichen Objekten",
  }),
  c("wirt_flaeche_klar", "bericht", "Wohnfläche belegt?", "bool", "wirtschaftlichkeit", {
    group: "Wirtschaftlichkeit",
    boolGood: "ja",
    flag: { severity: "critical", maxValue: 0, label: "Ungeklärte Wohnfläche" },
  }),
  c("wirt_umbauten", "bericht", "Umbauten genehmigt?", "bool", "wirtschaftlichkeit", {
    group: "Wirtschaftlichkeit",
    boolGood: "ja",
    flag: { severity: "critical", maxValue: 0, label: "Fehlende Genehmigung für Umbauten" },
  }),
  c("wirt_eigentum_klar", "bericht", "Eigentums-/Sondernutzungsrechte klar?", "bool", "wirtschaftlichkeit", {
    group: "Wirtschaftlichkeit",
    boolGood: "ja",
    flag: { severity: "critical", maxValue: 0, label: "Unklare Eigentums-/Sondernutzungsrechte" },
  }),
];

// ---------- Technik: Info-Felder (unbewertet) ----------
export const TECH_FIELDS: InfoField[] = [
  { id: "heizung_art", section: "technik", group: "Heizung", label: "Heizungsart", type: "select", options: ["Gas-Zentralheizung", "Gas-Etagenheizung", "Öl", "Fernwärme", "Wärmepumpe", "Nachtspeicher", "Pellets", "Sonstige"] },
  { id: "heizung_baujahr", section: "technik", group: "Heizung", label: "Baujahr Heizung", type: "number" },
  { id: "heizung_warmwasser", section: "technik", group: "Heizung", label: "Warmwasserbereitung", type: "select", options: ["zentral", "dezentral (Durchlauferhitzer)", "Boiler", "unklar"] },
  { id: "heizung_austausch", section: "technik", group: "Heizung", label: "Austausch geplant", type: "text", placeholder: "laut Makler / Protokoll" },
  { id: "fenster_material", section: "technik", group: "Fenster", label: "Material", type: "select", options: ["Kunststoff", "Holz", "Alu", "gemischt"] },
  { id: "fenster_verglasung", section: "technik", group: "Fenster", label: "Verglasung", type: "select", options: ["einfach", "zweifach", "dreifach", "gemischt"] },
  { id: "fenster_baujahr", section: "technik", group: "Fenster", label: "Baujahr Fenster", type: "number" },
  { id: "elektrik_stromkreise", section: "technik", group: "Elektrik", label: "Anzahl Stromkreise", type: "number" },
  { id: "leitungen_material", section: "technik", group: "Leitungen", label: "Material Wasserleitungen", type: "select", options: ["Kupfer", "Verzinkt (alt)", "Kunststoff", "Blei (!)", "unklar"] },
  { id: "leitungen_saniert", section: "technik", group: "Leitungen", label: "Sanierungsjahr Leitungen", type: "number" },
  { id: "energie_ausweis", section: "technik", group: "Energieausweis", label: "Ausweisart", type: "select", options: ["Bedarfsausweis", "Verbrauchsausweis", "nicht vorhanden"] },
  { id: "energie_klasse", section: "technik", group: "Energieausweis", label: "Effizienzklasse", type: "select", options: ["A+", "A", "B", "C", "D", "E", "F", "G", "H", "unbekannt"] },
  { id: "energie_kennwert", section: "technik", group: "Energieausweis", label: "Endenergiekennwert", type: "number", unit: "kWh/m²a" },
  { id: "energie_traeger", section: "technik", group: "Energieausweis", label: "Wesentlicher Energieträger", type: "text" },
];

// ---------- Mieter: Info-Felder ----------
export const MIETER_FIELDS: InfoField[] = [
  { id: "miet_beginn", section: "mieter", group: "Mietverhältnis", label: "Mietbeginn", type: "date" },
  { id: "miet_kalt", section: "mieter", group: "Mietverhältnis", label: "Aktuelle Kaltmiete", type: "number", unit: "€" },
  { id: "miet_nk", section: "mieter", group: "Mietverhältnis", label: "NK-Vorauszahlung", type: "number", unit: "€" },
  { id: "miet_kaution", section: "mieter", group: "Mietverhältnis", label: "Kaution", type: "number", unit: "€" },
  { id: "miet_letzte_erhoehung", section: "mieter", group: "Mietverhältnis", label: "Letzte Mieterhöhung", type: "date" },
  { id: "miet_vertragsart", section: "mieter", group: "Mietverhältnis", label: "Vertragsart", type: "select", options: ["Standard unbefristet", "Indexmiete", "Staffelmiete", "befristet", "unklar"] },
  { id: "miet_vereinbarungen", section: "mieter", group: "Mietverhältnis", label: "Besondere Vereinbarungen", type: "textarea" },
  { id: "miet_marktmiete", section: "mieter", group: "Mietpotenzial", label: "Geschätzte Marktmiete", type: "number", unit: "€/m²" },
];

// ---------- WEG: Dokumente ----------
export const DOCUMENTS: DocDef[] = [
  { id: "teilungserklaerung", label: "Teilungserklärung" },
  { id: "gemeinschaftsordnung", label: "Gemeinschaftsordnung" },
  { id: "aufteilungsplan", label: "Aufteilungsplan" },
  { id: "energieausweis", label: "Energieausweis" },
  { id: "wirtschaftsplan", label: "Wirtschaftsplan" },
  { id: "jahresabrechnung", label: "Letzte Jahresabrechnung" },
  { id: "einzelabrechnung", label: "Einzelabrechnung" },
  { id: "beschlusssammlung", label: "Beschlusssammlung" },
  { id: "protokolle", label: "ETV-Protokolle (3–5 Jahre)" },
  { id: "ruecklagen", label: "Rücklagenübersicht" },
  { id: "grundriss", label: "Grundriss" },
  { id: "wohnflaeche", label: "Wohnflächenberechnung" },
  { id: "mietvertrag", label: "Mietvertrag" },
  { id: "nebenkosten", label: "Nebenkostenabrechnung" },
  { id: "sanierungsnachweise", label: "Sanierungsnachweise" },
];

// ---------- Fragenliste ----------
export interface QuestionDef {
  id: string;
  group: string;
  label: string;
}

export const QUESTIONS: QuestionDef[] = [
  { id: "q_geb_erneuert", group: "Gebäude", label: "Wann wurden Dach, Fassade, Fenster und Heizung zuletzt erneuert?" },
  { id: "q_geb_reparaturen", group: "Gebäude", label: "Welche größeren Reparaturen gab es?" },
  { id: "q_geb_massnahmen", group: "Gebäude", label: "Welche Maßnahmen stehen in den nächsten Jahren an?" },
  { id: "q_geb_schimmel", group: "Gebäude", label: "Gab es Feuchtigkeits- oder Schimmelschäden?" },
  { id: "q_geb_rohrbruch", group: "Gebäude", label: "Gab es Rohrbrüche oder Wasserschäden?" },
  { id: "q_geb_modern", group: "Gebäude", label: "Sind Leitungen und Elektrik modernisiert?" },
  { id: "q_weg_ruecklage", group: "WEG", label: "Wie hoch ist die Rücklage?" },
  { id: "q_weg_sonderumlage", group: "WEG", label: "Sind Sonderumlagen geplant?" },
  { id: "q_weg_streit", group: "WEG", label: "Gibt es Streitigkeiten oder Klagen?" },
  { id: "q_weg_rueckstaende", group: "WEG", label: "Gibt es Hausgeldrückstände?" },
  { id: "q_weg_verwaltung", group: "WEG", label: "Wie ist die Zusammenarbeit mit der Verwaltung?" },
  { id: "q_weg_verkauf", group: "WEG", label: "Warum wird verkauft?" },
  { id: "q_whg_maengel", group: "Wohnung", label: "Welche Mängel sind bekannt?" },
  { id: "q_whg_einbauten", group: "Wohnung", label: "Welche Einbauten gehören zum Kauf?" },
  { id: "q_whg_renovierung", group: "Wohnung", label: "Gab es Renovierungen?" },
  { id: "q_whg_laerm", group: "Wohnung", label: "Gibt es Lärmbeschwerden?" },
  { id: "q_whg_parken", group: "Wohnung", label: "Wie ist die Parksituation?" },
  { id: "q_whg_sondernutzung", group: "Wohnung", label: "Gibt es Sondernutzungsrechte?" },
  { id: "q_miet_seit", group: "Vermietung", label: "Seit wann besteht das Mietverhältnis?" },
  { id: "q_miet_erhoehung", group: "Vermietung", label: "Wann wurde zuletzt erhöht?" },
  { id: "q_miet_rueckstaende", group: "Vermietung", label: "Gibt es Zahlungsrückstände?" },
  { id: "q_miet_konflikte", group: "Vermietung", label: "Gibt es Beschwerden oder Konflikte?" },
  { id: "q_miet_kuendigung", group: "Vermietung", label: "Hat der Mieter eine Kündigungsabsicht geäußert?" },
  { id: "q_miet_nk", group: "Vermietung", label: "Welche Nebenkosten wurden zuletzt abgerechnet?" },
];

// ---------- Skalen-Definitionen für die UI ----------
export const SCALE_OPTIONS: Record<
  string,
  { label: string; short?: string; value: number | null; tone: "good" | "ok" | "bad" | "verybad" | "neutral" }[]
> = {
  rating5: [
    { label: "Sehr gut", value: 4, tone: "good" },
    { label: "Gut", value: 3, tone: "good" },
    { label: "Mittel", value: 2, tone: "ok" },
    { label: "Schlecht", value: 1, tone: "bad" },
    { label: "Sehr schlecht", value: 0, tone: "verybad" },
    { label: "n. b.", value: null, tone: "neutral" },
  ],
  rating3: [
    { label: "Gut", value: 4, tone: "good" },
    { label: "Mittel", value: 2, tone: "ok" },
    { label: "Schlecht", value: 0, tone: "bad" },
    { label: "Unklar", value: null, tone: "neutral" },
  ],
  mold: [
    { label: "Kein Hinweis", value: 4, tone: "good" },
    { label: "Leichter Verdacht", value: 2, tone: "ok" },
    { label: "Deutlicher Verdacht", value: 1, tone: "bad" },
    { label: "Akuter Mangel", value: 0, tone: "verybad" },
    { label: "n. g.", value: null, tone: "neutral" },
  ],
};

// bool wird über boolGood aufgelöst: gut = 4, schlecht = 0
export function boolOptions(boolGood: "ja" | "nein") {
  return [
    { label: "Ja", value: boolGood === "ja" ? 4 : 0, tone: boolGood === "ja" ? ("good" as const) : ("bad" as const) },
    { label: "Nein", value: boolGood === "nein" ? 4 : 0, tone: boolGood === "nein" ? ("good" as const) : ("bad" as const) },
    { label: "Unklar", value: null, tone: "neutral" as const },
  ];
}
