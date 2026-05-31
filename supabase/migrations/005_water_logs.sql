create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount_ml integer not null check (amount_ml > 0),
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index water_logs_user_date on public.water_logs (user_id, date desc);

alter table public.water_logs enable row level security;

create policy "users select own water logs" on public.water_logs
  for select using (auth.uid() = user_id);
create policy "users insert own water logs" on public.water_logs
  for insert with check (auth.uid() = user_id);
create policy "users delete own water logs" on public.water_logs
  for delete using (auth.uid() = user_id);
