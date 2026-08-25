-- Daten-Seed: ImmoScout24-Inserat 170000648 (Bonn Beuel-Mitte, 1-Zi-Apartment ca. 41 m2, Bj. 1991, TG-Doppelparker, bezugsfrei ab 01.09.2026, 175.000 EUR)
-- Erstbewertung 13.08.2026. Idempotent: Insert nur, falls weder id noch Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  '09caff6b-37d5-4a86-a73b-8ea08385c21b',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "09caff6b-37d5-4a86-a73b-8ea08385c21b", "created_at": "2026-08-13T13:30:00.000Z", "updated_at": "2026-08-13T13:30:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "ImmoScout24", "link": "https://www.immobilienscout24.de/expose/170000648", "titel": "Zentrales Appartement mit idealer Anbindung in Bonn-Beuel (1 Zi, 41 m2)", "ort": "Bonn Beuel-Mitte", "adresse": "", "lat": null, "lng": null, "zimmer": 1, "wohnflaeche": 41, "baujahr": 1991, "preis": 175000, "miete": 510, "roiSoll": null, "marktwert": null, "cashflow": -161, "wunschpreis": 133000, "wunschmiete": 510, "datum": "2026-08-13", "notizen": "Erstbewertung 13.08.2026: FINGER WEG. 1-Zi-Apartment 41 m2, Beuel-Mitte (53225), Bj. 1991, 175.000 EUR = 4.268 EUR/m2 - deutlich ueber Beuel-Mitte-Wohnungsschnitt (~3.726 EUR/m2). Keine Mietangabe; Vergleichsmiete konservativ 510 EUR kalt (12,44 EUR/m2; Beuel-Mitte-Schnitt 12,71 EUR/m2). Faktor 28,6, Brutto 3,5 %, App-CF -161 EUR/M; konservativ ~-244 EUR (n. uml. ~50 EUR geschaetzt + Ruecklage 33 EUR). CF 0 erst bei ~133.000 EUR (konservativ ~111.000) = 24 % Nachlass noetig - bei tagesfrischem Inserat (online seit 13.08.2026, IS24-Label Guter Preis) unrealistisch. Selbst mit TG-Doppelparker-Miete (+50 EUR) traegt es erst ab ~146.000. Bezugsfrei ab 01.09.2026 (Mieter zieht aus) = kein Altmiete-Hebel, Neuvermietung noetig. Gas-Zentralheizung vermutlich Bj. 1991 (Tauschrisiko - Alter klaeren), Verbrauchsausweis Klasse D (116 kWh/m2a), WW elektrisch dezentral. Pluspunkte (Balkon SW zum Garten, TG-Doppelparker, Keller, Hausgeld 170 EUR moderat, sehr gute Mikrolage Beuel-Mitte mit Bahnhof Beuel/Linie 66) retten die Rechnung nicht. Anbieter: Bjoern Grube & Partner Immobilienberatung OHG, Stiftsstrasse 46, Bonn-Beuel (Kaeuferprovision 3,57 %), Objekt-ID 0-900001505. Mail-Entwurf 13.08.2026 erstellt (nicht versendet).", "ansprechpartner": "Bjoern Grube & Partner Immobilienberatung OHG", "telefon": "", "email": "", "wiedervorlage": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = '09caff6b-37d5-4a86-a73b-8ea08385c21b'
     or data->>'link' = 'https://www.immobilienscout24.de/expose/170000648'
);
