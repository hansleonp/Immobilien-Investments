-- Daten-Seed: Kleinanzeigen-Inserat 3415113981 (Bonn-Endenich, Von-Weichs-Strasse, 1-Zi-Apartment 24 m² inkl. TG)
-- Erstbewertung 05.08.2026. Idempotent: Insert nur, falls weder id noch Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  'f2b9b3ea-de35-42bc-b7d2-42f543ec4105',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "f2b9b3ea-de35-42bc-b7d2-42f543ec4105", "created_at": "2026-08-05T09:00:00.000Z", "updated_at": "2026-08-05T09:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "Kleinanzeigen", "link": "https://www.kleinanzeigen.de/s-anzeige/bezugsbereites-1-zimmer-apartment-in-beliebter-lage-von-bonn-endenich-inkl-tg-stellplatz-/3415113981-196-23694", "titel": "Bezugsbereites 1-Zimmer-Apartment in Bonn-Endenich inkl. TG-Stellplatz (Von-Weichs-Strasse)", "ort": "Bonn-Endenich", "adresse": "Von-Weichs-Strasse", "lat": null, "lng": null, "zimmer": 1, "wohnflaeche": 24.09, "baujahr": 1990, "preis": 129000, "miete": 390, "roiSoll": null, "marktwert": null, "cashflow": -105, "wunschpreis": 101700, "wunschmiete": 390, "datum": "2026-08-05", "notizen": "Analyse 05.08.2026: Finger weg zum aufgerufenen Preis. Zielpreis fuer CF 0 (App-Logik) ~101.700 EUR, konservativ (n. uml. Hausgeld ~50 EUR geschaetzt + Ruecklage ~19 EUR) erst ~83.700 EUR - noetiger Nachlass 21-35 %, unrealistisch (Inserat erst seit 21.07.2026 online, kein VB). Bei 129.000 EUR: CF -105 EUR/Monat (App-Logik), konservativ ca. -174 EUR; Faktor 27,6; Brutto 3,6 %, Netto 3,3 %.\nMietansatz: Wohnung leer, keine Ist-Miete. Vergleichsmiete konservativ ~14,50 EUR/m2 = ~350 EUR kalt (Endenich-Spanne lt. immoportal/IS24 13,42-17,79 EUR/m2; Abschlag wegen fehlender Kueche und Klasse F) + 40 EUR TG (bereits fuer 40 EUR vermietet, kurzfristig kuendbar) = 390 EUR gesamt.\nDealbreaker/Risiken: 5.355 EUR/m2 bei Endenich-Schnitt ~4.658 EUR/m2 - deutlich zu teuer fuer BJ 1990 mit Energieklasse F, Gaszentralheizung UND Fenstern von 1990 (36 Jahre alt, Austausch-/Sonderumlagenrisiko); keine Kueche vorhanden (nur Platz fuer Pantry in der Diele); Hausgeld 207 EUR/Monat bei 24 m2 sehr hoch (~8,6 EUR/m2), n. uml. Anteil unbekannt; Kaeuferprovision 3,57 %.\nPluspunkte: leerstehend (sofort Marktmiete moeglich), TG-Stellplatz + exklusiver Speicherverschlag, frisch verlegter Vinylboden, WEG-Erhaltungsruecklage ~147.530 EUR per 31.12.2024 (Anzahl Einheiten unbekannt), sehr gute Mikrolage fuer studentische Vermietung (Uni-Institute, Aldi/Netto/Denns fusslaeufig, Rex-Kino).\nAnbieter: R. Dieter Limbach Immobilien KG (Anbieter-Objekt-ID 23774), Ansprechpartner-Name nicht im Inserat. Erstkontakt-Mail entworfen, noch nicht versendet.", "ansprechpartner": "R. Dieter Limbach Immobilien KG", "telefon": "", "email": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = 'f2b9b3ea-de35-42bc-b7d2-42f543ec4105'
     or data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/bezugsbereites-1-zimmer-apartment-in-beliebter-lage-von-bonn-endenich-inkl-tg-stellplatz-/3415113981-196-23694'
);
