-- Daten-Seed: IS24-Inserat 169780628 (Bonn-Hochkreuz, Bad Godesberg)
-- in den Immobilien-Reiter der Besichtigungs-App (search_properties).
-- Idempotent; user_id = Besitzer der vorhandenen Zeilen (Fallback: erster Auth-User).
insert into public.search_properties (id, user_id, data, updated_at)
select
  '790bda76-413c-423d-ac73-ea961ba0ecb2',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "790bda76-413c-423d-ac73-ea961ba0ecb2", "created_at": "2026-08-04T12:00:00.000Z", "updated_at": "2026-08-04T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "ImmoScout24", "link": "https://www.immobilienscout24.de/expose/169780628", "titel": "Zentral leben in Gronau – 2-Zimmer-ETW mit Aufzug, Balkon und TG-Stellplatz", "ort": "Bonn-Hochkreuz (Bad Godesberg), 53175", "adresse": "", "lat": null, "lng": null, "zimmer": 2, "wohnflaeche": 68.44, "baujahr": 1967, "preis": 254000, "miete": 720, "roiSoll": null, "marktwert": null, "cashflow": -254, "wunschpreis": 188000, "wunschmiete": 720, "datum": "2026-08-04", "notizen": "Analyse 04.08.2026: FINGER WEG zum Inseratspreis. Zielpreis nach App-Logik ~188.000 €, konservativ 140.000–160.000 € — nötiger Nachlass 26–45 %, bei einem frisch veröffentlichten Makler-Inserat unrealistisch; nicht mal ein Erstgebot lohnt. Allenfalls per Suchagent beobachten, ob der Preis in Monaten deutlich fällt.\n\nZahlen: 254.000 € (3.711 €/m², plus 3,57 % Provision), Faktor 29,4 auf wohlwollende Vergleichsmiete 720 € kalt (10,50 €/m², Objekt mutmaßlich bezugsfrei, keine Ist-Miete). Cashflow zum Inseratspreis −254 € (App-Logik), konservativ −360 bis −440 €. TG-Stellplatz evtl. separat 60–80 €/Monat vermietbar (Upside, nicht eingerechnet).\n\nDealbreaker/Risiken: Hausgeld extrem hoch (436 € = 6,37 €/m², Aufzug + Tiefgarage als Kostentreiber; nicht umlagefähiger Anteil real eher 110–150 €), unsanierter 1967er-Gasbestand mit ~Klasse F (170,8 kWh/m²a, Klasse im Inserat nicht ausgewiesen) → energetisches Sanierungsrisiko der WEG; da leer und schon zum Marktansatz gerechnet: null Mietsteigerungshebel. Titel \"Gronau\" irreführend — Objekt liegt in Hochkreuz (B-Lage in Bad Godesberg, 60er/70er-Zeilenbau).\n\nPluspunkte: Aufzug, Balkon, TG, Stadtbahn Hochkreuz fußläufig (16/63), Rheinaue/Nahversorgung in Gehweite — Vermietbarkeit gut (Singles/Paare, Bundesviertel-Pendler, Senioren), rettet die Rechnung aber nicht.\n\nFehlende Angaben: Hausgeld-Split, Rücklage, ETV-Protokolle, geplante Sanierungen/Sonderumlagen, Teileigentum TG-Stellplatz, Mietstatus, Energieklasse.\n\nAnbieter: Frau Sandra Voß-Labeth, S Immobilienpartner GmbH, Bonn. Scout-ID 169780628, veröffentlicht 04.08.2026. Mail-Entwurf (Unterlagen-Anforderung) liegt in docs/inserat-analysen.md-Kontext bereit, noch nicht versendet.", "docs": []}'::jsonb,
  now()
where not exists (select 1 from public.search_properties where id = '790bda76-413c-423d-ac73-ea961ba0ecb2')
  and not exists (
    select 1 from public.search_properties
    where data->>'link' = 'https://www.immobilienscout24.de/expose/169780628'
  );
