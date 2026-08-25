-- Daten-Seed: Immowelt-Inserat f78c6ef5 (Bonn-Gronau, 2-Zi-ETW 72 m2, 1. OG, Bj. 1980, bezugsfrei, TG-Stellplatz +20.000 EUR)
-- Erstbewertung 10.08.2026. Idempotent: Insert nur, falls weder id noch Link bereits existieren.

insert into public.search_properties (id, user_id, data, updated_at)
select
  '477ab900-af11-4c22-b204-c7f500847e12',
  coalesce(
    (select user_id from public.search_properties order by updated_at desc limit 1),
    (select id from auth.users order by created_at limit 1)
  ),
  '{"id": "477ab900-af11-4c22-b204-c7f500847e12", "created_at": "2026-08-10T12:00:00.000Z", "updated_at": "2026-08-10T12:00:00.000Z", "fav": false, "neu": true, "status": ["Neu"], "quelle": "Immowelt", "link": "https://www.immowelt.de/expose/f78c6ef5-96dd-45ba-bdfb-89b6a2ec0bd9", "titel": "2-Zi-ETW Bonn-Gronau, 72 m2, 1. OG, Balkon, bezugsfrei (TG-Stellplatz +20.000 EUR)", "ort": "Bonn-Gronau", "adresse": "", "lat": null, "lng": null, "zimmer": 2, "wohnflaeche": 72, "baujahr": 1980, "preis": 258000, "miete": 864, "roiSoll": null, "marktwert": null, "cashflow": -126, "wunschpreis": 225000, "wunschmiete": 864, "datum": "2026-08-10", "notizen": "Analyse 10.08.2026: Beobachten. Zielpreis ~225.000 EUR (App-Logik CF 0 bei Vergleichsmiete 864 EUR); konservativ traegt erst ~197.000 EUR (mit realistischem n. uml. Anteil von ~150 EUR beim Hausgeld 601 EUR sogar nur ~171.000 EUR). Bei 258.000 EUR: CF -126 EUR/Monat (App-Logik), konservativ (n. uml. 50 EUR geschaetzt + Ruecklage 57,60 EUR) ca. -233 EUR; Faktor 24,9; Brutto 4,02 %, Netto 3,65 %. Noetiger Nachlass ~13 % (App) bis ~24 % (konservativ).\nMietansatz: Vergleichsmiete 12,00 EUR/m2 = 864 EUR kalt (konservativ; Gronau-Schnitt Q1/2026 13,22 EUR/m2, Spanne 12,99-17,47 - Abschlag wegen Bad Bj. 1980). Bezugsfrei = freie Mieterwahl, aber kein Altmiete-Hebel.\nRisiken: Hausgeld 601 EUR = 8,35 EUR/m2 extrem hoch (Aufschluesselung offen - vermutlich inkl. Heizkosten wegen zentraler FBH, trotzdem klaeren!); Energieausweis Klasse H (neuer Ausweis nach Heizungsumstellung in Vorbereitung - Huelle Bj. 1980 vermutlich weiter schwach); Bad Original 1980 = Modernisierungs-Capex ~8-12 T EUR; Finanzierung der Heizungsumstellung (Gas-Hybrid + WP-Module) und Kellerdeckendaemmung unklar (Ruecklage oder Sonderumlage?); TG-Stellplatz +20.000 EUR - Pflichtkauf oder optional unklar (als eigene Rechnung: bei ~80 EUR TG-Miete Faktor 20,8, grenzwertig ok).\nPluspunkte: 3.583 EUR/m2 = ~26 % unter Gronau-Schnitt (4.854 EUR/m2 Q1/2026), Top-Mikrolage (Bundesviertel, DHL/Telekom, Rheinauen, Stadtbahn), sehr gute Vermietbarkeit im 2-Zi-Segment, kleine WEG (11 Einheiten, 2 Gebaeude) investiert aktiv (Heizung modernisiert, Kellerdecke gedaemmt), Fussbodenheizung, grosser ueberdachter Balkon.\nAnbieter: Diekmann Immobilien Bonn, Hr. Manuel Diekmann, Richard-Wagner-Str. 20, 53115 Bonn (keine Telefonnummer im Inserat), Online-ID 259U76R2VI4M, Ref. DIB0250CL-8-8-88, Kaeuferprovision 3 % inkl. MwSt. Erstkontakt-Mail entworfen, noch nicht versendet.", "ansprechpartner": "Manuel Diekmann (Diekmann Immobilien Bonn)", "telefon": "", "email": "", "history": [], "docs": []}'::jsonb,
  now()
where not exists (
  select 1 from public.search_properties
  where id = '477ab900-af11-4c22-b204-c7f500847e12'
     or data->>'link' = 'https://www.immowelt.de/expose/f78c6ef5-96dd-45ba-bdfb-89b6a2ec0bd9'
);
