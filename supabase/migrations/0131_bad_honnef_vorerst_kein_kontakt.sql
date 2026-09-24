-- Nutzerentscheid 24.09.2026: Bad Honnef Zentrum 2-Zi (Werning) sowie BAG0633 (71 m2) und LOR0625 (69 m2, beide Staffel/Wilke)
-- ueberzeugen nicht -> vorerst KEIN Kontakt. Status bleibt, nur Notiz; Gmail-Entwuerfe werden nicht versendet.
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'notizen', 'NUTZERENTSCHEID 24.09.2026: Wohnung ueberzeugt nicht - vorerst kein Kontakt, Anfrage-Entwurf wird nicht versendet.' || E'\n' || coalesce(sp.data->>'notizen',''),
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
where sp.data->>'link' in (
  'https://www.immobilienscout24.de/expose/171125400',
  'https://www.immobilienscout24.de/expose/169745180',
  'https://www.immobilienscout24.de/expose/168874159')
  and sp.data->>'notizen' not like 'NUTZERENTSCHEID 24.09.2026%';
