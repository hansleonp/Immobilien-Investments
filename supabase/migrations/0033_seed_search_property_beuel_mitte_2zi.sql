-- Daten-Seed: IS24-Inserat 169970812 (Bonn Beuel-Mitte, 2-Zi-ETW 53 m2, Terrasse + Gartenzugang, Bj. 1970, 175.000 EUR)
-- Erstbewertung 12.08.2026: Finger weg (Souterrain-Verdacht, Heizung 1997, ~Klasse F, noetiger Nachlass 14-27 % unrealistisch).
-- Idempotent: Insert nur, falls weder id noch Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  '359cb0ef-4f78-4d2e-840c-3fc122a6ad37',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "359cb0ef-4f78-4d2e-840c-3fc122a6ad37", "created_at": "2026-08-12T12:00:00.000Z", "updated_at": "2026-08-12T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "ImmoScout24", "link": "https://www.immobilienscout24.de/expose/169970812", "titel": "2-Zi-ETW Bonn Beuel-Mitte, 53 m2, Terrasse + Gartenzugang, Bj. 1970, EG lt. Steckbrief / Untergeschoss lt. Beschreibung", "ort": "Bonn-Beuel-Mitte", "adresse": "", "lat": null, "lng": null, "zimmer": 2, "wohnflaeche": 53, "baujahr": 1970, "preis": 175000, "miete": 580, "roiSoll": null, "marktwert": null, "cashflow": -91, "wunschpreis": 151000, "wunschmiete": 580, "datum": "2026-08-12", "notizen": "Analyse 12.08.2026: FINGER WEG. Zielpreis CF +-0 (App-Logik) ~151.000 EUR, konservativ ~127.000 EUR — noetiger Nachlass 14-27 % auf ein tagesfrisches Inserat (online 12.08.2026, IS24-Preislabel: ausgezeichneter Preis) unrealistisch. Zum Inseratspreis 175.000 EUR: CF -91 EUR/Monat (konservativ ~-184 EUR mit n. uml. ~50 EUR geschaetzt + Instandhaltung 42 EUR), Faktor 25,1, Brutto 3,98 %, Netto 3,62 %.\nDealbreaker/Risiken: Beschreibung nennt Untergeschoss, Steckbrief Erdgeschosswohnung — Souterrain-Verdacht (Feuchte-/Licht-/Wiederverkaufsrisiko, drueckt Miete und Wert); Gaszentralheizung von 1997 (Tausch absehbar, GEG); Verbrauch 161,7 kWh/m2a ~Klasse F (Sanierungsrisiko 1970er-Haus); Hausgeld 290 EUR = 5,47 EUR/m2 hoch (n. uml. Anteil offen); vermutlich bezugsfrei = kein Altmiete-Hebel; Ruecklage/Protokolle offen; Modernisierung zuletzt 2026 laut Inserat — was genau, unklar.\nMietansatz: Vergleichsmiete konservativ 580 EUR kalt (10,94 EUR/m2) — Mietspiegel Beuel Ø 11,74 EUR/m2, Beuel-Mitte 11,99-15,86 EUR/m2, Abschlag wegen UG/Souterrain.\nPluspunkte: 3.302 EUR/m2 deutlich unter Beuel-Schnitt (~3.950-4.600 EUR/m2), gefragte Mikrolage Beuel-Mitte (Rheinnaehe, OePNV), Terrasse + Gartenzugang, liquides 2-Zi-Segment — rettet die Rechnung nicht.\nAnbieter: Deutsche Bank Immobilien GmbH, Fr. Bettina Boenig, Objekt-ID 42520108-111546. Erstkontakt-Mail entworfen (nicht versendet).", "ansprechpartner": "Bettina Boenig (Deutsche Bank Immobilien GmbH)", "telefon": "0179 9485247", "email": "bettina.boenig@db.com", "wiedervorlage": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = '359cb0ef-4f78-4d2e-840c-3fc122a6ad37'
     or data->>'link' = 'https://www.immobilienscout24.de/expose/169970812'
);
