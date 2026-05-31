-- v4: Replace simple sleep_logs with full sleep architecture tracking
drop table if exists public.sleep_logs cascade;

create table public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  bed_time time not null,
  wake_time time not null,
  duration_minutes integer generated always as (
    case
      when wake_time > bed_time
        then cast(extract(epoch from (wake_time - bed_time)) / 60 as integer)
      else cast(extract(epoch from (cast('24:00:00' as time) - bed_time + wake_time)) / 60 as integer)
    end
  ) stored,

  -- Subjective
  subjective_quality smallint check (subjective_quality between 1 and 10),

  -- Architecture (from wearable or manual estimate)
  deep_minutes integer,
  rem_minutes integer,
  light_minutes integer,
  awake_minutes integer,
  time_to_quiet_minutes integer,
  respiratory_rate_avg numeric(4,1),
  efficiency_pct smallint check (efficiency_pct between 0 and 100),
  sleep_score smallint check (sleep_score between 0 and 100),

  -- Contextual factors (denormalised array for fast filtering)
  -- Allowed values: 'caffeine_late', 'alcohol', 'screen_time_pre_sleep', 'late_meal',
  -- 'high_stress', 'travel', 'medication', 'illness'
  factors text[] default '{}'::text[],

  notes text,
  source text not null default 'manual' check (source in ('manual', 'wearable_apple', 'wearable_oura', 'wearable_whoop')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index sleep_logs_user_date_unique on public.sleep_logs (user_id, date);
create index sleep_logs_user_date on public.sleep_logs (user_id, date desc);

alter table public.sleep_logs enable row level security;

create policy "users select own sleep logs" on public.sleep_logs
  for select using (auth.uid() = user_id);
create policy "users insert own sleep logs" on public.sleep_logs
  for insert with check (auth.uid() = user_id);
create policy "users update own sleep logs" on public.sleep_logs
  for update using (auth.uid() = user_id);
create policy "users delete own sleep logs" on public.sleep_logs
  for delete using (auth.uid() = user_id);

create trigger sleep_logs_updated_at before update on public.sleep_logs
  for each row execute function public.set_updated_at();
