-- Niederkassel war ein Missverstaendnis (gemeint: Niederdollendorf). Die drei Lülsdorf-Einheiten (0120-0122)
-- bleiben als Dubletten-Schutz in der App, Status -> Verworfen.
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'status', jsonb_build_array('Verworfen'),
      'notizen', 'VERWORFEN 24.09.2026: ausserhalb Suchgebiet (Niederkassel war Missverstaendnis, gemeint war Niederdollendorf). Keine Kontaktaufnahme.'
                 || E'\n' || coalesce(sp.data->>'notizen',''),
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
where sp.data->>'link' in (
  'https://www.immobilienscout24.de/expose/165427943',
  'https://www.kleinanzeigen.de/s-anzeige/anzeige/3443930764-196-1672',
  'https://www.regionalimmobilien24.de/immobilien/expose/305592502')
  and sp.data->>'notizen' not like 'VERWORFEN 24.09.2026%';
