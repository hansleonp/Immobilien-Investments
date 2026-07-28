-- Besichtigungs-PWA: eigene Tabellen, unabhängig von der Hauptapp
-- (public.viewings der Hauptapp bleibt unberührt)

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null default '',
  status text not null default 'geplant'
    check (status in ('geplant','in_bearbeitung','abgeschlossen','weiterverfolgen','verhandeln','verworfen')),
  objekt    jsonb not null default '{}'::jsonb,
  answers   jsonb not null default '{}'::jsonb,
  questions jsonb not null default '{}'::jsonb,
  docs      jsonb not null default '{}'::jsonb,
  report    jsonb not null default '{}'::jsonb,
  score numeric,
  scores    jsonb not null default '{}'::jsonb,
  red_flags jsonb not null default '[]'::jsonb
);

create table if not exists public.inspection_settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  custom_criteria jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger inspections_updated_at before update on public.inspections
  for each row execute function public.set_updated_at();
create trigger inspection_settings_updated_at before update on public.inspection_settings
  for each row execute function public.set_updated_at();

create index if not exists inspections_user_updated_idx on public.inspections (user_id, updated_at desc);

alter table public.inspections enable row level security;
alter table public.inspection_settings enable row level security;

create policy "owner_all" on public.inspections
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner_all" on public.inspection_settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Storage: privater Bucket für Besichtigungsfotos
insert into storage.buckets (id, name, public) values ('inspection-photos', 'inspection-photos', false)
  on conflict (id) do nothing;

-- Pfadschema: {user_id}/{inspection_id}/{item}-{ts}.jpg — erster Ordner muss auth.uid() sein
create policy "inspection_photos_select" on storage.objects for select
  using (bucket_id = 'inspection-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "inspection_photos_insert" on storage.objects for insert
  with check (bucket_id = 'inspection-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "inspection_photos_update" on storage.objects for update
  using (bucket_id = 'inspection-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "inspection_photos_delete" on storage.objects for delete
  using (bucket_id = 'inspection-photos' and (storage.foldername(name))[1] = auth.uid()::text);
