-- Korrektur zu 0123: Portal-Gegenpruefung am 24.09.2026 ergab, dass nur Vilich-Rheindorf wirklich im Preis gesenkt ist.
-- * IS24 169547629 (Kessenich Maisonette): 145.000 + 10.000 TG = 155.000 unveraendert (Immometrica zeigt nur Wohnungspreis)
-- * IS24 169544443 (Bad Honnef 3 Zi): 199.000 + 12.500 TG = 211.500 unveraendert (dito)
-- * immobilie1 32540713 (Trierer Str. 55, EG, vermietet): weiter 159.000; die 156.000 bei Immometrica sind eine ANDERE Einheit
--   (IS24, 9. von 11 OG, leer, 31 m²) -> nur als Hinweis notiert
-- * Vilich-Rheindorf: Immowelt 675b142e geloescht, identisches Objekt jetzt IS24 170633840 fuer 166.000 -> Link umstellen.

-- 1) Kessenich + Bad Honnef: Werte aus der Zeit vor 0123 wiederherstellen, 0123-Notizzeile entfernen
with fix(link, preis, cashflow) as (values
  ('https://www.immobilienscout24.de/expose/169547629', 155000, -281),
  ('https://www.immobilienscout24.de/expose/169544443', 211500, 18)
)
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'preis', fix.preis,
      'cashflow', fix.cashflow,
      'notizen', regexp_replace(sp.data->>'notizen', '^PREISUPDATE 24\.09\.2026[^\n]*\n', ''),
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
from fix
where sp.data->>'link' = fix.link
  and sp.data->>'notizen' like 'PREISUPDATE 24.09.2026%';

-- 2) Trierer Str. 55: Werte wiederherstellen, 0123-Zeile durch Hinweis auf die zweite Einheit ersetzen
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'preis', 159000,
      'cashflow', -236,
      'notizen', 'HINWEIS 24.09.2026 (Immometrica-Abgleich): Im selben Haus bietet IS24 eine zweite Einheit an (31 m², 9. von 11 OG, leer, 156.000 EUR, Titel "Fuer Kapitalanleger oder Eigennutzer! Apartment in bevorzugter Lage") - nicht dieses Objekt; dieses Inserat unveraendert 159.000 EUR.'
                 || E'\n' || regexp_replace(sp.data->>'notizen', '^PREISUPDATE 24\.09\.2026[^\n]*\n', ''),
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
where sp.data->>'link' = 'https://www.immobilie1.de/32540713'
  and sp.data->>'notizen' like 'PREISUPDATE 24.09.2026%';

-- 3) Vilich-Rheindorf: Preis 166.000 bleibt (aus 0123), Link auf das neue IS24-Inserat umstellen
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'link', 'https://www.immobilienscout24.de/expose/170633840',
      'notizen', regexp_replace(sp.data->>'notizen', '^PREISUPDATE 24\.09\.2026[^\n]*\n',
                 'PREISUPDATE 24.09.2026: Immowelt-Inserat 675b142e geloescht; identisches Objekt (provisionsfrei, Stellplatz, 41 m², 3. von 3 OG, vermietet) jetzt IS24 170633840 fuer 166.000 EUR (vorher 169.000, -1,8 %). Liquiditaet ca. -184 EUR/M; Wunschpreis 99.000 EUR unveraendert -> Urteil unveraendert.' || E'\n'),
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
where sp.data->>'link' = 'https://www.immowelt.de/expose/675b142e-8051-41b6-b193-098da2859629';

-- 4) Quelle zum neuen Link passend
update public.search_properties
set data = data || jsonb_build_object('quelle', 'ImmoScout24'), updated_at = now()
where data->>'link' = 'https://www.immobilienscout24.de/expose/170633840' and data->>'quelle' = 'Immowelt';
