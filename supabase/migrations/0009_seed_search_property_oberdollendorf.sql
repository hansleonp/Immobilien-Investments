-- Daten-Seed: Immowelt-Inserat c292f010 (Königswinter-Oberdollendorf)
-- in den Immobilien-Reiter der Besichtigungs-App (search_properties).
-- Idempotent; user_id = Besitzer der vorhandenen Zeilen (Fallback: erster Auth-User).
insert into public.search_properties (id, user_id, data, updated_at)
select
  '9606de5b-5f54-422c-a296-4172bd97d20e',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "9606de5b-5f54-422c-a296-4172bd97d20e", "created_at": "2026-07-30T12:00:00.000Z", "updated_at": "2026-07-30T12:00:00.000Z", "fav": true, "neu": true, "status": ["Neu"], "quelle": "Immowelt", "link": "https://www.immowelt.de/expose/c292f010-d80f-4478-b0b0-84e6e7d4d845", "titel": "Solide Eigentumswohnung in Oberdollendorf *provisionsfrei*", "ort": "Königswinter-Oberdollendorf", "adresse": "", "lat": null, "lng": null, "zimmer": 2, "wohnflaeche": 37.3, "baujahr": 1992, "preis": 129000, "miete": 391, "roiSoll": null, "marktwert": null, "cashflow": -104, "wunschpreis": 102000, "wunschmiete": 391, "datum": "2026-07-30", "notizen": "Analyse 30.07.2026: Finger weg zum Inseratspreis (Faktor 27,5, CF −104 €/konservativ −207 €). Ziel ~102.000 €, konservativ 75–83 T€. TG-Stellplatz Nr. 65 inkl., vermietet seit 08/2015 (356 € + 35 € TG), Hausgeld 194,18 € (73 € n. uml.), Klasse C, Gasheizung Bj. 1992. DOERING-IMMOBILIEN, Fr. Bennerscheid, Ref. DOA39.", "docs": []}'::jsonb,
  now()
where not exists (select 1 from public.search_properties where id = '9606de5b-5f54-422c-a296-4172bd97d20e')
  and not exists (
    select 1 from public.search_properties
    where data->>'link' = 'https://www.immowelt.de/expose/c292f010-d80f-4478-b0b0-84e6e7d4d845'
  );
