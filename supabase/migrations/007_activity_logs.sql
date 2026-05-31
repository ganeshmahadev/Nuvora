-- v3 activity logs — extended by migration 013 with RPE + distance + HR
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  activity_type text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  calories_burned integer,
  intensity_label text check (intensity_label in ('low', 'moderate', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index activity_logs_user_date on public.activity_logs (user_id, date desc);

alter table public.activity_logs enable row level security;

create policy "users select own activity logs" on public.activity_logs
  for select using (auth.uid() = user_id);
create policy "users insert own activity logs" on public.activity_logs
  for insert with check (auth.uid() = user_id);
create policy "users update own activity logs" on public.activity_logs
  for update using (auth.uid() = user_id);
create policy "users delete own activity logs" on public.activity_logs
  for delete using (auth.uid() = user_id);

create trigger activity_logs_updated_at before update on public.activity_logs
  for each row execute function public.set_updated_at();
