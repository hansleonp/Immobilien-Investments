-- Status 'lead' für automatisch aus dem Posteingang importierte Portal-Treffer.
-- Leads sind in der Immobilien-Tabelle standardmäßig ausgeblendet (Filter-Toggle),
-- damit die aggregierte Portal-Suche die kuratierte Pipeline nicht überdeckt.
alter table properties drop constraint if exists properties_status_check;
alter table properties add constraint properties_status_check check (status in
  ('lead','neu','interessant','kontaktiert','antwort_ausstehend','rueckmeldung_erhalten',
   'besichtigung_geplant','besichtigung_erledigt','unterlagen_pruefen',
   'angebot_vorbereiten','angebot_abgegeben','verhandlung','notarvorbereitung',
   'gekauft','abgelehnt','verworfen'));
