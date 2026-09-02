-- "Recommended next action" outputs. One row per generation run, newest wins.
-- Populated by the server route app/api/accounts/[id]/recommend, which combines
-- CRM + telemetry + Gong signals with Tavily research and a Claude synthesis.
create table if not exists public.recommendations (
  id                  uuid primary key default gen_random_uuid(),
  domain              text not null references public.crm(domain) on delete cascade,
  status              text not null default 'completed'
                        check (status in ('completed', 'failed')),
  headline            text,
  action              text,
  rationale           text,
  talking_points      text[] not null default '{}',
  supporting_context  text,
  confidence          text check (confidence in ('high', 'medium', 'low')),
  score_snapshot      numeric(5,1),
  tier_snapshot       text,
  research_summary    text,                          -- Tavily research report (trimmed)
  research_sources    jsonb not null default '[]',   -- [{title,url,favicon}]
  model               text,                          -- Claude model id used
  error               text,                          -- set when status = 'failed'
  created_at          timestamptz not null default now()
);

create index if not exists recommendations_domain_created_idx
  on public.recommendations (domain, created_at desc);

alter table public.recommendations enable row level security;

drop policy if exists "public read recommendations" on public.recommendations;
create policy "public read recommendations"
  on public.recommendations for select using (true);

-- Demo posture: the app uses the publishable key and has no auth, so allow
-- inserts from the server route with that key. Tighten to a service role or
-- authenticated users if real auth is added.
drop policy if exists "public insert recommendations" on public.recommendations;
create policy "public insert recommendations"
  on public.recommendations for insert with check (true);
