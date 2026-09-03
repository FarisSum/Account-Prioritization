-- Adyen's annual recurring revenue earned FROM this customer account (USD).
-- Distinct from crm.annual_revenue (the customer company's own revenue, which is
-- what the priority-score CRM rule reads). Populated in supabase/seed.sql from
-- processed volume × a blended take rate.
alter table public.crm add column if not exists adyen_arr bigint not null default 0;
