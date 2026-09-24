-- Niederkassel-Lülsdorf A (IS24 165427943, privat) + B (Kleinanzeigen 3443930764, RRE): Erstkontakt vorbereitet 24.09.2026.
with n(link, notiz) as (values
  ('https://www.immobilienscout24.de/expose/165427943',
   'MAIL 24.09.2026: Erstkontakt-Text an Hr. Alves Lattanzi fertig (nur ueber IS24-Kontaktformular erreichbar, keine Mail/Tel. im Inserat) - noch NICHT versendet. Inserat am 24.09. geprueft: online, 122.000 EUR, Hausgeld 660 EUR, provisionsfrei.'),
  ('https://www.kleinanzeigen.de/s-anzeige/anzeige/3443930764-196-1672',
   'MAIL 24.09.2026: Erstkontakt an Hr. Enes Atas (info@rheinland-realestate.de) als Gmail-Entwurf angelegt (pawlaczyk99@gmail.com) - noch NICHT versendet. Inserat am 24.09. geprueft: online, 120.000 EUR.')
)
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'notizen', n.notiz || E'\n' || coalesce(sp.data->>'notizen',''),
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
from n
where sp.data->>'link' = n.link and sp.data->>'notizen' not like 'MAIL 24.09.2026%';
