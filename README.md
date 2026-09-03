# Account Prioritization

Next.js (App Router) + Tailwind dashboard for Account Managers. It ranks
**existing customer** accounts by a transparent, weighted blend of revenue,
renewal timing and growth signals pulled from a Supabase `crm` table.

## Stack

- Next.js 16 (App Router, Server Components) + React 19
- Tailwind CSS v4 (Adyen-green accent)
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`) — read-only "demo" RLS
- Tavily Research API + Anthropic Claude (`@anthropic-ai/sdk`) — the "next action" agent

## Database

Four tables, all keyed on `domain`:

- **`crm`** (`0001_init.sql`) — one row per customer account.
- **`product_telemetry`** (`0002_*.sql`) — one row per account, payments-platform
  usage metrics (volume, auth rate, fraud, API, product adoption, …).
- **`gong_signals`** (`0002_*.sql`, `0003_*.sql`) — many rows per account, one per
  call-transcript snippet (`category` ∈ Expansion / Cross-sell / Competitive /
  Stakeholder / Renewal / Feedback, `sentiment` ∈ Positive / Neutral / Negative,
  `last_detected_date`).
- **`recommendations`** (`0004_*.sql`) — output of the "next action" agent, newest
  wins. `select` + `insert` allowed for the publishable key (demo posture).

All four feed the score / UI: `crm` + `product_telemetry` + recent positive
`gong_signals` drive the priority score; the **Signals** page
(`/accounts/[domain]/signals`) shows product usage + call snippets; the **Next
action** page (`/accounts/[domain]/next-action`) shows the latest recommendation.

### `crm` columns

One row per customer account:

| column | notes |
| --- | --- |
| `domain` | primary key, e.g. `https://rhythmtx.com` |
| `company_name`, `industry`, `location`, `country` | descriptive |
| `lead_type` | `CHECK (lead_type = 'Customer')` — customers only |
| `account_owner` | the Account Manager |
| `annual_revenue` | USD (bigint) — the customer's own revenue (context only; not scored) |
| `adyen_arr` | USD (bigint) — Adyen's ARR *from* this account; dashboard "ARR to Adyen" column + summary cards, and the scoring CRM rule |
| `num_years_as_customer` | numeric(3,1) — tenure as an Adyen customer; dashboard "Tenure" column |
| `contract_renewal_date` | date |
| `employee_growth` | YoY %, may be negative |
| `employee_count` | integer |

Schema + `supabase/seed.sql` (20 sample customers, matching usage rows, ~5 call
signals each) are already applied to project `omcmtkmhcxucllarookv`. RLS allows
anon `SELECT` only. Usage values are derived deterministically from each
`crm` row (`md5(domain)` is the only randomness) so they track account size and
growth.

To re-seed or run locally: `supabase db reset` (applies migrations + seed), or
paste `seed.sql` into the SQL editor.

## Run

```bash
npm run dev   # http://localhost:3000
```

`.env.local` (see `.env.local.example`):

| var | purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase read/write. Without them `lib/data.ts` falls back to `lib/mock-data.ts` |
| `TAVILY_API_KEY` | Tavily Research API — **server-only**, powers the "next action" agent |
| `ANTHROPIC_API_KEY` | Claude synthesis for the "next action" agent — **server-only** |

The two agent keys must never be `NEXT_PUBLIC_*` — the Tavily/Claude calls run
only in `app/api/accounts/[id]/recommend/route.ts`, never in the browser.

## Recommended next action agent

`/accounts/[domain]/next-action` → **Generate**. The POST route:

1. gathers the account's `crm` + `product_telemetry` + `gong_signals` and the
   current score breakdown (`lib/recommend.ts` → `internalBrief`), inserts a
   `status:'pending'` row, and returns **202 immediately**;
2. in a Next.js `after()` callback (survives client navigation / tab close) it
   runs a Tavily **research** task on the domain (`lib/tavily.ts`, async poll,
   ~30–120 s), then asks Claude (`claude-opus-5`, `lib/anthropic.ts`) for one
   JSON recommendation — headline, action, rationale, talking points, context,
   confidence — and **updates** the pending row.

The next-action page shows a "Generating…" state + a light poller while pending;
the dashboard shows the latest headline as a full-width sub-row under each
account (`getLatestRecommendationsByDomain`). Failures (missing key, Tavily
timeout, refusal) become a `status:'failed'` row with the error, surfaced on
both pages.

`ANTHROPIC_WORKSPACE_ID` (optional) — set to a `wrkspc_…` id if your
`ANTHROPIC_API_KEY` is workspace-scoped / identity-linked; the client sends the
`anthropic-workspace-id` header only when it's present.

## Scoring

All logic is in `lib/scoring.ts`. The DB stores only raw signals; the 0–100
**expansion-readiness** score and its tier are derived in-app. The model is
purely additive — each rule fires for fixed points or doesn't:

| Section | Max | Rules |
| --- | --- | --- |
| Product usage | 40 | payment-volume YoY > 30%, transaction YoY > 30%, countries added > 2, products added > 1 — 10 pts each |
| CRM | 18 | renewal < 180 days out (5), employee growth > 15% (5), Adyen ARR > $10M (8) |
| Gong call signals | 42 | +7 per signal category with a positive signal detected in the last 6 months, capped at one hit per category (6 × 7) |

Tiers: **Critical ≥ 65 · High ≥ 40 · Medium ≥ 20 · Low < 20**. Thresholds and
rule constants live in `RULES` / `TIER_THRESHOLDS` at the top of the file. The
full methodology + a worked example render at **`/scoring`**; every account's
score page shows its own line-by-line breakdown.

## Layout

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Ranked dashboard (server), renders `components/dashboard.tsx` |
| `app/accounts/[id]/page.tsx` | Score breakdown (`[id]` = url-encoded domain) |
| `app/accounts/[id]/signals/page.tsx` | Product usage + Gong call signals |
| `app/accounts/[id]/next-action/page.tsx` | Latest recommendation + Generate button |
| `app/api/accounts/[id]/recommend/route.ts` | POST: run the next-action pipeline |
| `app/scoring/page.tsx` | Methodology explainer + worked example |
| `components/account-tabs.tsx` | Sub-nav: Score / Signals / Next action |
| `components/score-breakdown.tsx` | Section/line breakdown, shared by score + scoring pages |
| `lib/scoring.ts` | Additive priority model (usage + CRM + Gong) |
| `lib/recommend.ts` | Next-action orchestrator (internal brief → Tavily → Claude → persist) |
| `lib/tavily.ts` / `lib/anthropic.ts` | Tavily Research client / Claude synthesis |
| `lib/data.ts` | Supabase-or-mock data access seam |
| `lib/types.ts` | `CrmAccount`, `ProductTelemetry`, `GongSignal`, `Recommendation` |
| `lib/mock-data.ts` | Offline fallback dataset |
| `lib/supabase/server.ts` | Server-side Supabase client |
