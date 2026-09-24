-- Preissenkungen aus dem Immometrica-Abgleich vom 24.09.2026 (aktive Inserate, Bonn + Bad Honnef, ETW <= 200k).
-- Nur Preis + Liquiditaet (Rate 4,11 %, ~4,08 EUR/M je 1.000 EUR Kaufpreis) + Notiz-Vorsatz; Urteile unveraendert,
-- da alle Wunschpreise weiterhin deutlich unter dem neuen Angebotspreis liegen.

with upd(link, preis, cashflow, notiz) as (values
  ('https://www.immobilienscout24.de/expose/169547629', 145000, -240,
   'PREISUPDATE 24.09.2026 (Immometrica): Angebot 155.000 -> 145.000 EUR (-6,5 %). Liquiditaet dadurch ca. -240 EUR/M (vorher -281), EK-Rendite bleibt weit unter 6 %; Wunschpreis 58.000 EUR unveraendert -> Urteil unveraendert Finger weg.'),
  ('https://www.immobilienscout24.de/expose/169544443', 199000, 69,
   'PREISUPDATE 24.09.2026 (Immometrica): Angebot 211.500 -> 199.000 EUR (-5,9 %). Abstand zum Wunschpreis 145.000 EUR schrumpft von 31 % auf 27 % -> Urteil unveraendert; weiter nur Datenbeschaffung, keine Kaufanbahnung.'),
  ('https://www.immowelt.de/expose/675b142e-8051-41b6-b193-098da2859629', 166000, -184,
   'PREISUPDATE 24.09.2026 (Immometrica): Angebot 169.000 -> 166.000 EUR (-1,8 %). Wunschpreis 99.000 EUR unveraendert -> Urteil unveraendert.'),
  ('https://www.immobilie1.de/32540713', 156000, -224,
   'PREISUPDATE 24.09.2026 (Immometrica, auch IS24 Trierer Str. 55): Angebot 159.000 -> 156.000 EUR (-1,9 %). Wunschpreis 83.000 EUR unveraendert -> Urteil unveraendert.')
)
update public.search_properties sp
set data = sp.data
      || jsonb_build_object(
           'preis', upd.preis,
           'cashflow', upd.cashflow,
           'notizen', upd.notiz || E'\n' || coalesce(sp.data->>'notizen', ''),
           'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
         ),
    updated_at = now()
from upd
where sp.data->>'link' = upd.link
  and (sp.data->>'preis')::numeric <> upd.preis;
