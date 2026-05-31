-- v4: Replace simple insights table with fully categorised, LangGraph-aware version
drop table if exists public.insights cascade;

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in (
    'daily_gist',
    'smart_substitute',
    'protein_nudge',
    'sleep_hygiene',
    'activity_recommendation',
    'goal_calibration',
    'pattern_detection'
  )),
  scope text not null default 'daily' check (scope in ('daily', 'weekly', 'monthly', 'ad_hoc')),
  reference_date date,
  reference_entity_type text,            -- 'meal_log', 'sleep_log', 'activity_log', null
  reference_entity_id uuid,              -- loose FK by design — entity may be deleted

  title text not null,
  body text not null,
  structured_data jsonb,                 -- substitute details, protocol arrays, etc.
  call_to_action jsonb,                  -- {label: "Apply", action: "update_goal"}

  generation_status text not null default 'pending' check (generation_status in (
    'pending', 'streaming', 'complete', 'failed'
  )),
  langgraph_thread_id text,
  langgraph_run_id text,

  created_at timestamptz not null default now(),
  completed_at timestamptz,
  dismissed_at timestamptz,
  acted_on_at timestamptz
);

create index insights_user_category_date on public.insights (user_id, category, reference_date desc);
create index insights_user_status on public.insights (user_id, generation_status);
create index insights_user_date on public.insights (user_id, created_at desc);

alter table public.insights enable row level security;

create policy "users select own insights" on public.insights
  for select using (auth.uid() = user_id);
create policy "users update own insights" on public.insights
  for update using (auth.uid() = user_id);
-- Inserts come from service role only (LangGraph service writes them)
