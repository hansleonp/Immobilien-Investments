-- Preis-Historie je Objekt (à la ImmoMetrica-Timeline): Array von
-- { date: 'YYYY-MM-DD', price: number }. Erster Eintrag beim Lead-Import,
-- weitere wenn der Suchagent dasselbe Inserat mit geändertem Preis meldet.
alter table properties add column if not exists price_history jsonb not null default '[]';
