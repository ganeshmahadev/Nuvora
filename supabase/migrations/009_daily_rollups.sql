-- Precomputed daily aggregates — dashboard reads from here, not raw logs
create table public.daily_rollups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,

  -- Nutrition totals
  total_calories numeric(8,2) not null default 0,
  total_protein_g numeric(7,2) not null default 0,
  total_carb_g numeric(7,2) not null default 0,
  total_fat_g numeric(7,2) not null default 0,

  -- Hydration
  total_water_ml integer not null default 0,

  -- Sleep (from sleep_logs for that date)
  sleep_quality smallint,
  sleep_duration_minutes integer,

  -- Activity
  active_minutes integer not null default 0,
  total_calories_burned integer not null default 0,

  -- Weight (snapshot)
  weight_kg numeric(5,2),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index daily_rollups_user_date_unique on public.daily_rollups (user_id, date);
create index daily_rollups_user_date on public.daily_rollups (user_id, date desc);

alter table public.daily_rollups enable row level security;

create policy "users select own daily rollups" on public.daily_rollups
  for select using (auth.uid() = user_id);
-- Rollups are written by service role (pg_cron / Edge Function)

create trigger daily_rollups_updated_at before update on public.daily_rollups
  for each row execute function public.set_updated_at();
