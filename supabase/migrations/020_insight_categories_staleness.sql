-- Migration 020: Expand insight categories + staleness tracking
-- Adds water_hydration, weight_trend, meal_nutrition categories
-- Adds log_count_at_generation and input_hash for staleness detection

-- Drop existing check constraint and replace with expanded list
ALTER TABLE public.insights DROP CONSTRAINT IF EXISTS insights_category_check;

ALTER TABLE public.insights ADD CONSTRAINT insights_category_check
  CHECK (category IN (
    'daily_gist',
    'smart_substitute',
    'protein_nudge',
    'sleep_hygiene',
    'activity_recommendation',
    'goal_calibration',
    'pattern_detection',
    'water_hydration',
    'weight_trend',
    'meal_nutrition'
  ));

-- Add staleness tracking columns
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS log_count_at_generation integer;
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS input_hash text;

-- Add composite index for latest-per-category lookups
CREATE INDEX IF NOT EXISTS insights_user_category_latest
  ON public.insights (user_id, category, created_at DESC);