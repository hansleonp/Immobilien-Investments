-- Pipeline-Updates 28.08.2026 (Nutzer-Rueckmeldung nach erstem /status-Bericht), 4 Objekte.
-- Ersetzt die nie angewendete 0084_pipeline_updates_28_08 (Versionskollision mit Parallel-Session).
-- August-Bier entfaellt hier: bereits durch 0084_update_search_property_kessenich_august_bier abgedeckt
-- (Zwischennachricht an Fr. Rechin, Banktermin fixiert).

-- 1) Mechenstr. 55-57 (WE 86): nochmal nachfragen als offener Punkt
update public.search_properties set data = data || jsonb_build_object(
  'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  'wiedervorlage', '2026-08-31',
  'history', coalesce(data->'history','[]'::jsonb) || jsonb_build_array(jsonb_build_object(
    'id','e8b24d97-5f10-4c3a-b6d2-90a7e54c1f83',
    'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'text','Offener Punkt eingetragen: Bei Hrn. Gebhardt nochmal nachfragen (Unterlagen vom 11.08. weiter ausstehend). Wiedervorlage 31.08.')),
  'notizen', (data->>'notizen') || E'\n\n' || 'OFFENER PUNKT 28.08.2026: Bei Hrn. Gebhardt (deinimmoberater) erneut nachfragen - seit 11.08. ausstehend: Ruecklagen-Iststand/Vermoegensbericht (!), ETV-Protokolle 2024+2025, Grundbuch Abt. II+III, Beleg Dachsanierung, Kautionsnachweis, Kostenrahmen Leitungssanierung, Klaerung Hausgeld-Diskrepanz Inserat vs. WP 2027. Ohne Ruecklagen-Iststand keine Bewertung moeglich (Komplettsanierung aller wasserfuehrenden Leitungen in Planung). Wiedervorlage 31.08.'
), updated_at = now()
where data->>'link' = 'https://www.immowelt.de/expose/e2dc5795-440a-4a15-a06c-2df2770a77eb';

-- 2) Von-Weichs-Str. 20: Verkaeufer-Untergrenze 100k -> ruhen lassen
update public.search_properties set data = data || jsonb_build_object(
  'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  'history', coalesce(data->'history','[]'::jsonb) || jsonb_build_array(jsonb_build_object(
    'id','f4c81e26-7a93-4d05-8b1f-62d90c3a7e54',
    'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'text','Verkaeufer will nicht unter 100.000 gehen - weiter deutlich ueber unserer Schwelle (~90 T Wecker, Ziel ~76 T). Ruhen lassen, Urteil Finger weg bestaetigt.')),
  'notizen', (data->>'notizen') || E'\n\n' || 'UPDATE 28.08.2026: Verkaeufer signalisiert Untergrenze 100.000 EUR - liegt weiter klar ueber unserer Schwelle (Wecker ~90 T, Ziel ~76 T). Objekt ruhen lassen; kein weiterer eigener Zug. Reaktivieren nur, falls der Preis Richtung 90 T faellt.'
), updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/studentenwohnung-1-zi-apartment-eigentumswohnug-bonn-end-/3424883857-196-23694';

-- 3) Magdalenenstr. 52: Vollpreis-Zusage bzw. 131k-Angebot -> aus dem Rennen
update public.search_properties set data = data || jsonb_build_object(
  'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  'wiedervorlage', '',
  'history', coalesce(data->'history','[]'::jsonb) || jsonb_build_array(jsonb_build_object(
    'id','a2d70f95-4e38-4c61-9b27-85c1f4e0d329',
    'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'text','Makler v. Briskorn: Es liegt bereits eine Zusage zum vollen Preis (139 T) bzw. alternativ ein Angebot ueber 131 T vor. Bei unserem Rahmen (~90 T) chancenlos - aus dem Rennen; nur reaktivieren, falls die Zusage platzt.')),
  'notizen', (data->>'notizen') || E'\n\n' || 'UPDATE 28.08.2026: Makler v. Briskorn nennt eine bereits vorliegende Zusage zum VOLLEN PREIS (139.000) bzw. alternativ ein Angebot ueber 131.000. Bei unserem Rahmen um 90.000 ist das Objekt damit chancenlos - AUS DEM RENNEN, kein Gebot. Beobachten ohne Wiedervorlage; nur reaktivieren, falls die Zusage platzt und der Makler sich meldet. (Uebliche Vorsicht: solche "Zusagen" sind auch ein bekanntes Druckmittel - aber gegen 131+ bieten wir ohnehin nicht.)'
), updated_at = now()
where data->>'link' = 'https://www.immobilienscout24.de/expose/166643036';

-- 4) Bonner Talweg 235: Goertz antwortet nicht -> passiv, Wiedervorlage 25.09.
update public.search_properties set data = data || jsonb_build_object(
  'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  'wiedervorlage', '2026-09-25',
  'history', coalesce(data->'history','[]'::jsonb) || jsonb_build_array(jsonb_build_object(
    'id','c6e93b40-1d57-4f82-a3c9-07f5d2e81b46',
    'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'text','Hr. Goertz antwortet nicht auf das Angebot (Anker 110-115 T) - vermutlich deutlich zu wenig aus seiner Sicht. Passiv stellen, Wiedervorlage 25.09. (Inserat/Preis pruefen).')),
  'notizen', (data->>'notizen') || E'\n\n' || 'UPDATE 28.08.2026: Hr. Goertz hat auf das Angebot (Anker 110-115 T) nicht geantwortet - Einschaetzung: ihm deutlich zu wenig. Kein Nachlegen (Obergrenze 120 T inkl. TG steht, Objekt traegt nicht mehr). Passiv stellen; Wiedervorlage 25.09.: Inserat noch online? Preis gesenkt? Dann ggf. kurzes Nachfass-Telefonat.'
), updated_at = now()
where data->>'link' = 'https://www.kleinanzeigen.de/s-anzeige/anzeige/3462121438-196-23696';
