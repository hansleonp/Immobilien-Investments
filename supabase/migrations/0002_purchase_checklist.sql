-- Kaufprüfungs-Checkliste (Due Diligence) je Objekt
-- Format: { "<key>": { "checked": boolean, "note": "..." }, ... }
alter table public.properties
  add column purchase_checklist jsonb not null default '{}'::jsonb;
