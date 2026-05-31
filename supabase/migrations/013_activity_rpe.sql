-- v4: Add RPE intensity scoring + additional fields to activity_logs
alter table public.activity_logs
  add column if not exists rpe smallint check (rpe between 1 and 10),
  add column if not exists distance_km numeric(6,2),
  add column if not exists heart_rate_avg smallint,
  add column if not exists heart_rate_max smallint,
  add column if not exists notes text;

-- Backfill rpe from intensity_label
update public.activity_logs
set rpe = case
  when intensity_label = 'low' then 3
  when intensity_label = 'moderate' then 6
  when intensity_label = 'high' then 8
  else 5
end
where rpe is null;
