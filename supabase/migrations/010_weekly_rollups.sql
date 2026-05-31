create table public.weekly_rollups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,

  -- Averages over the 7-day period
  avg_calories numeric(8,2) not null default 0,
  avg_protein_g numeric(7,2) not null default 0,
  avg_carb_g numeric(7,2) not null default 0,
  avg_fat_g numeric(7,2) not null default 0,
  avg_water_ml integer not null default 0,
  avg_sleep_quality numeric(4,2),
  avg_sleep_duration_minutes integer,

  -- Totals
  total_active_minutes integer not null default 0,

  -- Goal adherence (0–1 ratio)
  calorie_adherence numeric(5,4),
  protein_adherence numeric(5,4),
  water_adherence numeric(5,4),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index weekly_rollups_user_week_unique on public.weekly_rollups (user_id, week_start);
create index weekly_rollups_user_week on public.weekly_rollups (user_id, week_start desc);

alter table public.weekly_rollups enable row level security;

create policy "users select own weekly rollups" on public.weekly_rollups
  for select using (auth.uid() = user_id);

create trigger weekly_rollups_updated_at before update on public.weekly_rollups
  for each row execute function public.set_updated_at();
