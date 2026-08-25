-- Update: Oberkassel Im Michelsfeld 32 (IS24 164218842) — Besichtigung 24.08.2026 17:00 Uhr erfolgt.
-- Ergebnis: zu teuer, Verkaeuferseite trotz Standzeit nicht verhandlungsbereit -> Objekt verworfen.
-- Dankes-Mail an Hrn. Kalf (Becker Immobilien) mit Bitte um weitere Kapitalanlage-Objekte im Bonner Umkreis entworfen.
-- Match ueber data->>'link'; updated_at im JSON und in der Spalte fuer den Local-first-Sync.

update public.search_properties
set
  data = data || jsonb_build_object(
    'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'status', jsonb_build_array('Verworfen'),
    'wiedervorlage', null,
    'notizen',
      (data->>'notizen')
      || E'\n\n' || 'BESICHTIGUNG 24.08.2026 ERFOLGT — VERWORFEN: Preis 218.000 EUR zu hoch, Verkaeuferseite trotz langer Standzeit nicht (nennenswert) verhandlungsbereit; Zielpreis max. 205.000 EUR (konservativ ~179.000 EUR) nicht erreichbar -> kein Gebot abgegeben, Objekt raus. Dankes-Mail an Hrn. Kalf mit Bitte, bei vergleichbaren Kapitalanlage-Objekten im Bonner Raum an uns zu denken (Kontakt warmhalten, betreut auch Kessenicher Str. 134).',
    'history',
      coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'id', '24734c9d-h2',
        'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'text', 'Besichtigung 24.08. erfolgt: zu teuer, nicht verhandelbar -> verworfen; Dankes-/Kontakt-Mail an Hrn. Kalf entworfen'
      ))
  ),
  updated_at = now()
where data->>'link' = 'https://www.immobilienscout24.de/expose/164218842';
