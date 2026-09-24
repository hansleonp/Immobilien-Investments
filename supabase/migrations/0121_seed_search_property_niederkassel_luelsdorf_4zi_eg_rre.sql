-- Daten-Seed: Kleinanzeigen 3443930764 (Rheinland Real Estate RRE e.K., Ref. 2026-366).
-- Niederkassel-Lülsdorf (53859), 4 Zi, 84 m2, EG, Bj. 1969, 2 Balkone, Aufzug, vermietet 655 EUR kalt.
-- Kaufpreis 120.000 EUR + 3,57 % Käuferprovision, Hausgeld 695 EUR. Online seit 17.09.2026.
-- Vermutlich dieselbe WEG wie Dresdener Str. 2/2a (unbestätigt). Erstbewertung 24.09.2026.
-- Idempotent: Insert nur, falls weder id noch Link existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  'b2702b37-9df2-4198-b9d8-312d484b8fdf',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "b2702b37-9df2-4198-b9d8-312d484b8fdf", "created_at": "2026-09-24T12:00:00.000Z", "updated_at": "2026-09-24T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "Kleinanzeigen", "link": "https://www.kleinanzeigen.de/s-anzeige/anzeige/3443930764-196-1672", "titel": "4-Zi-ETW 84 qm, EG, 2 Balkone, Aufzug, vermietet 655 EUR, Bj. 1969 (RRE, Ref. 2026-366)", "ort": "Niederkassel-Lülsdorf (53859)", "adresse": "", "lat": null, "lng": null, "zimmer": 4, "wohnflaeche": 84, "baujahr": 1969, "preis": 120000, "miete": 655, "roiSoll": null, "marktwert": null, "cashflow": 166, "nichtUmlagefaehig": 184, "wunschpreis": 110000, "wunschmiete": 655, "datum": "2026-09-17", "notizen": "Analyse 24.09.2026: **Kaufen wenn Preis passt (unter Vorbehalt Wirtschaftsplan)** – Gebot/Ziel 110.000 EUR, Decke 120.000 EUR (Rechen-6-%-Preis 125.000 bei geschätzter Eigentümerlast 184 EUR/M = MEA-Hochrechnung der Nachbareinheit inkl. WEG-Kreditanteil). Faktor 15,3 Angebot / 14,0 Ziel. Cashflow App-Logik +166 EUR/M, Liquidität konservativ −18 EUR/M. EK-Rendite 6,5 % Angebot / 7,7 % am Ziel; Stress 0 %: 3,0 % / 4,3 %.\nAnlage: sehr wahrscheinlich dieselbe WEG Dresdener Str. 2/2a (Bj. 68/69, Aufzug, Lülsdorf, Hausgeld-Signatur 695 EUR = 8,27 EUR/qm) – NICHT bestätigt, Adresse fehlt. Falls ja: Strangsanierung 2026 mit WEG-Kredit, Anteil ~13 T EUR (MEA) entweder bezahlt oder als Kreditrate im Hausgeld – klären! Rücklage nach Entnahme 200 T gering.\nRisiken: EG im 8-Geschosser, Klasse F, Chemiepark Lülsdorf (Störfallbetrieb) in der Nähe, kein Schienenanschluss, viele Einheiten parallel am Markt. Käuferprovision 3,57 %.\nMietansatz: Ist 655 EUR (7,80 EUR/qm), unter Markt (~9–10 EUR/qm real für 60er-Bestand); Warmmiete 1.035 EUR. Vertragstyp unbekannt.\nKontakt: Enes Atas, RRE e.K., 0163 8897788 / 0221 95019851, info@rheinland-realestate.de. Mail entworfen, nicht versendet.", "ansprechpartner": "Enes Atas, Rheinland Real Estate RRE e.K.", "telefon": "0163 8897788", "email": "info@rheinland-realestate.de", "wiedervorlage": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (select 1 from public.search_properties where id = 'b2702b37-9df2-4198-b9d8-312d484b8fdf')
  and not exists (select 1 from public.search_properties where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/anzeige/3443930764-196-1672');
