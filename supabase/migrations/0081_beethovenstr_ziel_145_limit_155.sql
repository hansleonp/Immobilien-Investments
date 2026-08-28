-- Beethovenstr. 50: Nutzer-Entscheidung 28.08.2026 nach Klaerung der echten Miete (620 kalt + 80 Garage = 700):
-- ZIEL 145.000 EUR (Anpassung sobald Mietnachweis vorliegt, Begruendung: Expose-"zusaetzliche" Garagenmiete existiert
-- nicht separat - 8.400 p.a. enthalten die Garage bereits), ABSOLUTES LIMIT 155.000 EUR (= das bereits abgegebene Gebot;
-- nur falls Verkaeufer sofort bedingungslos annimmt). Taktik: bis Mietnachweis/Antwort schweigen, Frist 10.09. laeuft.

update public.search_properties
set
  data = data || jsonb_build_object(
    'wunschpreis', 145000,
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', 'a7d94c30-6b18-4f52-9e0c-84f2b1d7e646',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'ENTSCHEIDUNG: Ziel 145.000 / absolutes Limit 155.000 (nach Klaerung Miete 620+80). Anpassung des 155er-Gebots erfolgt ueber Vorbehalt 1, sobald der Mietnachweis vorliegt. Bis dahin schweigen.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'ENTSCHEIDUNG 28.08.2026 (nach Klaerung der echten Miete): ZIELPREIS 145.000 EUR, ABSOLUTES LIMIT 155.000 EUR (= das abgegebene Gebot; gilt nur, falls der Verkaeufer sofort und bedingungslos annimmt - die A-Lage-Wette mit Auszugs-Szenario ~7,5 % und Wertaufholung). Spielzug: Das 155er-Gebot bleibt unangetastet liegen (unverbindlich bis Notar, Frist 10.09.); sobald Titze den Mietkontoauszug liefert (Vorbehalt 1) und dieser 700 EUR Gesamteingang zeigt, greift die Anpassung auf 145.000 mit wasserdichter Begruendung: Die im Expose genannten 8.400 EUR p.a. enthalten laut Mietvertraegen bereits die Garage (620 Wohnung + 80 Garage); die als "zusaetzlich" beschriebenen 90 EUR existieren nicht separat. Falls Titze vorher annehmen will: "Gern - sobald die drei Vorbehalte erfuellt sind." Bei 145.000: EK-Rendite realistisch ~4,7-5,8 %, Liquiditaet -88 bis -188 EUR/M; 6-%-Ziel je Szenario 116-142 T.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';

update public.inspections
set
  report = report || jsonb_build_object(
    'naechsteSchritte', 'Gebot 155.000 € liegt (befristet 10.09.). NEUE MARKEN nach Mietklärung (620 kalt + 80 Garage): Ziel 145.000 €, absolutes Limit 155.000 €. Anpassung auf 145 erfolgt über Vorbehalt 1, sobald der Mietkontoauszug vorliegt (Begründung: Exposé zählte Garagenmiete doppelt). Bis dahin: schweigen, Frist arbeiten lassen. Danach: Handwerker-Zweitbesichtigung + Mieter kennenlernen; vor Notar TE-Fehler Garage/Läden klären.'
  ),
  updated_at = now()
where id = 'b7f3c2a1-9d4e-4f6b-8a21-3c5d9e7f0a12';
