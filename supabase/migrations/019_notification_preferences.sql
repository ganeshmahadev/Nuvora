-- v4: AI notification preferences (set during onboarding step 3)
alter table public.profiles
  add column if not exists pref_morning_gist boolean not null default true,
  add column if not exists pref_weekly_trends boolean not null default true,
  add column if not exists pref_critical_alerts boolean not null default true,
  add column if not exists pref_substitute_suggestions boolean not null default true,
  add column if not exists pref_recovery_recommendations boolean not null default true;
