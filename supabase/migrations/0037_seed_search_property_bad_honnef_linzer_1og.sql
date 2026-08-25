-- Daten-Seed: VivaRheni-Website-Inserat (Bad Honnef, Linzer Str. 62, 3-Zi-ETW 82 m2, 1. OG, vermietet 571,94 EUR)
-- Zweite Einheit im selben Haus wie 0019 (EG) - Energieausweis identisch (Klasse D, 112,99, gueltig 15.10.2033).
-- Erstbewertung 13.08.2026. Idempotent: Insert nur, falls weder id noch Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  '5df6f139-0c3f-447c-af9b-e4d64c8f54bd',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "5df6f139-0c3f-447c-af9b-e4d64c8f54bd", "created_at": "2026-08-13T18:00:00.000Z", "updated_at": "2026-08-13T18:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "VivaRheni Website", "link": "https://vivarheni.de/immobilie/rhein-naehe-trifft-zukunftssicherheit-vermietete-3-zimmer-wohnung-in-bad-honnef/", "titel": "Rheinnaehe trifft Zukunftssicherheit: Vermietete 3-Zimmer-Wohnung Bad Honnef (Linzer Str. 62, 1. OG)", "ort": "Bad Honnef", "adresse": "Linzer Str. 62", "lat": null, "lng": null, "zimmer": 3, "wohnflaeche": 82, "baujahr": 1968, "preis": 159000, "miete": 571.94, "roiSoll": null, "marktwert": null, "cashflow": -38, "wunschpreis": 145000, "wunschmiete": 686, "datum": "2026-08-13", "notizen": "Erstbewertung 13.08.2026: Zweite Einheit im selben Haus wie die besichtigte EG-Wohnung (Aufteilungsprojekt Linzer Str. 62) - Energieausweis identisch (Verbrauch, Klasse D, 112,99 kWh, gueltig 15.10.2033), Oel-Zentralheizung 2010, Bj. 1968 (Text nennt 1966/67).\nACHTUNG: Inserat sagt 1. OG - wir dachten 2. OG. Im 2. OG gibt es evtl. eine weitere (renovierte, bezugsfreie 72-m2-)Einheit; klaeren, welche Wohnungen im Haus insgesamt verkauft werden.\nZahlen: 159.000 EUR fuer 82 m2 = 1.939 EUR/m2 (guenstiger pro m2 als EG mit 2.266). Ist-Kaltmiete 571,94 EUR seit 01.07.2017 = nur 6,97 EUR/m2, ca. 40 % unter Markt (11,7-12,5 = 960-1.030 EUR) - noch mehr Luft als bei der EG-Wohnung. Faktor 23,2, Brutto 4,32 %. CF bei 159.000: App-Logik -38 EUR, konservativ (n. uml. ~117 EUR von Hausgeld 304) ca. -155 EUR. App-Logik CF 0 bei ~149.100 EUR.\nMietpotenzial: Bad Honnef kein angespannter Markt -> Kappungsgrenze 20 %/3 J. Falls seit 2017 nie erhoeht: sofort 571,94 -> max. 686 EUR; damit App-CF bei 159.000 +76 EUR, konservativ -41 EUR. Nach weiteren 3 J. -> 823 EUR. Letzte Mieterhoehung klaeren!\nRisiken wie EG-Wohnung: Aufteilungsprojekt ohne WEG-Historie, Ruecklage = 0, Oelheizung 2010 (GEG-Tauschrisiko, Sonderumlage), Hausgeld-Split offen (304 EUR), Kueche gehoert Mieterin. Mieter-Vorkaufsrecht Par. 577 BGB (Umwandlung nach Einzug 2017).\nZielpreis-Idee: ~145.000 EUR (Best-Case-CF +130 EUR bei 686 EUR Miete). Unterlagen (Expose, Miete, Hausgeld-Split) am 13.08.2026 per Mail bei Frau Boehler angefragt - gleiche Gebaeude-Unterlagen wie EG gelten mit.\nAnbieter: VivaRheni Immobilien GmbH, M. Schaefer / Frau Boehler, Tel. 02224 9769751, m.schaefer@vivarheni.de. Kaeuferprovision 3,57 %.", "ansprechpartner": "Frau Boehler / M. Schaefer (VivaRheni Immobilien GmbH)", "telefon": "02224 9769751", "email": "m.schaefer@vivarheni.de", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = '5df6f139-0c3f-447c-af9b-e4d64c8f54bd'
     or data->>'link' = 'https://vivarheni.de/immobilie/rhein-naehe-trifft-zukunftssicherheit-vermietete-3-zimmer-wohnung-in-bad-honnef/'
);
