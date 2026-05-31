-- v4: Extend foods catalog with micronutrient data (per 100g basis)
alter table public.foods
  add column if not exists vitamin_a_iu numeric(8,2),
  add column if not exists vitamin_c_mg numeric(7,2),
  add column if not exists iron_mg numeric(6,2),
  add column if not exists zinc_mg numeric(6,2),
  add column if not exists magnesium_mg numeric(7,2),
  add column if not exists calcium_mg numeric(7,2),
  add column if not exists sodium_mg numeric(7,2),
  add column if not exists potassium_mg numeric(7,2),
  add column if not exists fiber_g numeric(6,2),
  add column if not exists sugar_g numeric(6,2);

-- Micronutrient totals on meal_items (computed at insert time)
alter table public.meal_items
  add column if not exists vitamin_a_iu_total numeric(8,2),
  add column if not exists vitamin_c_mg_total numeric(7,2),
  add column if not exists iron_mg_total numeric(6,2),
  add column if not exists zinc_mg_total numeric(6,2),
  add column if not exists magnesium_mg_total numeric(7,2),
  add column if not exists calcium_mg_total numeric(7,2),
  add column if not exists sodium_mg_total numeric(7,2);

-- Extend daily_rollups for daily micronutrient density (% of RDA)
alter table public.daily_rollups
  add column if not exists vitamin_a_pct numeric(5,2),
  add column if not exists vitamin_c_pct numeric(5,2),
  add column if not exists iron_pct numeric(5,2),
  add column if not exists zinc_pct numeric(5,2),
  add column if not exists magnesium_pct numeric(5,2),
  add column if not exists calcium_pct numeric(5,2);
