-- Pipeline-Stand aus dem Postfach (pawlaczyk99@gmail.com), Abgleich 24.09.2026.
with n(adr, status, wv, notiz) as (values
  ('Beethovenstr. 50', '["Beobachten - geparkt"]'::jsonb, '2026-10-08',
   'STAND 24.09.2026: Titze (PlanetHome) am 22.09.: zwei weitere Interessenten mit hoeheren Angeboten, Eigentuemer verfolgt diese zuerst; meldet sich, falls er auf unser Angebot (145.000, ausgelaufen 14.09.) zurueckkommt. Keine Erhoehung - Limit bleibt. Wiedervorlage 08.10.: kurz nachfragen, ob die anderen Kaeufer abgesprungen sind.'),
  ('Carl-Justi-Strasse 23', '["Kontaktiert", "Besichtigung"]'::jsonb, '2026-09-25',
   'STAND 24.09.2026: Duelz hat am 11.09. geantwortet (Mail UNGELESEN geblieben): 22.09./24.09. gehen nicht, Gegenvorschlag Mi 23.09. 17:30 - unbeantwortet und verstrichen. Kellerabteil als SNR zugeordnet, SNR 194 vermutlich NICHT der richtige Raum (Plan anbei) - vor Ort klaeren. SOFORT neue Termine anbieten.'),
  ('August-Bier-Str. 4', null, '2026-09-29',
   'STAND 24.09.2026: Rechin (RW-Immo) 03.09./09.09.: Mieter blockiert (Beurkundungs-/Besichtigungstermin nicht wahrgenommen), Vorgang bei der Rechtsabteilung. Nachfrage von uns am 22.09., noch keine Antwort. Bonitaetsnachweis wurde am 01.09. geliefert.'),
  ('Mechenstr. 55 in 53129 Bonn', null, '2026-10-06',
   'STAND 24.09.2026: Gebhardt (deinimmoberater) am 22.09.: Hausverwaltung hat Ruecklagen-Iststand & Co. trotz mehrfacher Nachfrage noch nicht geliefert. Bewertung bleibt ausgesetzt; ohne Zahlen keine Bewegung.')
)
update public.search_properties sp
set data = sp.data || jsonb_build_object(
      'notizen', n.notiz || E'\n' || coalesce(sp.data->>'notizen',''),
      'wiedervorlage', n.wv,
      'updated_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
      || case when n.status is not null then jsonb_build_object('status', n.status) else '{}'::jsonb end,
    updated_at = now()
from n
where sp.data->>'adresse' = n.adr
  and sp.data->'status' ?| array['Besichtigung','Verhandlung','Kontaktiert','Interessant']
  and sp.data->>'notizen' not like 'STAND 24.09.2026%';
