-- Beethovenstr. 50: Spielzug korrigiert 28.08.2026 (Nutzer-Feedback: keine proaktive Gebotssenkung, kein Gesichtsverlust).
-- 155.000 gilt unveraendert bis Fristablauf 10.09.; Annahme zu 155 = dokumentierter Kompromissfall, wird gehalten.
-- Erst NACH Fristablauf (Angebot erlischt von selbst) ggf. neue Runde mit 145.000 auf Mietnachweis-Basis.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'SPIELZUG KORRIGIERT 28.08.2026 (Nutzer-Entscheid): KEINE proaktive Senkung auf 145 und keine Anpassungs-Mail waehrend der Laufzeit. Das 155er-Gebot steht bis 10.09. und wird bei Annahme GEHALTEN (dokumentierter Kompromissfall: A-Lage, 4-5 % Basis + Auszugs-/Wertaufholungs-Upside). Laeuft die Frist ab, erlischt das Angebot von selbst - erst in einer dann neuen Verhandlungsrunde gilt Ziel 145.000 (Begruendung Mietnachweis/Doppelzaehlung). Absolutes Limit bleibt 155.000. Prozess-Lehre festgehalten: Gebots-Anker kuenftig immer auf der konservativsten belegten Zahl (siehe inserat-learnings.md 28.08.).'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
