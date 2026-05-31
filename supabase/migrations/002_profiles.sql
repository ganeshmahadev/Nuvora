create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,

  -- Biometrics
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  age smallint,
  gender text check (gender in ('male', 'female', 'non_binary', 'prefer_not_to_say')),
  region text,

  -- Goals and activity
  primary_goal text check (primary_goal in ('weight_loss', 'muscle_gain', 'maintenance', 'athletic_performance')),
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'athlete')),

  -- Daily targets (derived from biometrics on onboarding step 2)
  calorie_target integer not null default 2000,
  water_target_ml integer not null default 2500,
  protein_target_g numeric(6,2) not null default 50,

  -- Onboarding state
  onboarding_complete boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email on public.profiles (email);

alter table public.profiles enable row level security;

create policy "users select own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
