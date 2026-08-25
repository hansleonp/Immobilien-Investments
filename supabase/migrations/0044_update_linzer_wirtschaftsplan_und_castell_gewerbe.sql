-- Update 14.08.2026 (2. Unterlagen-Lieferung Boehler): Wirtschaftsplan Whg 3, Wohnflaechenberechnung 1. OG links,
-- NK-Abrechnung 2024/25 (1. OG links). Indexmiete 1. OG SCHRIFTLICH BESTAETIGT. Eigentuemerlast real deutlich
-- hoeher als angenommen (Whg 3: 177,59 EUR/Mon n. uml. inkl. Ruecklage; EG skaliert ~171 EUR) -> Ziele gesenkt.
-- Zusaetzlich: Castell-Gewerbeeinheit war bisher Trockenkeller; TE-Zweck frei, 2. Fluchtweg fehlt.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

-- 1) 1. OG links (159.000 EUR)
update public.search_properties
set
  data = data || jsonb_build_object(
    'datum', '2026-08-14',
    'wohnflaeche', 82.58,
    'wunschpreis', 105000,
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      'Analyse 14.08.2026 (einheitsbezogene Unterlagen liegen vor): INDEXMIETE SCHRIFTLICH BESTAETIGT (Mail Boehler 14.08.) - Par.-558-Hebel tot, Basisfall Index gilt. Es existiert zudem eine Mieterhoehungsvereinbarung (angefordert, kommt nach) - pruefen ob mit Bestandsgarantie wie im EG!'
      || E'\n' || 'Wirtschaftsplan Whg 3 (WJ 2026, Verwaltung Schneider & Wegener GmbH, Bonn - damit Verwalterfrage beantwortet): gesamt 407,64 EUR/Mon, davon umlagefaehig 230,05, NICHT umlagefaehig 108,42 (Erhaltung 830/J + Verwalter 376,91/J + Sonstiges) + Erhaltungsruecklage 69,17 = EIGENTUEMERLAST 177,59 EUR/Mon (statt 135 angenommen). WEG budgetiert 5.000 Erhaltung + 5.000 Ruecklage p.a. fuers Haus.'
      || E'\n' || 'Wohnflaechenberechnung 1. OG links (27.01.2025): 82,58 m2 - die 82 m2 des Inserats stimmen (Objektdaten-Pauschale 78,42 war veraltet). ABER: Formblatt weist 2 ZIMMER aus (L-foermiges Wohnzimmer 38,93 + Schlafzimmer 16,08) - Inserat verkauft 3 Zi / 2 Schlafzimmer. Ist-Miete 571,94 = 6,93 EUR/m2.'
      || E'\n' || 'NK-Abrechnung 06/2024-05/2025: nur EINE Mieterin (365 Personentage), VZ 185/Mon, Guthaben 104,33 - sauber. Gesamtmiete der Mieterin ~757 EUR warm.'
      || E'\n' || 'Zahlen bei 571,94 kalt: 159.000 -> App-CF -38, konservativ (177,59) -215,7 EUR/Mon, Faktor 23,2. App-CF 0 bei 149.100. KONSERVATIV CF 0 bei ~102.800. Index-Pfad: ~583 naechstes Jahr (falls keine Bestandsgarantie), Marktmiete (~950-990 fuer 82,58 m2) unerreichbar im Bestand.'
      || E'\n' || 'NEUES ZIEL (Index-Basisfall, reale Eigentuemerlast): Erstgebot ~100.000, Zielpreis ~105.000, hartes Limit 115.000 (vorher 105/115/125 mit 135er-Annahme). Schlechterer Zwilling der EG-Wohnung: 19 % weniger Miete, hoehere Eigentuemerlast, nur 11 % weniger Preis. EG-Wohnung bleibt das strikt bessere Objekt.'
      || E'\n' || 'Offen: Mieterhoehungsvereinbarung (Datum = Index-Basis + evtl. Bestandsgarantie). Ansprechpartnerin: Maite Boehler, 02224 9769758, m.boehler@vivarheni.de. Unterlagen lokal: Ordner "Linzer Str 62 - Unterlagen".'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.de/immobilie/rhein-naehe-trifft-zukunftssicherheit-vermietete-3-zimmer-wohnung-in-bad-honnef/';

-- 2) EG rechts (179.000 EUR): reale Eigentuemerlast einarbeiten, Ziele senken
update public.search_properties
set
  data = data || jsonb_build_object(
    'datum', '2026-08-14',
    'wunschpreis', 138000,
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'NACHTRAG 14.08.2026 (Wirtschaftsplan Whg 3 liegt vor, MEA-skaliert 160/166 auf EG): reale Eigentuemerlast ~171,17 EUR/Mon (n. uml. 104,50 + Ruecklage 66,67) statt 135 angenommen; Hausgeld gesamt EG ~393/Mon (Maklerin sagte ~350). Verwaltung: Schneider & Wegener GmbH, Bonn. Konservativ CF 0 damit bei ~132.600 (statt 142.000); mit Index-714 ab 2028 bei ~141.500. ZIELE GESENKT: Erstgebot 130.000, Zielpreis ~138.000, hartes Limit 142.000 (vorher 135/145/150). Bei 138.000: konservativ -21 heute, +13 ab 2028; App-CF +151.'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5';

-- 3) Castell, An der Esche 6 Gewerbeeinheit: neue Infos aus Makler-Mail 14.08.
update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'NACHTRAG 14.08.2026 (Mail Boehler): TE-Zweck NICHT vorgeschrieben (gut fuer Umnutzung), aber Einheit ist reine NUTZFLAECHE - Wohnraumvermietung derzeit unzulaessig. Eigentuemer hat Nutzungsaenderung schon unverbindlich angefragt: ZWEITER FLUCHTWEG FEHLT und muesste geschaffen werden (Haupthuerde bestaetigt!). Bisherige Nutzung: TROCKENKELLER (kein echtes Buero-Vorleben!), kuerzlich renoviert. Bauamt-Gang noetig, Makler unterstuetzt Termine am Objekt. Bewertung: 2.725 EUR/m2 fuer renovierten Trockenkeller ohne gesicherten 2. Rettungsweg - FeWo-Case steht und faellt mit Fluchtweg + Genehmigung; Preisargument massiv, Zielpreis eher Richtung 85.000-95.000, Kauf nur mit Bauvoranfrage oder Rueckttrittsrecht im KV.'
  ),
  updated_at = now()
where data->>'link' = 'https://vivarheni.de/immobilie/bezugsfreies-2-raum-buero-in-top-lage-bonns/';
