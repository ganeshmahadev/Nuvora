-- v4: Goal proposals for GoalCalibrationGraph human-in-loop interrupt
create table public.goal_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  proposed_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
  current_calorie_target integer not null,
  proposed_calorie_target integer not null,
  current_water_target_ml integer not null,
  proposed_water_target_ml integer not null,
  current_protein_target_g numeric(6,2) not null,
  proposed_protein_target_g numeric(6,2) not null,
  rationale text not null,
  reviewed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index goal_proposals_user_status on public.goal_proposals (user_id, status);

alter table public.goal_proposals enable row level security;

create policy "users select own goal proposals" on public.goal_proposals
  for select using (auth.uid() = user_id);
create policy "users update own goal proposals" on public.goal_proposals
  for update using (auth.uid() = user_id);
-- Inserts come from service role only (GoalCalibrationGraph writes them)
