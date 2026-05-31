create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric(5,2) not null check (weight_kg > 0),
  notes text,
  created_at timestamptz not null default now()
);

create unique index weight_logs_user_date_unique on public.weight_logs (user_id, date);
create index weight_logs_user_date on public.weight_logs (user_id, date desc);

alter table public.weight_logs enable row level security;

create policy "users select own weight logs" on public.weight_logs
  for select using (auth.uid() = user_id);
create policy "users insert own weight logs" on public.weight_logs
  for insert with check (auth.uid() = user_id);
create policy "users update own weight logs" on public.weight_logs
  for update using (auth.uid() = user_id);
create policy "users delete own weight logs" on public.weight_logs
  for delete using (auth.uid() = user_id);
