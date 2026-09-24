-- Daten-Seed: immobilie1 32837493 (Bad Honnef-Rommersdorf, 53604, "Wohnen im historischen Ortskern",
-- 2-Zi-ETW 61 m2, 1. OG von 1, kein Aufzug, Bj. 1968, Wohnanlage 5 MFH / 30 WE, Haus mit 6 Parteien,
-- Balkon 6 m2 ueberdacht Sued, Keller, Gas-Zentralheizung, Verbrauchsausweis 153,4 kWh/(m2*a) = Klasse E
-- (gueltig bis 24.06.2028 - IDENTISCH mit Immowelt e1967e0f, 64 m2, 08/2026 bewertet -> vermutlich selbe WEG).
-- Kaufpreis 169.000 EUR, Hausgeld 343 EUR (Split unbekannt), leerstehend, Kaeuferprovision 3,57 %.
-- Anbieter: Staffel Immobilien GmbH, Jens Wilke, Hauptstr. 15, 53604 Bad Honnef, +49 2224 93780.
-- Veroeffentlichungsdatum nicht ermittelbar (immobilie1 ohne Einstelldatum). Erstbewertung 24.09.2026.
-- Idempotent: Insert nur, falls weder id noch Link existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  '145ce67f-699e-4426-a27d-bddec89b9cf0',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "145ce67f-699e-4426-a27d-bddec89b9cf0", "created_at": "2026-09-24T12:00:00.000Z", "updated_at": "2026-09-24T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "immobilie1", "link": "https://www.immobilie1.de/32837493", "titel": "2-Zi-ETW 61 qm, 1. OG, Balkon Sued, leer, Bad Honnef-Rommersdorf, Bj. 1968", "ort": "Bad Honnef-Rommersdorf (53604)", "adresse": "", "lat": null, "lng": null, "zimmer": 2, "wohnflaeche": 61.0, "baujahr": 1968, "preis": 169000, "miete": 640, "roiSoll": null, "marktwert": null, "cashflow": -48, "nichtUmlagefaehig": 150, "wunschpreis": 125000, "wunschmiete": 640, "datum": "", "notizen": "Analyse 24.09.2026: BEOBACHTEN - zum Inseratspreis klar kein Kauf. Zielpreis 125.000 EUR (Faktor 16,3), Decke 130.000 EUR (= exakt 6 % EK-Rendite, Faktor 17,0), 135.000 nur wenn Wirtschaftsplan Eigentuemerlast <= 132 EUR belegt und kein Capex.\nZahlen bei 169.000 (Miete 640, Eigentuemerlast 150 angesetzt): Rate 688, App-CF -48, Liquiditaet -198 EUR/M (Schranke haelt), EK-Rendite 10 J. 3,3 %, ohne Wertsteigerung -0,75 %, Brutto 4,54 %, Faktor 22,0. Noetiger Nachlass auf 130k = 23 %.\nRISIKEN: (1) Rendite zum Angebotspreis kommt komplett aus Hebel + Wertannahme. (2) Selber Verbrauchsausweis (153,4 kWh, bis 24.06.2028) wie Immowelt e1967e0f (64 m2, Naehe Annatal, 08/2026: Hausgeld 433,80 inkl. 71,38 Ruecklage, n. uml. 138,40, Heizung BHKW/KWK fossil, Zustand renovierungsbeduerftig, ebenfalls 169.000, dann RESERVIERT) -> vermutlich selbe WEG; Hausgeld 343 hier passt nicht dazu (5,62 vs 6,78 EUR/m2) - klaeren. (3) modernisiert ohne jede Konkretisierung -> Bad/Elektrik vermutlich alt, Capex-Risiko. (4) Leerstand = Erstvermietung + Leerlaufmonate. (5) Klasse E, fossile Waerme, Ruecklage bei Schwester-Einheit an der Untergrenze.\nPLUS: Bad Honnef ohne Mietpreisbremse, Kappung 20 %; leer = Marktmiete sofort; Liquiditaet unkritisch; Haus nur 6 Parteien, Balkon Sued.\nMietansatz 640 EUR = 10,50 EUR/m2 (Bad Honnef 9,60-14,39, Oe 11,66-12,98 laut Portalen; unteres Drittel wegen Bj. 1968, 1. OG ohne Aufzug, Ausstattung unbekannt).\nAnbieter: Staffel Immobilien GmbH, Jens Wilke, 02224 93780. Einstelldatum unbekannt. Mail entworfen, nicht versendet.", "ansprechpartner": "Jens Wilke (Staffel Immobilien GmbH)", "telefon": "+49 2224 93780", "email": "", "wiedervorlage": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (select 1 from public.search_properties where id = '145ce67f-699e-4426-a27d-bddec89b9cf0')
  and not exists (select 1 from public.search_properties where data->>'link' = 'https://www.immobilie1.de/32837493');
