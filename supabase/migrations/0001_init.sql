-- ImmoFinder — Initiales Schema
-- 9 Tabellen, RLS-Owner-Policies, updated_at-Trigger, Indexes, Storage-Bucket

-- ============ helpers ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============ settings (eine Zeile pro User) ============
create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade
    default auth.uid(),
  equity_percent numeric not null default 20 check (equity_percent between 0 and 100),
  interest_rate numeric not null default 3.7 check (interest_rate >= 0),
  repayment_rate numeric not null default 2.0 check (repayment_rate >= 0),
  -- NRW: 6,5 % GrESt + ~2,0 % Notar/Grundbuch + 3,57 % Makler
  purchase_costs_percent numeric not null default 12.07 check (purchase_costs_percent >= 0),
  maintenance_per_sqm numeric not null default 1.00,           -- € / m² / Monat
  non_recoverable_per_sqm numeric not null default 0.60,       -- Fallback € / m² / Monat
  target_yield numeric not null default 4.0,                   -- % brutto
  min_cashflow numeric not null default 0,                     -- € / Monat
  goal_units int not null default 3,
  goal_year int not null default 2029,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ market_prices (Referenz €/m² je Stadt, für Score "Preis vs. Markt") ============
create table public.market_prices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  city text not null,
  price_per_sqm numeric not null check (price_per_sqm > 0),
  rent_per_sqm numeric check (rent_per_sqm > 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, city)
);

-- ============ properties ============
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Identität / Quelle
  title text not null,
  unit_label text,
  street text,
  zip text,
  city text not null default '',
  district text,
  source text not null default 'manuell' check (source in
    ('immoscout24','kleinanzeigen','immowelt','immonet','makler','bank','sonstige','manuell')),
  source_url text,
  external_id text,
  image_url text,
  property_type text not null default 'eigentumswohnung',

  -- Objektdaten
  price numeric check (price >= 0),
  living_area numeric check (living_area > 0),
  rooms numeric check (rooms > 0),
  floor text,
  construction_year int check (construction_year between 1800 and 2100),
  condition text not null default 'unbekannt' check (condition in
    ('erstbezug','saniert','gepflegt','renovierungsbeduerftig','sanierungsbeduerftig','unbekannt')),
  energy_class text,
  rental_status text not null default 'unbekannt' check (rental_status in
    ('frei','vermietet','unbekannt')),

  -- Miete & laufende Kosten (Inputs, alles € / Monat)
  current_rent_cold numeric check (current_rent_cold >= 0),
  estimated_rent_cold numeric check (estimated_rent_cold >= 0),
  hausgeld numeric check (hausgeld >= 0),
  hausgeld_non_recoverable numeric check (hausgeld_non_recoverable >= 0),
  maintenance_monthly numeric check (maintenance_monthly >= 0),
  planned_renovation_costs numeric not null default 0,

  -- Finanzierungs-Overrides (null => settings-Default)
  equity_percent_override numeric check (equity_percent_override between 0 and 100),
  interest_rate_override numeric check (interest_rate_override >= 0),
  repayment_rate_override numeric check (repayment_rate_override >= 0),
  purchase_costs_percent_override numeric check (purchase_costs_percent_override >= 0),
  fixed_rate_years int,

  -- Manuelle Bewertungen (1-5) + Score-Override
  location_rating smallint check (location_rating between 1 and 5),
  rentability_rating smallint check (rentability_rating between 1 and 5),
  condition_rating smallint check (condition_rating between 1 and 5),
  score_override smallint check (score_override between 0 and 100),

  -- Workflow
  status text not null default 'neu' check (status in
    ('neu','interessant','kontaktiert','antwort_ausstehend','rueckmeldung_erhalten',
     'besichtigung_geplant','besichtigung_erledigt','unterlagen_pruefen',
     'angebot_vorbereiten','angebot_abgegeben','verhandlung','notarvorbereitung',
     'gekauft','abgelehnt','verworfen')),
  answer_status text not null default 'keine_anfrage' check (answer_status in
    ('keine_anfrage','anfrage_gesendet','antwort_ausstehend','antwort_erhalten',
     'kein_interesse_anbieter','objekt_verkauft','besichtigung_vereinbart','unterlagen_erhalten')),
  is_favorite boolean not null default false,
  discard_reason text check (discard_reason in
    ('zu_teuer','schlechte_lage','schlechter_zustand','negativer_cashflow','hausgeld_zu_hoch',
     'rechtliche_bedenken','verkauft','sonstiges')),
  discarded_at date,
  purchased_at date,
  notes text,

  -- KI-Analyse (M12)
  ai_analysis jsonb,
  ai_analyzed_at timestamptz
);

