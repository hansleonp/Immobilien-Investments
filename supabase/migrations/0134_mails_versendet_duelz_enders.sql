-- 24.09.2026: Nutzer hat beide vorbereiteten Mails versendet (im Gesendet-Ordner verifiziert).
with n(link, status, wv, notiz) as (values
  ('https://www.kleinanzeigen.de/s-anzeige/bonn-endenich-kapitalanlage-5-og-mit-3-zkb-mit-balkon-provisionsfrei-/3282873847-196-23694',
   '["Kontaktiert", "Besichtigung"]'::jsonb, '2026-09-28',
   'MAIL VERSENDET 24.09.2026 15:12 an Duelz: Entschuldigung fuer verpassten 23.09., neue Terminvorschlaege Di 29.09. / Mi 30.09. / Do 01.10., jeweils 17:30. Warten auf Terminbestaetigung.'),
  ('https://www.immobilienscout24.de/expose/167698174',
   '["Interessant", "Kontaktiert"]'::jsonb, '2026-10-01',
   'MAIL VERSENDET 24.09.2026 15:54 an info@enders-immobilien.de: Nachfass mit Postanschrift + Referenzschreiben Sparkasse (Pflichtangaben laut Inserat), Unterlagen-Anfrage WE 2 + Frage nach WE 1, Besichtigungswunsch.')
)
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'status', n.status, 'wiedervorlage', n.wv,
      'notizen', n.notiz || E'\n' || coalesce(sp.data->>'notizen',''),
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    updated_at = now()
from n
where sp.data->>'link' = n.link and sp.data->>'notizen' not like 'MAIL VERSENDET 24.09.2026%';
