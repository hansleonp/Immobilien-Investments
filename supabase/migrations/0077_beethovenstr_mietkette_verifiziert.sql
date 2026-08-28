-- Beethovenstr. 50: Mietkette aus Vertrag + Erhoehungsschreiben praezisiert (28.08.2026), Anlass: Aussage eines
-- Mitinteressenten bei der Besichtigung ("700 kalt seit 2022"). Ergebnis: 700 kalt ab 06/2023 ist die belastbare
-- Lesart; Pruefkriterium Mietkonto = 780 EUR/M Eingang (700 kalt + 80 NK-VZ).

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', '8a4f1b63-2c9d-4e57-a0b8-f13e6d92c470',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'Mietkette verifiziert: 600 (2017) -> 650 (Schreiben fehlt) -> 700 kalt ab 01.06.2023. "Seit 2022" (Mitinteressent) = nur Briefdatum 09.04.2022, Text sagt 2x Juni 2023. Pruefkriterium Mietkonto: 780 EUR/M Eingang = 700 kalt bestaetigt; nur 700 EUR/M = kalt 620 -> Gebot neu rechnen.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'MIETKETTE PRAEZISIERT 28.08.2026 (Anlass: Mitinteressent bei Besichtigung behauptete "700 kalt seit 2022"): Mietvertrag Par. 4 belegt Start 15.09.2017 mit 600 KALT + 50 BK + 30 Heizkosten = 680 gesamt. Einziges vorhandenes Erhoehungsschreiben (Datum 09.04.2022, verweist aber auf Mail 03/2023 und nennt 2x Wirkung ab 01.06.2023 - Neuausdruck mit altem Datum): 650 -> 700 (+7,7 %). Die Kette 600 -> 650 -> 700 funktioniert arithmetisch NUR als Kaltmiete (als Gesamtmiete waere sie unter die Start-680 gefallen). Schlusssatz "Gesamtmiete ... insgesamt 700" ist schlampige Formulierung (700 kalt + 80 NK = 780 gesamt). "Seit 2022" stammt wohl nur vom Briefdatum; 06/2023 gilt (deckt sich mit Titze-Telefonat). Waere 2022 doch korrekt, POSITIV: mehr VPI-Spielraum fuer Indexzug (~765 statt ~735). PRUEFKRITERIUM MIETKONTO (Gebots-Vorbehalt 1): Eingang 780 EUR/M = 700 kalt bestaetigt; Eingang nur 700 EUR/M = kalt 620 -> konservativer CF-0 faellt auf ~122 T, Gebot neu verhandeln. Erhoehung 650->700 lief als Par.-558-Schreiben trotz Indexklausel (Par. 5 schliesst 558 aus) - durch Zahlung einvernehmlich wirksam.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
