-- How long this account has been an Adyen customer, in years (one decimal).
-- Populated in supabase/seed.sql (deterministic from md5(domain) + account size
-- / growth: established accounts skew longer, hypergrowth accounts shorter).
alter table public.crm
  add column if not exists num_years_as_customer numeric(3,1) not null default 0;
