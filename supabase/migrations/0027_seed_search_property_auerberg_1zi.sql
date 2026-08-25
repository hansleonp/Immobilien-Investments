-- Daten-Seed: Immowelt-Inserat b5786490 (Bonn-Auerberg, 1-Zi-Apartment 43 m2, 7. OG, Bj. 1972, vermietet 520 EUR + 50 EUR TG)
-- Erstbewertung 10.08.2026. Idempotent: Insert nur, falls weder id noch Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  '180fba92-69f7-4b0c-a110-453d506d7b2b',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "180fba92-69f7-4b0c-a110-453d506d7b2b", "created_at": "2026-08-10T14:00:00.000Z", "updated_at": "2026-08-10T14:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "Immowelt", "link": "https://www.immowelt.de/expose/b5786490-a442-4953-b976-503cadb6c321", "titel": "1-Zi-Apartment Bonn-Auerberg, 43 m2, 7. OG, Aufzug, Balkon, TG-Stellplatz inkl., vermietet 520+50 EUR", "ort": "Bonn-Auerberg", "adresse": "", "lat": null, "lng": null, "zimmer": 1, "wohnflaeche": 43, "baujahr": 1972, "preis": 135000, "miete": 570, "roiSoll": null, "marktwert": null, "cashflow": 52, "wunschpreis": 125000, "wunschmiete": 570, "datum": "2026-08-10", "notizen": "Analyse 10.08.2026: Kaufen wenn Preis passt (nach Klaerung WEG-Unterlagen). Zielpreis 120.000-125.000 EUR (konservativ traegt ~120.000 EUR); App-Logik ist schon zum Inseratspreis positiv: CF +52 EUR/Monat bei 135.000 EUR, Faktor 19,7, Brutto 5,07 %, Netto 4,61 % - bestes Zahlenwerk im Log auf Ist-Miete. Konservativ (n. uml. ~75 EUR inkl. 43 EUR Ruecklagenzufuehrung + Instandhaltung 34 EUR) ca. -57 EUR zum Inseratspreis.\nMietansatz: Ist-Miete 520 EUR Wohnung (12,09 EUR/m2) + 50 EUR TG-Stellplatz = 570 EUR gesamt, Mieterin seit 2010. Auerberg-Schnitt 11,24-14,95 EUR/m2, 1-Zi Bonn ~15,89 EUR/m2 - leichtes Erhoehungspotenzial via Par. 558 (Kappungsgrenze), bei Neuvermietung eher 560-600 EUR fuer die Wohnung allein.\nRisiken: 1972er Hochhaus (10 Etagen, Aufzug, TG) - Betonsanierung/Fassade/Dach/Aufzug/TG-Abdichtung sind teure Gewerke, Ruecklage + Protokolle ENTSCHEIDEND (vgl. Bonner Talweg!); n. uml. Hausgeld-Anteil offen (Hausgeld 225 EUR = 5,2 EUR/m2, davon 43 EUR Ruecklage); Mieterin seit 2010 = Miete nur schrittweise hebbar; Energieausweis-Art unklar (Klasse C fuer Bj. 1972 auffaellig gut - pruefen ob Verbrauchsausweis); Auerberg einfache-mittlere Lage im Bonner Norden.\nPluspunkte: 3.140 EUR/m2 ca. 13-18 % unter Auerberg-Schnitt (3.606-3.849 EUR/m2); Substanz gepflegt: Gas-Zentralheizung 2015 erneuert, Schueco-Fenster 2005, Klasse C; TG-Stellplatz + Keller inkl.; Aufzug; Langzeitmieterin = stabiler Ertrag ohne Leerstandsrisiko; Strassenbahn/Bus an der Auerberger Mitte, 10 Min. zu Fuss zur Rheinpromenade; Bonn Leerstand <1 %.\nAnbieter: Joerg Schuh Immobilienagentur, Hr. Joerg Schuh, Hermannstr. 33, 53225 Bonn, Tel. 0176 20551369, service@makler-schuh.de, Online-ID 26ALM8TR9GE3, Ref. 60, Kaeuferprovision 3,57 % inkl. MwSt. Erstkontakt-Mail entworfen, noch nicht versendet.", "ansprechpartner": "Joerg Schuh (Joerg Schuh Immobilienagentur)", "telefon": "0176 20551369", "email": "service@makler-schuh.de", "wiedervorlage": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = '180fba92-69f7-4b0c-a110-453d506d7b2b'
     or data->>'link' = 'https://www.immowelt.de/expose/b5786490-a442-4953-b976-503cadb6c321'
);
