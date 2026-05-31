-- Starter substitutes catalog — 30 swaps seeded for MVP
-- Note: food_id UUIDs must reference actual rows in the foods table.
-- This seed should be applied AFTER seeding the foods table.
-- The pairs below use food names as comments for readability.

-- High-sodium substitutions
-- Soy Sauce → Liquid Aminos (73% sodium reduction: 600mg → 160mg per tbsp)
-- insert into public.substitutes_catalog (source_food_id, substitute_food_id, reason, metric_label, source_metric_value, substitute_metric_value, notes)
-- values (..., ..., 'high_sodium', 'Sodium per serving (mg)', 600, 160, 'Liquid aminos deliver similar umami with 73% less sodium');

-- This file is a template. Populate food_ids after seeding the foods catalog.
-- Run: supabase db seed --file supabase/seed/substitutes.sql

select 'Substitutes seed file ready — populate food_ids after seeding foods catalog' as note;
