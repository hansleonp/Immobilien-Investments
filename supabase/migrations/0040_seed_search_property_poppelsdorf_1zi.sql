-- Daten-Seed: ImmoScout24-Inserat 170005348 (Bonn Poppelsdorf, 1-Zi-Whg ca. 33,25 m2, Bj. 1972, 3. OG mit Aufzug, Balkon, vermietet 530 EUR kalt mit Staffel, 169.000 EUR, provisionsfrei/privat via ohne-makler.net)
-- Erstbewertung 14.08.2026. Idempotent: Insert nur, falls weder id noch Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  '24374657-d515-4557-8d87-ef0957578cb3',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "24374657-d515-4557-8d87-ef0957578cb3", "created_at": "2026-08-14T09:00:00.000Z", "updated_at": "2026-08-14T09:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "ImmoScout24", "link": "https://www.immobilienscout24.de/expose/170005348", "titel": "Kapitalanlage (3,76 % Rendite) - 1-Zimmer WHG mit Balkon in Bonn - Poppelsdorf", "ort": "Bonn Poppelsdorf", "adresse": "", "lat": null, "lng": null, "zimmer": 1, "wohnflaeche": 33.25, "baujahr": 1972, "preis": 169000, "miete": 530, "roiSoll": null, "marktwert": null, "cashflow": -118, "wunschpreis": 138000, "wunschmiete": 530, "datum": "2026-08-13", "notizen": "Erstbewertung 14.08.2026: FINGER WEG zum Inseratspreis. 1-Zi-Whg 33,25 m2, Poppelsdorf (53115), 3. OG von 5 mit Aufzug, Bj. 1972, vollstaendig renoviert, Balkon zur ruhigen Gartenseite, EBK, Keller. 169.000 EUR = 5.083 EUR/m2 (Stadtteilschnitt ~4.980-6.040 EUR/m2 - marktueblich fuer Poppelsdorf, aber nicht cashflow-faehig). Vermietet fuer 530 EUR kalt (15,94 EUR/m2, oberes Drittel der Mietspiegel-Spanne 12,85-17,08 - kaum Mieterhoehungshebel) mit Staffel ~3 %/Jahr ueber 10 Jahre. Faktor 26,6, Brutto 3,76 %, App-CF -118 EUR/M; konservativ ~-195 EUR (n. uml. ~50 EUR geschaetzt + Ruecklage 27 EUR). CF 0 erst bei ~138.000 EUR (konservativ ~118.000) = 18-30 % Nachlass noetig - Inserat erst seit 13.08.2026 online (1 Tag), Privatanbieter, provisionsfrei: kurzfristig unrealistisch. Pluspunkte (neue Gaszentralheizung, Aufzug instandgesetzt, Elektrik aufgeruestet in den letzten 2 Jahren, Top-Vermietbarkeit Poppelsdorf/Uni, eingebaute Staffelmiete) retten die Rechnung nicht. Hausgeld 160 EUR gesamt, n. uml. Anteil und Ruecklage unbekannt. Energie: Verbrauchsausweis 131,9 kWh/m2a, Gas (~Klasse E, Klasse nicht angegeben). Anbieter: Privatangebot via ohne-makler.net (kein Name im Inserat), Objekt-ID 485001, Scout-ID 170005348. Mail-Entwurf 14.08.2026 erstellt (nicht versendet).", "ansprechpartner": "Privatanbieter via ohne-makler.net", "telefon": "", "email": "", "wiedervorlage": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = '24374657-d515-4557-8d87-ef0957578cb3'
     or data->>'link' = 'https://www.immobilienscout24.de/expose/170005348'
);
