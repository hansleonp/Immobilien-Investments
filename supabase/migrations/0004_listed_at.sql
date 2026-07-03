-- Veröffentlichungs-/Inseratsdatum des Angebots (bestmögliche Näherung, da Portale
-- kein zuverlässiges Feld liefern): beim Import aus dem Posteingang das Maildatum,
-- sonst manuell im Bearbeiten-Dialog pflegbar.
alter table properties add column if not exists listed_at date;
