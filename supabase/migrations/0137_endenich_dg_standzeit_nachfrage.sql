-- Standzeit-Check 24.09.2026: Endenich DG 65 m2 (Kleinanzeigen 3395307299) laut Immometrica seit 28.04.2026 am Markt (~150 Tage),
-- Zielpreis 141.000 = 29 % unter 199.000 -> innerhalb der 30-%-Regel des Nutzers. Zurueck aus "Verworfen" (0130), Nachfrage vorbereitet.
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'status', jsonb_build_array('Neu'),
      'wiedervorlage', '2026-10-02',
      'email', 'bornheim@guetelhoefer.com',
      'notizen', 'STANDZEIT-CHECK 24.09.2026: seit ~28.04. am Markt (~150 Tage), Preis unveraendert 199.000. Ziel 141.000 = 29 % Nachlass -> innerhalb 30-%-Regel, deshalb zurueck in die Pipeline. Nachfrage-Entwurf an Guetelhoefer (bornheim@, cc rheinbach@, z. Hd. Parfitt): Preisbereitschaft + Vormiete (§ 556e - einziger Hebel ueber den Deckel 680 EUR) + Unterlagen. Noch NICHT versendet.' || E'\n' || coalesce(sp.data->>'notizen',''),
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
where sp.data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/anzeige/3395307299-196-23694' and sp.data->>'notizen' not like 'STANDZEIT-CHECK 24.09.2026%';
