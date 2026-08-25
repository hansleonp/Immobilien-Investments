-- Daten-Seed: Kleinanzeigen-Inserat 3424883857 (Bonn-Endenich, Von-Weichs-Str. 20, 1-Zi-Apartment 20 m²)
-- Erstbewertung 05.08.2026 durch inserat-check.
-- Idempotent: Insert nur, falls weder die id noch der Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  'b3db15e0-28ed-4495-b19b-f4c04d10a275',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "b3db15e0-28ed-4495-b19b-f4c04d10a275", "created_at": "2026-08-05T09:00:00.000Z", "updated_at": "2026-08-05T09:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "Kleinanzeigen", "link": "https://www.kleinanzeigen.de/s-anzeige/studentenwohnung-1-zi-apartment-eigentumswohnug-bonn-end-/3424883857-196-23694", "titel": "Studentenwohnung / 1-Zi. Apartment (Von-Weichs-Str. 20)", "ort": "Bonn-Endenich", "adresse": "Von-Weichs-Str. 20", "lat": null, "lng": null, "zimmer": 1, "wohnflaeche": 20, "baujahr": 1983, "preis": 127500, "miete": 380, "roiSoll": null, "marktwert": null, "cashflow": -109, "wunschpreis": 99000, "wunschmiete": 380, "datum": "2026-08-05", "notizen": "Analyse 05.08.2026: Finger weg zum Inseratspreis. Zielpreis fuer CF 0: ~99.000 EUR (konservativ ~82.000 EUR), Faktor 28,0 auf Vergleichsmiete 380 EUR, CF bei 127.500 EUR: -109 EUR (App-Logik), konservativ ~-175 EUR (n. uml. Hausgeld ~50 geschaetzt + IH-Ruecklage 16). Noetiger Nachlass 22-36 % trotz VB, 2 Monaten Standzeit und bereits erfolgter Preissenkung 139.000 -> 127.500 (-8,3 %) unrealistisch.\nDealbreaker/Risiken: 6.375 EUR/m2 selbst fuer Mikro-Apartment-Segment sehr teuer (Vergleichsangebote Endenich: 19,47 m2 Bj. 1983 mit Stellplatz fuer 115.000 = 5.906 EUR/m2; 24,09 m2 mit TG fuer 129.000 = 5.355 EUR/m2). Vermietet, aber Ist-Miete NICHT angegeben (Altmiete koennte unter 380 liegen). Hausgeld, Ruecklage, Energieausweis fehlen komplett im Inserat. Pantrykueche in der Diele + Muenz-Waschkeller = reines Studenten-/Mikrosegment, hohe Fluktuation, Verwaltungsaufwand. Bj. 1983, Bad/Boeden vor ~4 Jahren erneuert (Zustand ok).\nPluspunkte: TG-Stellplatz im Kaufpreis, Hausmeister, provisionsfrei (Privatverkauf), Endenich solide Vermietungslage (Uni-naehe, Mietspiegel 13,42-17,79 EUR/m2, Mikro-Apartments darueber; Ansatz 380 EUR kalt inkl. TG konservativ).\nAnbieter: privat, kein Name im Inserat (aktiv seit 04/2026). Erstkontakt-Mail entworfen (Ist-Miete, Hausgeld-Split, Ruecklage, Protokolle, Energieausweis, TG-Teileigentum), noch nicht versendet.", "ansprechpartner": "", "telefon": "", "email": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = 'b3db15e0-28ed-4495-b19b-f4c04d10a275'
     or data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/studentenwohnung-1-zi-apartment-eigentumswohnug-bonn-end-/3424883857-196-23694'
);
