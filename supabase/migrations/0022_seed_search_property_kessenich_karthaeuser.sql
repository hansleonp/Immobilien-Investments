-- Daten-Seed: IS24-Inserat 169814937 (Bonn-Kessenich, Karthaeuserstr. 13, 1-Zi-Apartment 30 m2, 1. OG, bezugsfrei ab 01.09.2026, Privatverkauf)
-- Erstbewertung 07.08.2026. Idempotent: Insert nur, falls weder id noch Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  '5b70b69f-cf88-40b4-a824-c868615c5061',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "5b70b69f-cf88-40b4-a824-c868615c5061", "created_at": "2026-08-07T12:00:00.000Z", "updated_at": "2026-08-07T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "ImmoScout24", "link": "https://www.immobilienscout24.de/expose/169814937", "titel": "Charmantes 1-Zimmer-Apartment mit Balkon und Kellerraum in Kessenich", "ort": "Bonn-Kessenich", "adresse": "Karthaeuserstr. 13", "lat": null, "lng": null, "zimmer": 1, "wohnflaeche": 30, "baujahr": 1969, "preis": 139500, "miete": 420, "roiSoll": null, "marktwert": null, "cashflow": -115, "wunschpreis": 109000, "wunschmiete": 420, "datum": "2026-08-07", "notizen": "Analyse 07.08.2026: Finger weg zum Inseratspreis. Zielpreis ~109.000 EUR (App-Logik CF 0: 109.500 EUR; konservativ mit n. uml. Hausgeld ~50 EUR geschaetzt + Ruecklage ~24 EUR nur ~90.000 EUR). Bei 139.500 EUR: CF -115 EUR/Monat (konservativ ~-189 EUR), Faktor 27,7, Brutto 3,61 %, Netto 3,28 %. Noetiger Nachlass 22-35 % bei tagesfrischem Inserat (online 07.08.2026, provisionsfrei von privat) unrealistisch.\nMietansatz: Vergleichsmiete 420 EUR kalt (14 EUR/m2) - Mietspiegel Kessenich 2026 Spanne 12,44-17,28 EUR/m2, Schnitt 14,26; kleine Apartments liegen eher oberhalb, aber einfache Ausstattung ohne echte Kueche (nur Kochnische) rechtfertigt konservativen Ansatz. Bezugsfrei ab 01.09.2026 = freie Mieterwahl, aber kein Altmiete-Hebel - 420 EUR ist bereits Marktansatz.\nRisiken: Zweifamilienhaus mit Hausgeld 178 EUR (5,9 EUR/m2 - hoch fuer 30 m2) = Mini-WEG, Ruecklage/Verwaltung/Anzahl Einheiten unklar, Instandhaltungslast auf sehr wenige Parteien verteilt; Oel-Zentralheizung im 1969er-Gebaeude (Heizungs-Baujahr unbekannt, GEG-Tauschrisiko), Bedarfsausweis 149 kWh/m2a = Klasse E, Ausstattung einfach/zweckmaessig, keine Kueche; 4.650 EUR/m2 ist Kessenich-Mittelfeld ohne Abschlag fuer Substanz/Heizung.\nPluspunkte: Mikrolage gut (Mietspiegel-Stufe gut, 250 m zur Geschaeftsstrasse, ruhig unterm Venusberg), grosser Balkon (4,40 x 1,62 m), Keller, provisionsfrei, 1-Zi-Segment in Kessenich liquide vermietbar.\nAnbieter: privat, Herr Klaus Altena (Kontakt nur ueber IS24-Formular). Erstkontakt-Mail entworfen, noch nicht versendet.", "ansprechpartner": "Klaus Altena (privat)", "telefon": "", "email": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = '5b70b69f-cf88-40b4-a824-c868615c5061'
     or data->>'link' = 'https://www.immobilienscout24.de/expose/169814937'
);
