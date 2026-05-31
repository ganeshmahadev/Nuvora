-- v3 simple insights — replaced by migration 017 with full v4 categorised structure
create table public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type text not null check (type in ('daily_gist', 'nutrition', 'sleep', 'activity')),
  content text not null,
  generation_status text not null default 'complete' check (generation_status in ('pending', 'complete', 'failed')),
  created_at timestamptz not null default now()
);

create index insights_user_date on public.insights (user_id, date desc);
create index insights_user_type on public.insights (user_id, type);

alter table public.insights enable row level security;

create policy "users select own insights" on public.insights
  for select using (auth.uid() = user_id);
