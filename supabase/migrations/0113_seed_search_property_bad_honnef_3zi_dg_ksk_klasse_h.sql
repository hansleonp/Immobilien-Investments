-- Daten-Seed: Immowelt-Exposé b55b047c (Online-ID 2697HK1BE1DH, KSK-Ref. 177836), Bad Honnef 53604,
-- 3-Zi-Dachgeschosswohnung ca. 65 m2 (Dachschraegen), 3. Geschoss, 3-Parteienhaus, Grundstueck 394 m2,
-- Bj. 1967, kein Aufzug, Keller, EBK im Kaufpreis, Bad "modern" lt. Text, Objektzustand lt. KSK
-- "modernisierungsbeduerftig" (Text: "teilweise renovierungsbeduerftig"). Gasheizung,
-- BEDARFSausweis 300,8 kWh/(m2*a) = KLASSE H (gueltig bis 04.08.2036).
-- Kaufpreis 159.000 EUR (2.446 EUR/m2), Hausgeld 422 EUR (6,49 EUR/m2, Split unbekannt), Provision 3,57 %.
-- Bezug nach Vereinbarung (lt. Immometrica leer) - Mietansatz = Vergleichsmiete 615 EUR (9,46 EUR/m2).
-- Adresse NICHT freigegeben, Lagetext ist KSK-Textbaustein -> Zentrum NICHT bestaetigt.
-- Anbieter: KSK-Immobilien GmbH (Richmodstr. 2, 50667 Koeln), Herr Niklas Weber.
-- Veroeffentlicht 02.09.2026 (Immowelt-Payload creationDate), Update 16.09.2026. Erstbewertung 24.09.2026.
-- Idempotent: Insert nur, falls weder id noch Link existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  'eb7dabdf-121e-4167-b740-3c4a3e1c88b7',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "eb7dabdf-121e-4167-b740-3c4a3e1c88b7", "created_at": "2026-09-24T12:00:00.000Z", "updated_at": "2026-09-24T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "Immowelt", "link": "https://www.immowelt.de/expose/b55b047c-8e93-4794-88c4-1d0fee2fedd8", "titel": "3-Zi-DG-Wohnung ca. 65 qm, 3-Parteienhaus, Bj. 1967, Energieklasse H, Bad Honnef (Lage unbestaetigt)", "ort": "Bad Honnef (53604)", "adresse": "", "lat": null, "lng": null, "zimmer": 3, "wohnflaeche": 65.0, "baujahr": 1967, "preis": 159000, "miete": 615, "roiSoll": null, "marktwert": null, "cashflow": -33, "nichtUmlagefaehig": 150, "wunschpreis": 108000, "wunschmiete": 615, "datum": "2026-09-02", "notizen": "Analyse 24.09.2026: **FINGER WEG** zum Angebotspreis. Ziel 108.000 EUR (6-%-Preis 123.500 minus Capex 12 T EUR minus Anlauf ~3 Monate Leerstand), Decke 118.000 EUR nur wenn Besichtigung Capex <= 5 T EUR belegt. Noetiger Nachlass 32 %.\nZahlen bei 159.000 EUR (Miete 615, Eigentuemerlast 150 geschaetzt): Faktor 21,5, brutto 4,64 %, App-CF -33 EUR, Liquiditaet konservativ -183 EUR/M (Schranke haelt), EK-Rendite 10 J. 3,35 % (ohne Wertsteigerung -0,66 %); inkl. Capex/Anlauf nur 0,89 %. Gegenprobe ohne Kredit 2,93 % (< 3 %). Alter CF-0-Wert 151.000 EUR.\nDEALBREAKER: (1) Energieklasse H, Bedarf 300,8 kWh/m2a bei Bj. 1967 im DG -> Dach/Daemmung ist DIE Wohnung; in einer 3-Parteien-WEG traegt jede Einheit ~1/3 jeder Huellenmassnahme (Dach allein 60-90 T EUR -> 20-30 T EUR Anteil), keine Masse zur Verteilung. (2) Hausgeld 422 EUR = 6,49 EUR/m2 ohne Aufzug - Heizkosten bei Klasse H sind der Treiber (~190 EUR/M Waerme), das drueckt die erzielbare Kaltmiete (Warmmieten-Deckel). (3) leer + modernisierungsbeduerftig: waehrend Renovierung volles Hausgeld + Rate ~1.070 EUR/M ohne Einnahme. (4) Lage unbekannt: KSK-Textbaustein (A3-Auffahrt + Bahnhof + Supermarkt fussl.) passt auf kein einzelnes Viertel; Aegidienberg hat dieselbe PLZ 53604.\nPluspunkte (retten die Rechnung nicht): Bad Honnef ohne Mieterschutzverordnung -> Marktmiete frei, Kappung 20 %; EBK inkl.; Bad lt. Text modern; 2.446 EUR/m2 unter Stadt-Oe.\nMietansatz: 615 EUR = 9,46 EUR/m2 (renovierter Zustand, DG mit Schraegen, Klasse H) - Bad Honnef 9,60-14,39, Oe 10,23-11,66 EUR/m2; Ist-Zustand eher 550 EUR.\nAnbieter: KSK-Immobilien GmbH, Herr Niklas Weber (Tel. Zentrale 0221 1794940, Bad Honnef 02224 181101). Online seit 02.09.2026 (22 Tage), Update 16.09. Mail entworfen, nicht versendet.", "ansprechpartner": "Herr Niklas Weber (KSK-Immobilien GmbH)", "telefon": "0221 1794940", "email": "", "wiedervorlage": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (select 1 from public.search_properties where id = 'eb7dabdf-121e-4167-b740-3c4a3e1c88b7')
  and not exists (select 1 from public.search_properties where data->>'link' = 'https://www.immowelt.de/expose/b55b047c-8e93-4794-88c4-1d0fee2fedd8');
