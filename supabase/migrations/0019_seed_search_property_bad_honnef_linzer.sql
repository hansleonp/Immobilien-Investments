-- Daten-Seed: VivaRheni-Landingpage-Inserat (Bad Honnef, Linzer Str. 62, 3-Zi-ETW 79 m2, EG, vermietet 680 EUR)
-- Erstbewertung 05.08.2026. Idempotent: Insert nur, falls weder id noch Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  '14bb9199-92f6-4d26-95ce-dae095569525',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "14bb9199-92f6-4d26-95ce-dae095569525", "created_at": "2026-08-05T12:00:00.000Z", "updated_at": "2026-08-05T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "VivaRheni Landingpage", "link": "https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5", "titel": "Zentral in Bad Honnef: 3-Zimmer-Wohnung fuer Kapitalanleger (Linzer Str. 62, EG)", "ort": "Bad Honnef", "adresse": "Linzer Str. 62", "lat": null, "lng": null, "zimmer": 3, "wohnflaeche": 79, "baujahr": 1968, "preis": 179000, "miete": 680, "roiSoll": null, "marktwert": null, "cashflow": -7, "wunschpreis": 160000, "wunschmiete": 680, "datum": "2026-08-05", "notizen": "Analyse 05.08.2026: Kaufen wenn Preis passt. Zielpreis ~160.000 EUR (Erstgebot 150.000-155.000 EUR); App-Logik traegt CF 0 schon bei ~177.300 EUR (nur 1 % unter Inseratspreis), konservativ (n. uml. Hausgeld ~50 EUR geschaetzt + Ruecklage ~63 EUR) erst ~147.700 EUR. Bei 179.000 EUR: CF -7 EUR/Monat (App-Logik), konservativ ca. -120 EUR; Faktor 21,9; Brutto 4,56 %, Netto 4,14 % - bestes Zahlenwerk im Log auf Ist-Miete.\nMietansatz: Ist-Kaltmiete 680 EUR seit 01.07.2021 = 8,61 EUR/m2, ca. 30-35 % unter Bad-Honnef-Markt (11,70-12,54 EUR/m2 lt. Mietspiegel-Portalen; Marktmiete ~925-990 EUR) = echtes Steigerungspotenzial, aber nur schrittweise ueber Kappungsgrenze (15-20 % / 3 J.) hebbar.\nRisiken/klaeren: Oel-Zentralheizung von 2010 (Tausch in den 2030ern absehbar, GEG 65-%-EE = teure WEG-Massnahme), Ruecklage/Protokolle unbekannt, n. uml. Hausgeld-Anteil offen (Hausgeld 293 EUR = 3,7 EUR/m2), EG an der Linzer Strasse (Landesstrasse, Durchgangsverkehr - Laermabschlag erklaert den guenstigen Preis mit), Mietvertrag/Rueckstaende/letzte Erhoehung offen, Kaeuferprovision 3,57 %.\nPluspunkte: 2.266 EUR/m2 klar unter Bad-Honnef-Schnitt (~3.600-4.000 EUR/m2), gepflegte Historie (Dach+Daemmung 2008, Fenster 1998/2003, Heizung 2010, Haustuer 2021, WW-Speicher 2022), Klasse D (112,99 kWh, gueltig bis 10/2033), zuverlaessig vermietet seit 2021, 3-Zi/79-m2-Segment in Bad Honnef knapp, Zentrum fusslaeufig.\nAnbieter: VivaRheni Immobilien GmbH, Manin Schaefer, Tel. 02224 9769751, info@vivarheni.de. Erstkontakt-Mail entworfen, noch nicht versendet.", "ansprechpartner": "Manin Schaefer (VivaRheni Immobilien GmbH)", "telefon": "02224 9769751", "email": "info@vivarheni.de", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = '14bb9199-92f6-4d26-95ce-dae095569525'
     or data->>'link' = 'https://vivarheni.landingpage.immobilien/public/a/einheit/hBpvf6euH2YKrXjxKSa7hBE4/dCR4EdE3FpEwtb4kDFEbftJ5'
);
