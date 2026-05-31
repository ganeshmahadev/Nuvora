-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";

-- Shared updated_at trigger function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
