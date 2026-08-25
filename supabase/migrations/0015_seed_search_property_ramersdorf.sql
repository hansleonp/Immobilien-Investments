-- Daten-Seed: Kleinanzeigen-Inserat 3450083109 (Bonn-Beuel/Ramersdorf, 1-Zi-ETW mit Balkon und Stellplatz)
-- Erstbewertung 05.08.2026 durch inserat-check.
-- Idempotent: Insert nur, falls weder Id noch Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  '0cb629c2-6689-4847-b002-68ad049f9181',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "0cb629c2-6689-4847-b002-68ad049f9181", "created_at": "2026-08-05T12:00:00.000Z", "updated_at": "2026-08-05T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "Kleinanzeigen", "link": "https://www.kleinanzeigen.de/s-anzeige/bonn-beuel-ramersdorf-1-zi-etw-mit-balkon-und-autostellplatz-/3450083109-196-1053", "titel": "Bonn-Beuel/Ramersdorf: 1-Zi-ETW mit Balkon und Autostellplatz", "ort": "Bonn-Ramersdorf (Beuel)", "adresse": "", "lat": null, "lng": null, "zimmer": 1, "wohnflaeche": 34.41, "baujahr": 1994, "preis": 145000, "miete": 420, "roiSoll": null, "marktwert": null, "cashflow": -136, "wunschpreis": 109000, "wunschmiete": 420, "datum": "2026-08-05", "notizen": "Analyse 05.08.2026: Finger weg zum aufgerufenen Preis. 145.000 EUR VB = 4.214 EUR/qm fuer 1994er 1-Zi (34,41 qm), vermietet, Miete im Inserat NICHT genannt. Zielpreis App-Logik (CF 0) ~109.000 EUR bei Vergleichsmiete 420 EUR kalt (~12,20 EUR/qm, unteres Drittel Ramersdorf-Schnitt 14,24 EUR/qm); konservativ (n. uml. ~50 EUR geschaetzt + Ruecklage ~28 EUR) ~89.000 EUR. Bei 145.000 EUR: CF -136 EUR (App-Logik), konservativ ~-214 EUR, Faktor 28,8, Brutto 3,5 %. Noetiger Nachlass 25-39 % trotz VB und Standzeit seit 04.07. unrealistisch.\nRisiken: Ist-Kaltmiete unbekannt (privater Anbieter nennt sie nicht - Verdacht Altmiete unter 420 EUR, dann noch schlechter; Anhebung nur via Kappungsgrenze 15 %/3 J.); Gas-Zentralheizung Bj. 1994 = Tausch-Risiko/GEG; Hausgeld 160 EUR ohne Split; keine Angaben zu Ruecklage/Protokollen; Klasse D (112 kWh Verbrauch). Vergleich: 2-Zi in Ramersdorf (63 qm, 2 Stellplaetze) fuer 2.825 EUR/qm inseriert - Objekt liegt ~50 % darueber.\nPluspunkte: Mikrolage solide (Telekom-Campus fusslaeufig, Stadtbahnknoten Ramersdorf, A59), gepflegte kleine WEG (9 Einheiten), SW-Balkon, Keller + eigener Stellplatz inkl., Waschkeller, kleines vermietbares Segment. Rettet die Rechnung nicht.\nAnbieterin: Minouche Saller (privat, verkauft auch 2-Zi in gleicher WEG). Erstkontakt-Mail (Ist-Miete, Hausgeld-Split, Ruecklage, Protokolle, Sanierungen/Heizung, Stellplatz-Teileigentum, Verkaufsgrund) entworfen, noch nicht versendet.", "ansprechpartner": "Minouche Saller", "telefon": "", "email": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = '0cb629c2-6689-4847-b002-68ad049f9181'
     or data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/bonn-beuel-ramersdorf-1-zi-etw-mit-balkon-und-autostellplatz-/3450083109-196-1053'
);
