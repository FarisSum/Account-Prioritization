-- Two more per-account data sources, both keyed to public.crm(domain).
--   product_telemetry — one row per account, payments-platform usage metrics.
--   gong_signals      — many rows per account, one per call-transcript snippet.
-- Neither feeds the priority score; they power the account "Signals" page.

create table if not exists public.product_telemetry (
  domain                        text primary key references public.crm(domain) on delete cascade,
  payment_volume_monthly        bigint,        -- USD processed per month
  payment_volume_yoy_growth     numeric(6,2),  -- percent, may be negative
  transaction_count_monthly     bigint,
  transaction_count_yoy_growth  numeric(6,2),
  authorization_rate            numeric(5,2),  -- percent
  decline_rate                  numeric(5,2),  -- percent
  payment_methods_used          text[] not null default '{}',
  countries_processing          integer,
  countries_added_yoy           integer,
  currencies_processed          integer,
  api_calls_monthly             bigint,
  api_volume_yoy_growth         numeric(6,2),
  api_error_rate                numeric(5,2),
  recurring_payments_monthly    bigint,
  recurring_payment_yoy_growth  numeric(6,2),
  tokens_stored                 bigint,
  risk_rules_active             integer,
  fraud_rate                    numeric(6,3),  -- percent of volume
  chargebacks_monthly           integer,
  dispute_management_pct        numeric(5,2),  -- percent of disputes handled in-platform
  reporting_exports_monthly     integer,
  active_users                  integer,       -- dashboard users
  active_api_keys               integer,
  webhooks_monthly              bigint,
  webhook_failure_rate          numeric(5,2),  -- percent
  products_adopted              text[] not null default '{}',
  products_added_yoy            integer,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now()
);

drop trigger if exists product_telemetry_set_updated_at on public.product_telemetry;
create trigger product_telemetry_set_updated_at
  before update on public.product_telemetry
  for each row execute function public.set_updated_at();

alter table public.product_telemetry enable row level security;
drop policy if exists "public read product_telemetry" on public.product_telemetry;
create policy "public read product_telemetry"
  on public.product_telemetry for select using (true);

create table if not exists public.gong_signals (
  transcript_id   text primary key,                 -- e.g. TRX-001
  domain          text not null references public.crm(domain) on delete cascade,
  category        text not null check (category in
                    ('Expansion','Cross-sell','Competitive','Stakeholder','Renewal','Feedback')),
  sentiment       text not null check (sentiment in ('Positive','Neutral','Negative')),
  signal          text not null,
  transcript_text text not null,
  created_at      timestamptz not null default now()
);

create index if not exists gong_signals_domain_idx   on public.gong_signals (domain);
create index if not exists gong_signals_category_idx on public.gong_signals (category);

alter table public.gong_signals enable row level security;
drop policy if exists "public read gong_signals" on public.gong_signals;
create policy "public read gong_signals"
  on public.gong_signals for select using (true);
