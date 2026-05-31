-- v4: Smart Substitute engine catalog
create table public.substitutes_catalog (
  id uuid primary key default gen_random_uuid(),
  source_food_id uuid not null references public.foods(id),
  substitute_food_id uuid not null references public.foods(id),
  reason text not null check (reason in (
    'high_sodium', 'calorie_dense', 'high_sugar', 'high_saturated_fat',
    'low_protein', 'low_fiber', 'high_glycemic'
  )),
  metric_label text not null,
  source_metric_value numeric(10,2) not null,
  substitute_metric_value numeric(10,2) not null,
  pct_reduction numeric(5,2) generated always as (
    case
      when source_metric_value = 0 then 0
      else round(((source_metric_value - substitute_metric_value) / source_metric_value) * 100, 2)
    end
  ) stored,
  notes text,
  created_at timestamptz not null default now()
);

create index substitutes_source on public.substitutes_catalog (source_food_id, reason);

alter table public.substitutes_catalog enable row level security;

-- Catalog is read-only for users; service role manages it
create policy "all users read substitutes catalog" on public.substitutes_catalog
  for select using (true);
