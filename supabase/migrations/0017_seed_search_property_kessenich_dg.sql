-- Daten-Seed: Kleinanzeigen-Inserat 3438579091 (Bonn-Kessenich, 3-Zi-DG 66 m² mit Garage, Becker Immobilien)
-- Erstbewertung 05.08.2026. Idempotent: Insert nur, falls weder id noch Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  '248ddd07-ad65-4c8b-812e-dce66d746f06',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "248ddd07-ad65-4c8b-812e-dce66d746f06", "created_at": "2026-08-05T12:00:00.000Z", "updated_at": "2026-08-05T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "Kleinanzeigen", "link": "https://www.kleinanzeigen.de/s-anzeige/gepflegte-3-zimmer-dg-wohnung-mit-sonnenbalkon-und-pkw-garage-in-beliebter-lage-von-bonn-kessenich/3438579091-196-23696", "titel": "Gepflegte 3-Zimmer-DG-Wohnung mit Sonnenbalkon und PKW-Garage (Bonn-Kessenich)", "ort": "Bonn-Kessenich", "adresse": "", "lat": null, "lng": null, "zimmer": 3, "wohnflaeche": 66, "baujahr": 1959, "preis": 238000, "miete": 895, "roiSoll": null, "marktwert": null, "cashflow": -18, "wunschpreis": 210000, "wunschmiete": 895, "datum": "2026-08-05", "notizen": "Analyse 05.08.2026: Kaufen wenn Preis passt. Zielpreis ~210.000 EUR (konservativ CF 0 bei ~206.500 EUR; App-Logik CF 0 bei 233.300 EUR), max. ~220.000 EUR. Bei 238.000 EUR: CF -18 (App-Logik), konservativ ca. -121 EUR/Monat (inkl. n. uml. Hausgeld ~50 EUR geschaetzt + Ruecklage 0,80 EUR/m2), Faktor 22,2, Brutto 4,5 %.\nMietansatz (Wohnung frei/bezugsfrei): Vergleichsmiete konservativ 12,50 EUR/m2 = 825 EUR + Garage ~70 EUR = 895 EUR kalt. Kessenich-Spanne lt. Portalen 12,44-17,28 EUR/m2 (Schnitt ~14,26) - Luft nach oben.\nPluspunkte: 3.606 EUR/m2 inkl. Einzelgarage deutlich unter Kessenich-Schnitt (~4.400-5.100 EUR/m2); Klasse C (80,7 kWh, Verbrauchsausweis) fuer Bj. 1959 gut; kleines 6-Parteien-Haus, Gartenmitbenutzung, EBK inklusive; A-Mikrolage Kessenich (Puetzstrasse, Linien 62/66, Uniklinik/Venusberg, UN-/Bundesviertel).\nRisiken: Gas-Etagenheizung ausdruecklich veraltet (Kachelofenmodell) - Austausch ~8-12 TEUR zulasten Sondereigentum; DG Bj. 1959 = Dach-/Daemmrisiko der WEG; 3. OG vermutlich ohne Aufzug; Hausgeld nur 150 EUR deutet auf kleine Ruecklage; Adresse und n. uml. Anteil unbekannt; frei = Vermietung erst aufbauen. Kein Erbbaurecht erwaehnt.\nAnbieter: Becker Immobilien Bonn Rhein-Sieg GmbH, Nico Kalf (Kaeuferprovision 3,57 %). Objekt-ID Becker-2397, online seit 18.07.2026. Erstkontakt-Mail entworfen, noch nicht versendet.", "ansprechpartner": "Nico Kalf (Becker Immobilien Bonn Rhein-Sieg GmbH)", "telefon": "", "email": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = '248ddd07-ad65-4c8b-812e-dce66d746f06'
     or data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/gepflegte-3-zimmer-dg-wohnung-mit-sonnenbalkon-und-pkw-garage-in-beliebter-lage-von-bonn-kessenich/3438579091-196-23696'
);
