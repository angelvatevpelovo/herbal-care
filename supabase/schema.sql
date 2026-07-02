create extension if not exists pgcrypto;

create table if not exists public.herbs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  latin text,
  emoji text,
  short_description text,
  description text,
  traditional_uses text,
  preparation text,
  precautions text,
  interactions text,
  when_to_see_doctor text,
  created_at timestamptz default now()
);

create table if not exists public.symptoms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.herb_symptoms (
  herb_id uuid references public.herbs(id) on delete cascade,
  symptom_id uuid references public.symptoms(id) on delete cascade,
  primary key (herb_id, symptom_id)
);

alter table public.herbs enable row level security;
alter table public.symptoms enable row level security;
alter table public.herb_symptoms enable row level security;

drop policy if exists "Anyone can select herbs" on public.herbs;
create policy "Anyone can select herbs"
  on public.herbs
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can select symptoms" on public.symptoms;
create policy "Anyone can select symptoms"
  on public.symptoms
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can select herb symptoms" on public.herb_symptoms;
create policy "Anyone can select herb symptoms"
  on public.herb_symptoms
  for select
  to anon, authenticated
  using (true);
