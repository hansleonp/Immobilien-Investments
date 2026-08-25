-- Update: Bonn-Weststadt, Beethovenstr. 50 — Ergaenzung Verkaeuferseite 12.08.2026.
-- Eigentuemer wohnt in Norwegen, Kommunikation laeuft ueber dessen Sohn mit Makler Hrn. Titze (PlanetHome).
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'notizen',
      (data->>'notizen')
      || E'\n' || 'Verkaeuferseite (Stand 12.08.2026): Eigentuemer wohnt in Norwegen, Kommunikation laeuft ueber dessen Sohn mit Hrn. Titze. Einordnung: Fernbesitz ohne aktive Eigenverwaltung spricht tendenziell fuer Verkaufsbereitschaft ohne Preisfantasie - aber laengere Entscheidungswege einplanen (jede Rueckfrage laeuft ueber zwei Stationen); Angebote schriftlich und mit klarer Frist platzieren.'
  ),
  updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/vermietete-2-zimmer-eigentumswohnung-mit-garage-im-musikerviertel-der-bonner-weststadt/3470543584-196-23685';
