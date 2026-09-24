-- Magdalenenstr. 52: IS24-Inserat 166643036 am 24.09.2026 deaktiviert (reserviert/verkauft/pausiert unklar).
-- Anfrage an von Briskorn (Verfuegbarkeit + Unterlagen fuer Gebot) als Gmail-Entwurf angelegt, nicht versendet.
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'notizen', 'STAND 24.09.2026: IS24-Inserat DEAKTIVIERT (Grund unklar). Seit 22.08. (MV erhalten) kein Kontakt. Anfrage-Entwurf an s@vonbriskorn.de (cc bonn@): noch verfuegbar? + § 556g-Auskunft, Vormiete bis 07/2024, Modernisierungsnachweise vor 08/2024, Nachweis Sonderumlage 1.830 EUR, Kaution, Stand Kuendigung. Gebot 124.000 erst nach Unterlagen (Decke 132.000).' || E'\n' || coalesce(sp.data->>'notizen',''),
      'wiedervorlage', '2026-09-29',
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
where sp.data->>'adresse' = 'Magdalenenstr. 52' and sp.data->>'notizen' not like 'STAND 24.09.2026%';
