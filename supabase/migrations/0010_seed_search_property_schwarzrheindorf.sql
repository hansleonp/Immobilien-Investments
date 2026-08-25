-- Daten-Seed: IS24-Inserat 169748693 (Bonn-Beuel, Schwarzrheindorf/Vilich-Rheindorf)
-- in den Immobilien-Reiter der Besichtigungs-App (search_properties).
-- Idempotent; user_id = Besitzer der vorhandenen Zeilen (Fallback: erster Auth-User).
insert into public.search_properties (id, user_id, data, updated_at)
select
  '2b2bdc8d-5a6d-40a6-8f39-ab36220640b5',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "2b2bdc8d-5a6d-40a6-8f39-ab36220640b5", "created_at": "2026-08-03T12:00:00.000Z", "updated_at": "2026-08-03T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "ImmoScout24", "link": "https://www.immobilienscout24.de/expose/169748693", "titel": "4-Zimmer-Wohnung zur individuellen Neugestaltung – mit großem Balkon und Garage", "ort": "Bonn-Beuel, Schwarzrheindorf/Vilich-Rheindorf", "adresse": "", "lat": null, "lng": null, "zimmer": 4, "wohnflaeche": 91, "baujahr": 1971, "preis": 215000, "miete": 790, "roiSoll": null, "marktwert": null, "cashflow": -35, "wunschpreis": 175000, "wunschmiete": 790, "datum": "2026-08-03", "notizen": "WIEDERVORLAGE: 17.–24.08.2026 (in 2–3 Wochen erneut anschauen) — prüfen, ob der Preis gefallen ist bzw. ob Energieausweis, Rücklage und ETV-Protokolle inzwischen vorliegen.\n\nAnalyse 03.08.2026: Finger weg zum Inseratspreis. Zielpreis 175.000 €, Erstgebot 165.000 €, harte Schmerzgrenze 180.000 €. Cashflow bei 215.000 €: −35 € (App-Logik) / −158 bis −183 € konservativ; Faktor 22,7; Substanz 2.363 €/m² = ca. 44 % unter Stadtteil-Ø (4.207 €/m²).\nMiete 790 € = Vergleichsmiete (730 € Wohnung + 60 € Garage) — Objekt ist BEZUGSFREI, keine Ist-Miete.\n\nDealbreaker: Nachtspeicheröfen (Strom) UND Fenster im Sondereigentum = 100 % Eigentümer-Capex ohne WEG-Beteiligung; Warmmieten-Deckel ~375 €/Monat Heizstrom; Energieklasse absehbar G/H (Ausweis liegt noch nicht vor). Sanierungsbedarf laut Inserat umfassend: Minimalpaket ~40.000 €, Vollsanierung ~120.000 € → all-in dann ~3.970 €/m² = Marktwert ohne Wertschöpfung.\nWeitere Risiken: Hochwasserlage (Schwarzrheindorf/Beuel tiefstgelegene Bereiche Bonns — Keller und Garage betroffen, Elementarschadenversicherung prüfen), kein Stadtbahnanschluss, keine Angaben zu Rücklage/Wirtschaftsplan/Protokollen.\nPluspunkte: bezugsfrei (freie Mieterwahl, keine Altmiete), Garage inkl., 4 Zi/91 m² knappes Segment, Hausgeld niedrig (186,58 €, aber ohne Heizung).\n\nAnbieter: Immobilien A. Werning, Herr C. Alexander Werning, Bad Honnef — Provision 3,57 %. Objekt-ID 9825. Mail-Entwurf (Fragen zu Balkonanteil, Wärmeversorgung, Hausgeld-Split, Protokollen, Energieausweis, Hochwasser) liegt in docs/inserat-analysen.md-Kontext bereit, noch nicht versendet.", "docs": []}'::jsonb,
  now()
where not exists (select 1 from public.search_properties where id = '2b2bdc8d-5a6d-40a6-8f39-ab36220640b5')
  and not exists (
    select 1 from public.search_properties
    where data->>'link' = 'https://www.immobilienscout24.de/expose/169748693'
  );
