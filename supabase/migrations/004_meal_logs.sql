create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index meal_logs_user_date on public.meal_logs (user_id, date desc);
create index meal_logs_user_date_type on public.meal_logs (user_id, date, meal_type);

alter table public.meal_logs enable row level security;

create policy "users select own meal logs" on public.meal_logs
  for select using (auth.uid() = user_id);
create policy "users insert own meal logs" on public.meal_logs
  for insert with check (auth.uid() = user_id);
create policy "users update own meal logs" on public.meal_logs
  for update using (auth.uid() = user_id);
create policy "users delete own meal logs" on public.meal_logs
  for delete using (auth.uid() = user_id);

create trigger meal_logs_updated_at before update on public.meal_logs
  for each row execute function public.set_updated_at();

-- Meal items (individual food entries within a meal)
create table public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_log_id uuid not null references public.meal_logs(id) on delete cascade,
  food_id uuid not null references public.foods(id),
  quantity_g numeric(8,2) not null,

  -- Computed totals (quantity_g / 100 × macro_per_100g)
  calories_total numeric(8,2) not null,
  protein_g_total numeric(7,2) not null default 0,
  carb_g_total numeric(7,2) not null default 0,
  fat_g_total numeric(7,2) not null default 0,

  created_at timestamptz not null default now()
);

create index meal_items_meal_log on public.meal_items (meal_log_id);
create index meal_items_food on public.meal_items (food_id);

alter table public.meal_items enable row level security;

-- Users access meal_items via their meal_logs
create policy "users select own meal items" on public.meal_items
  for select using (
    exists (
      select 1 from public.meal_logs ml
      where ml.id = meal_log_id and ml.user_id = auth.uid()
    )
  );
create policy "users insert own meal items" on public.meal_items
  for insert with check (
    exists (
      select 1 from public.meal_logs ml
      where ml.id = meal_log_id and ml.user_id = auth.uid()
    )
  );
create policy "users delete own meal items" on public.meal_items
  for delete using (
    exists (
      select 1 from public.meal_logs ml
      where ml.id = meal_log_id and ml.user_id = auth.uid()
    )
  );
