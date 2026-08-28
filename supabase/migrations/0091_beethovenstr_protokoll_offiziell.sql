-- Beethovenstr. 50: Offizielle Zusendung des ETV-Protokolls 03.08.2026 (Titze-Mail 28.08.) per MD5 verifiziert —
-- byte-identisch mit der bereits ausgewerteten, urspruenglich falsch benannten Datei. Vorbehalt 2 formal erfuellt.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', '7b3e5a90-2c46-4d18-9f7a-c50d81e264b3',
          'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'text', 'ETV-Protokoll 03.08.2026 offiziell von Titze erhalten und per MD5 verifiziert: byte-identisch mit der bereits ausgewerteten Version. VORBEHALT 2 ERFUELLT. Offen bleiben: Mietnachweis (Vorbehalt 1) und Zweitbesichtigung (Vorbehalt 3).'
        )
      )
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