-- Dubletten-Schutz: gleiche Quelle + externe ID nur einmal pro User
create unique index properties_dedup_idx on public.properties (user_id, source, external_id)
  where external_id is not null;

-- ============ contacts (Ansprechpartner je Objekt) ============
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  company text,
  role text,
  phone text,
  email text,
  platform text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ contact_events (Kontaktverlauf) ============
create table public.contact_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  event_date timestamptz not null default now(),
  contact_type text not null check (contact_type in
    ('plattform','email','telefon','whatsapp','persoenlich','sonstiges')),
  direction text not null default 'ausgehend' check (direction in ('ausgehend','eingehend')),
  summary text not null,
  next_action text,
  next_action_date date,
  created_at timestamptz not null default now()
);

-- ============ tasks (Aufgaben & Wiedervorlagen) ============
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  property_id uuid references public.properties(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  description text,
  due_date date,
  priority text not null default 'mittel' check (priority in ('hoch','mittel','niedrig')),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ viewings (Besichtigungen) ============
create table public.viewings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  viewing_date timestamptz not null,
  location text,
  status text not null default 'geplant' check (status in ('geplant','erledigt','abgesagt')),
  notes text,
  rating smallint check (rating between 1 and 5),
  -- Checkliste: { "<key>": { "rating": 1-5, "note": "..." }, ... }
  checklist jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ documents ============
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  viewing_id uuid references public.viewings(id) on delete set null,
  file_name text not null,
  file_type text,
  file_size int,
  storage_path text not null,
  category text not null default 'sonstiges' check (category in
    ('expose','grundriss','energieausweis','teilungserklaerung','wirtschaftsplan',
     'hausgeldabrechnung','protokoll_ev','mietvertrag','nebenkostenabrechnung',
     'foto','finanzierung','sonstiges')),
  notes text,
  uploaded_at timestamptz not null default now()
);

-- ============ import_inbox (E-Mail-Suchagenten-Import) ============
create table public.import_inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'sonstige',
  source_url text not null,
  external_id text,
  subject text,
  excerpt text,
  parsed jsonb not null default '{}'::jsonb,
  status text not null default 'neu' check (status in ('neu','uebernommen','verworfen')),
  property_id uuid references public.properties(id) on delete set null,
  received_at timestamptz not null default now(),
  unique (user_id, source_url)
);

-- ============ updated_at triggers ============
create trigger settings_updated_at      before update on public.settings      for each row execute function public.set_updated_at();
create trigger market_prices_updated_at before update on public.market_prices for each row execute function public.set_updated_at();
create trigger properties_updated_at    before update on public.properties    for each row execute function public.set_updated_at();
create trigger contacts_updated_at      before update on public.contacts      for each row execute function public.set_updated_at();
create trigger tasks_updated_at         before update on public.tasks         for each row execute function public.set_updated_at();
create trigger viewings_updated_at      before update on public.viewings      for each row execute function public.set_updated_at();

-- ============ indexes ============
create index properties_user_status_idx  on public.properties (user_id, status);
create index properties_user_city_idx    on public.properties (user_id, city);
create index contacts_property_idx       on public.contacts (property_id);
create index contact_events_property_idx on public.contact_events (property_id, event_date desc);
create index tasks_user_due_idx          on public.tasks (user_id, due_date) where not completed;
create index tasks_property_idx          on public.tasks (property_id);
create index viewings_user_date_idx      on public.viewings (user_id, viewing_date);
create index viewings_property_idx       on public.viewings (property_id);
create index documents_property_idx      on public.documents (property_id);
create index import_inbox_user_status_idx on public.import_inbox (user_id, status);

-- ============ RLS ============
alter table public.settings       enable row level security;
alter table public.market_prices  enable row level security;
alter table public.properties     enable row level security;
alter table public.contacts       enable row level security;
alter table public.contact_events enable row level security;
alter table public.tasks          enable row level security;
alter table public.viewings       enable row level security;
alter table public.documents      enable row level security;
alter table public.import_inbox   enable row level security;

create policy "owner_all" on public.settings       for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner_all" on public.market_prices  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner_all" on public.properties     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner_all" on public.contacts       for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner_all" on public.contact_events for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner_all" on public.tasks          for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner_all" on public.viewings       for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner_all" on public.documents      for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner_all" on public.import_inbox   for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============ Storage: privater Bucket "documents" ============
insert into storage.buckets (id, name, public) values ('documents', 'documents', false)
  on conflict (id) do nothing;

-- Pfadschema: {user_id}/{property_id}/{uuid}-{filename} — erster Ordner muss auth.uid() sein
create policy "documents_owner_select" on storage.objects for select
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "documents_owner_insert" on storage.objects for insert
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "documents_owner_update" on storage.objects for update
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "documents_owner_delete" on storage.objects for delete
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
