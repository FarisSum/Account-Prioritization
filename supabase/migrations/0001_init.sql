-- Account Prioritization — CRM accounts (customers only).
--
-- One row per customer account. Priority score and tier are NOT stored here;
-- they are computed on the front end (lib/scoring.ts) from these raw signals
-- so the weighting stays transparent and tunable.
--
-- Applied to the remote project as migrations `crm_schema` and
-- `harden_set_updated_at_search_path`; kept here as one file for local runs.

create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.crm (
  domain                text primary key,
  company_name          text not null,
  lead_type             text not null default 'Customer'
                          check (lead_type = 'Customer'),
  employee_growth       numeric(6,1) not null default 0,        -- YoY %, e.g. 20.0 or -8.5
  account_owner         text not null,
  industry              text,
  employee_count        integer not null default 0 check (employee_count >= 0),
  annual_revenue        bigint  not null default 0 check (annual_revenue >= 0), -- USD
  contract_renewal_date date,
  location              text,
  country               text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists crm_account_owner_idx on public.crm (account_owner);
create index if not exists crm_renewal_idx       on public.crm (contract_renewal_date);

drop trigger if exists crm_set_updated_at on public.crm;
create trigger crm_set_updated_at
  before update on public.crm
  for each row execute function public.set_updated_at();

-- Row Level Security — demo mode: read-only for the anon/publishable key,
-- no client writes.
alter table public.crm enable row level security;

drop policy if exists "public read crm" on public.crm;
create policy "public read crm"
  on public.crm for select
  using (true);
