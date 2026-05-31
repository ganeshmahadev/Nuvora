create extension if not exists pg_trgm;

create table public.foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,

  -- Macros per 100g
  calories_per_100g numeric(8,2) not null,
  protein_g numeric(7,2) not null default 0,
  carb_g numeric(7,2) not null default 0,
  fat_g numeric(7,2) not null default 0,

  -- Ownership: null = global catalog, user_id = custom food
  created_by uuid references auth.users(id) on delete set null,

  is_verified boolean not null default false,

  created_at timestamptz not null default now()
);

create index foods_name_trgm on public.foods using gin (name gin_trgm_ops);
create index foods_created_by on public.foods (created_by);

alter table public.foods enable row level security;

-- Global catalog is readable by all authenticated users
create policy "authenticated users read global foods" on public.foods
  for select using (created_by is null or auth.uid() = created_by);

create policy "users insert own foods" on public.foods
  for insert with check (auth.uid() = created_by);

create policy "users update own foods" on public.foods
  for update using (auth.uid() = created_by);

create policy "users delete own foods" on public.foods
  for delete using (auth.uid() = created_by);
