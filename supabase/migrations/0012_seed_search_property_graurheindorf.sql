-- Daten-Seed: IS24-Inserat 169779814 (Bonn-Graurheindorf, DG-Wohnung am Rhein)
-- in den Immobilien-Reiter der Besichtigungs-App (search_properties).
-- Idempotent; user_id = Besitzer der vorhandenen Zeilen (Fallback: erster Auth-User).
insert into public.search_properties (id, user_id, data, updated_at)
select
  'e86869e3-88f0-48f5-84dd-a6f1498cba83',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "e86869e3-88f0-48f5-84dd-a6f1498cba83", "created_at": "2026-08-04T12:00:00.000Z", "updated_at": "2026-08-04T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "ImmoScout24", "link": "https://www.immobilienscout24.de/expose/169779814", "titel": "Bonn Graurheindorf - Dachgeschosswohnung mit Balkon am Rhein", "ort": "Bonn-Graurheindorf", "adresse": "", "lat": null, "lng": null, "zimmer": 2, "wohnflaeche": 50.41, "baujahr": 1989, "preis": 195000, "miete": 580, "roiSoll": null, "marktwert": null, "cashflow": -168, "wunschpreis": 151000, "wunschmiete": 580, "datum": "2026-08-04", "notizen": "Analyse 04.08.2026: Finger weg zum Inseratspreis. Zielpreis ~151.000 EUR (CF 0, App-Logik), konservativ ~128.000 EUR; noetiger Nachlass 23-34 % bei tagesfrischem Inserat (online 04.08.2026) unrealistisch. Bei 195.000 EUR: CF -168 EUR (konservativ ca. -258 EUR), Faktor 28,0, Brutto 3,6 %.\nMiete 580 EUR = konservative Vergleichsmiete 11,50 EUR/m2 (Stadtteil-Durchschnitt Q1/2026: 12,15 EUR/m2, IS24-Atlas) - Wohnung ist BEZUGSFREI ab 01.09.2026, keine Ist-Miete, kein Mietsteigerungshebel.\nRisiken: 3.868 EUR/m2 nur Stadtteil-Mittelfeld, kein Abschlag fuer Bj. 1989 + Verbrauch 175,7 kWh (rechnerisch Klasse F, Gas-Zentralheizung -> Sanierungs-/GEG-Risiko); DG 2. OG ohne Aufzug-Angabe (Dach/Daemmung pruefen, Sommerhitze); Lage direkt am Rhein = Hochwasser-Thema (Anlage laut Inserat hochwasserfest - Elementarversicherung pruefen); Hausgeld 259 EUR, Split unbekannt; TG-Stellplatz kostet 12.500 EUR EXTRA (all-in 207.500 EUR, Zielpreis inkl. TG bei +60 EUR Miete ~167.000 EUR).\nPluspunkte: gepflegter Zustand, Balkon, EBK, Keller, ruhige Rheinlage, liquides 2-Zi-Segment - aendert an der Rechnung nichts.\nAnbieter: ACH, Josef K. Immobilienmakler IVD (Frechen), Hr. Philippe Drees, Provision 3,57 %. Objekt-ID 6036. Erstkontakt-Mail (Hausgeld-Split, Ruecklage, Protokolle, Sanierungen/Heizung, TG-Teileigentum, Verkaufsgrund) entworfen, noch nicht versendet.", "ansprechpartner": "Philippe Drees", "telefon": "", "email": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (select 1 from public.search_properties where id = 'e86869e3-88f0-48f5-84dd-a6f1498cba83')
  and not exists (
    select 1 from public.search_properties
    where data->>'link' = 'https://www.immobilienscout24.de/expose/169779814'
  );
