-- Beethovenstr. 50: Nutzer-Entscheidung 28.08.2026 — hartes Limit 160.000 EUR bestaetigt (vorher Empfehlung in 0078).
-- Verhandlungsrahmen final: Gebot 155.000 (liegt vor, befristet 10.09.), hartes Limit 160.000.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', '6e2d9a58-1f43-4b07-8c6a-52f8e0d31b94',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'ENTSCHEIDUNG: Hartes Limit 160.000 EUR bestaetigt (nach ETV-Protokoll-Auswertung: Brandschutz, Kapitalerhoehung ~80 T, Ruecklage 30,8 T). Rahmen final: Gebot 155.000 liegt vor, Limit 160.000.'
        )
      ),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'ENTSCHEIDUNG 28.08.2026: Hartes Limit 160.000 EUR vom Nutzer BESTAETIGT (Empfehlung aus der ETV-Protokoll-Auswertung uebernommen). Verhandlungsrahmen final: Gebot 155.000 liegt auf dem Tisch (befristet 10.09.2026), hartes Limit 160.000 - darueber ist Schluss, unabhaengig von Gegenangeboten.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
