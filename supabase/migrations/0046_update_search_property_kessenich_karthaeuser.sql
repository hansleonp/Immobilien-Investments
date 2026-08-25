-- Nachbewertung 17.08.2026: IS24 169814937 (Bonn-Kessenich, Karthaeuserstr. 13, 1-Zi-Apartment 30 m2)
-- Verkaeufer-Antwort + Unterlagen (Einzelabrechnungen 2023/2024, WP 2025/2026, ETV-Protokolle 2023-2025, Energieausweis 2020).
-- Update der bestehenden Zeile (Match ueber data->>'link'), kein neuer Seed.

update public.search_properties
set
  data = jsonb_set(
           jsonb_set(
             jsonb_set(
               jsonb_set(
                 data,
                 '{notizen}',
                 to_jsonb('Nachbewertung 17.08.2026 (Unterlagen vom Verkaeufer): Finger weg zum Inseratspreis - Urteil bestaetigt, Risikobild praezisiert. Zielpreis ~109.000 EUR (App-Logik CF 0: 109.500 EUR; konservativ mit realen Zahlen ~88.000 EUR). Bei 139.500 EUR: CF -115 EUR/Monat (konservativ -196 EUR), Faktor 27,7. Noetiger Nachlass 22-37 % unrealistisch.\nKORREKTUR zur Erstbewertung: KEIN Zweifamilienhaus - WEG mit 27 Einheiten (1.002 m2, 15 Eigentuemer), professionelle Verwaltung (Hansen & Hansen, bestellt bis 2027, davor FOCUS). Einheit = OG Appartement 20, MEA 35,93/1.000.\nEchte Zahlen: Hausgeld 177,94 EUR (WP 2026) = Inserat korrekt; Split: umlagefaehig ~96 EUR, nicht umlagefaehig 51,12 EUR, Ruecklagenzufuehrung 29,94 EUR -> reale Eigentuemerlast 81 EUR/Monat. Erhaltungsruecklage 68.701 EUR per 31.12.2024 (~69 EUR/m2, Anteil Einheit ~2.468 EUR), Zufuehrung nur 10.000 EUR/Jahr.\nRisiken aus Protokollen: (1) Heizung ist Waerme-CONTRACTING Fa. Knauber (Energieausweis: Fern-/Nahwaerme; Inserat sagt faelschlich Bedarfsausweis/Oel - real VERBRAUCHSausweis 149 kWh Klasse E, gueltig bis 23.03.2030); Vertrag laeuft lt. Verkaeufer nur noch wenige Jahre, in den Protokollen 2023-2025 KEIN Wort dazu - danach steht die GEG-Heizungsfrage im ungedaemmten 1969er-Haus an. (2) Dach: Sonderrueckstellung 250.000 EUR (2023) UND Ruecklagen-Erhoehung auf 15.000 EUR/J. ABGELEHNT; ETV 2025 laesst Dach erneut begehen -> Massnahme kommt absehbar als Sonderumlage (Anteil ~3,6 % = ~9.000 EUR bei 250k). (3) Terrassen/Rattenproblem: 21.000-EUR-Massnahme seit 2023 beschlossen, nicht umgesetzt. (4) Abwasserleitungen marode, Teilsanierung 7.298 EUR aus Ruecklage. (5) Modernisierungsempfehlungen: Daemmung Dach/Wand/Fenster/Kellerdecke pruefen = Huelle unsaniert.\nMietansatz unveraendert 420 EUR kalt (14 EUR/m2, Mietspiegel Kessenich 12,44-17,28, Schnitt 14,26); NK-Plausibilitaet: Mieter zahlte zuletzt 95 EUR NK, umlagefaehig real ~92-96 EUR - passt. Vormieter-Kaltmiete weiter unbekannt.\nVermoegensaufbau am Zielpreis 109.000 EUR: EK 21.800, Rate 418 EUR (Zins 251/Tilgung 167), Restschuld n. 10 J. ~77.000 EUR; Zuwachs 10 J: +4.600 EUR (0 % Wert) bzw. +22.100 EUR (1,5 %/J.) = EK-Rendite 1,9-7,2 % p.a.\nOffen: Knauber-Vertrag (Restlaufzeit/Konditionen/Plan danach), Dach-Begehungsergebnis, Stand Terrassenmassnahme, TE/Aufteilungsplan, Grundbuch, Wohnflaechenberechnung, Rechtsfall Huesch (Abrechnung 2024), Vormieter-Kaltmiete.\nAnbieter: privat, Klaus Peter Altena, Tel. 0172 8491294, Ettighofferstr. 15, 53123 Bonn (verkauft aus Bestand nach >10 J. Haltedauer bei Mieterwechsel). Antwort-/Nachfass-Mail mit Restfragen + Besichtigungswunsch entworfen, noch nicht versendet.'::text)
               ),
               '{wunschpreis}', to_jsonb(109000)
             ),
             '{telefon}', to_jsonb('0172 8491294'::text)
           ),
           '{updated_at}', to_jsonb(to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
         )
       || jsonb_build_object('ansprechpartner', 'Klaus Peter Altena (privat)', 'cashflow', -115),
  updated_at = now()
where data->>'link' = 'https://www.immobilienscout24.de/expose/169814937';
