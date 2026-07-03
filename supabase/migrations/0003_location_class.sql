-- Lage-Einstufung A/B/C/D je Stadt (bulwiengesa-Städtesystem)
-- A = Top-Metropole, B = Großstadt, C = wichtiges Regionalzentrum, D = kleinere Stadt
alter table public.market_prices
  add column location_class text check (location_class in ('A','B','C','D'));
