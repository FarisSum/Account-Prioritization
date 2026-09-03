# Account Prioritization

An internal tool for **Adyen account managers**. It ranks a book of existing
customer accounts by a transparent 0–100 **expansion-readiness score** built from
three sources — product usage, the CRM record, and positive signals from Gong
calls — and, on demand, runs an agent that researches an account and drafts the
recommended next action.

## Stack

- **Next.js 16** (App Router, Server Components) + **React 19**
- **Tailwind CSS v4** (Adyen-green accent, light + dark)
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) — Postgres + read-only "demo" RLS
- **Tavily Research API** + **Anthropic Claude** (`@anthropic-ai/sdk`) — the "next action" agent

---

## Quick start

### 1. Prerequisites

- **Node ≥ 20** (this repo is developed on Node 24 via `nvm`; `nvm use` picks it up if you add an `.nvmrc`)
- npm (bundled with Node)

### 2. Install

```bash
npm install
```

### 3. Run

```bash
npm run dev        # http://localhost:3000
```

**With no `.env.local`** the app runs against a bundled offline dataset
(`lib/mock-data.ts`, 8 accounts) and the "next action" agent is disabled — enough
to see the UI.

**For the full experience** (70 accounts, live data, working agent) create
`.env.local` — see [Environment](#environment) below — then `npm run dev` again.

### 4. Other scripts

```bash
npm run build      # production build
npm start          # serve the production build (after `npm run build`)
npm run lint       # ESLint
npx tsc --noEmit   # type-check
```

---

## Environment

Copy `.env.local.example` → `.env.local` and fill it in. `.env.local` is
git-ignored.

| var | required? | purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | for live data | Supabase project URL. Already known: `https://omcmtkmhcxucllarookv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for live data | Supabase **publishable** key (`sb_publishable_…`) or legacy anon JWT. Safe to expose — every query is gated by RLS. Without this + the URL, `lib/data.ts` falls back to `lib/mock-data.ts` |
| `TAVILY_API_KEY` | for the agent | Tavily Research API key (`tvly-…`). **Server-only** — never prefix `NEXT_PUBLIC_` |
| `ANTHROPIC_API_KEY` | for the agent | Anthropic API key (`sk-ant-…`). **Server-only** |
| `ANTHROPIC_WORKSPACE_ID` | only if needed | Set to a `wrkspc_…` id **only** when `ANTHROPIC_API_KEY` is a personal / "all workspaces" key — Anthropic then requires the workspace on every request. A workspace-scoped key needs nothing here |

The two agent keys are read **only** in `app/api/accounts/[id]/recommend/route.ts`
(server); the Tavily/Claude calls never run in the browser.

---

## Database

Four tables in the `public` schema. `crm` is the spine; the rest reference it by
`domain`.

| table | migration | shape | feeds |
| --- | --- | --- | --- |
| `crm` | `0001` | 1 row per customer account | the whole app |
| `product_telemetry` | `0002` | 1 row per account — payments-platform usage (volume, auth rate, fraud, API, product adoption, …) | score (Product usage) + Signals page |
| `gong_signals` | `0002`, `0003` | many rows per account — one per call-transcript snippet; `category` ∈ Expansion / Cross-sell / Renewal / Competitive / Stakeholder / Feedback, `sentiment` ∈ Positive / Neutral / Negative, plus `last_detected_date` (`0003`) | score (Gong) + Signals page |
| `recommendations` | `0004`, `0005` | uuid `id`, many per account by `domain`; `status` ∈ `pending` / `completed` / `failed` (`0005`) | Next action page + dashboard sub-row |

Migrations:

| file | change |
| --- | --- |
| `0001_init.sql` | `crm` table, `set_updated_at` trigger fn, RLS (anon `SELECT`) |
| `0002_product_telemetry_and_gong_signals.sql` | both tables + RLS |
| `0003_gong_signals_last_detected_date.sql` | `gong_signals.last_detected_date` (backfilled, then `NOT NULL`) |
| `0004_recommendations.sql` | `recommendations` table; anon `SELECT` + `INSERT` policies (demo posture) |
| `0005_recommendations_pending_status.sql` | `'pending'` status, `started_at`, anon `UPDATE` policy (for the background task) |
| `0006_crm_adyen_arr.sql` | `crm.adyen_arr` (bigint) |
| `0007_crm_num_years_as_customer.sql` | `crm.num_years_as_customer` (numeric(3,1)) |

### `crm` columns

| column | notes |
| --- | --- |
| `domain` | primary key, e.g. `https://rhythmtx.com` |
| `company_name`, `industry`, `location`, `country` | descriptive |
| `lead_type` | `CHECK (lead_type = 'Customer')` — customers only |
| `account_owner` | the Account Manager |
| `annual_revenue` | USD (bigint) — the **customer's own** revenue; context only, not scored |
| `adyen_arr` | USD (bigint) — Adyen's ARR **from** this account; dashboard "ARR to Adyen" column + summary cards + the CRM scoring rule |
| `num_years_as_customer` | numeric(3,1) — tenure as an Adyen customer; dashboard "Tenure" column |
| `contract_renewal_date` | date |
| `employee_growth` | YoY %, may be negative |
| `employee_count` | integer |
| `created_at`, `updated_at` | timestamps (`updated_at` maintained by trigger) |

### Seed data

`supabase/seed.sql` — **70 sample customers** (20 hand-written + 50 generated),
each with a matching `product_telemetry` row and ~5–6 `gong_signals`.
`product_telemetry`, `adyen_arr`, `num_years_as_customer` and the generated
`gong_signals` are all derived deterministically from `md5(domain)`, so re-running
is stable. `recommendations` is left empty — the AM generates those in the UI.

The migrations + seed are **already applied** to project `omcmtkmhcxucllarookv`.
To rebuild a local DB: `supabase db reset` (runs migrations + `seed.sql`), or
paste `seed.sql` into the SQL editor of any DB that already has the schema.

RLS: the publishable key gets `SELECT` on all four tables, plus `INSERT` /
`UPDATE` on `recommendations` (so the agent route can write). No auth — this is a
demo posture; tighten to a service role or authenticated users for production.

---

## Scoring

All logic is in `lib/scoring.ts`. The DB stores only raw signals; the 0–100
score and its tier are derived in-app. The model is purely **additive** — each
rule fires for a fixed number of points or it doesn't (nothing is normalised),
so a score always traces straight back to the data.

| Section | Max | Rules |
| --- | --- | --- |
| **Product usage** | 40 | payment-volume YoY > 30%, transaction-count YoY > 30%, countries added YoY > 2, products added YoY > 1 — **10 pts each** |
| **CRM** | 18 | renewal < 180 days out **(5)**, employee growth > 15% **(5)**, Adyen ARR > $10M **(8)** |
| **Gong call signals** | 42 | **+7** per category that has a *positive* signal detected in the last 6 months, capped at one hit per category (6 × 7) |

Tiers: **Critical ≥ 65 · High ≥ 40 · Medium ≥ 20 · Low < 20**.

Every threshold lives in `RULES` and `TIER_THRESHOLDS` at the top of
`lib/scoring.ts` — change them there and the whole app (dashboard, `/scoring`
page, per-account breakdown) follows. The `/scoring` route renders the full
methodology + a worked example; each account's score page shows its own
line-by-line breakdown.

---

## Recommended next action agent

Open any account → **Next action** tab → **Run agent** (`components/generate-recommendation.tsx`).
The button POSTs to `app/api/accounts/[id]/recommend/route.ts`, which:

1. gathers the account's `crm` + `product_telemetry` + `gong_signals` and its
   current score breakdown (`lib/recommend.ts` → `internalBrief`), inserts a
   `status:'pending'` row, and returns **202 immediately**;
2. in a Next.js `after()` callback — which keeps running if the user navigates
   away or closes the tab — runs a Tavily **research** task on the company domain
   (`lib/tavily.ts`, async poll, ~30–120 s), then asks Claude (`claude-opus-5`,
   `lib/anthropic.ts`) for one JSON recommendation (headline, action, rationale,
   talking points, context, confidence), and **updates** the pending row.

While pending, the page shows an "Agent running…" card with a light poller
(`components/pending-poller.tsx`) that refreshes until the row resolves. The
dashboard shows the latest headline as a full-width sub-row under the account and
a "Next action →" link on every row. Failures (missing key, Tavily timeout,
Claude refusal) are stored as a `status:'failed'` row with the error and surfaced
on both pages; a `pending` row older than 4 minutes is treated as stuck and the
Run button reappears.

**Deploying the agent on Vercel:** the route declares `maxDuration = 120`. That
needs **Vercel Pro** (Hobby caps functions at 60 s, and a slow research poll can
be cut off mid-run, leaving a stuck `pending` row). Set every env var above in
**Project Settings → Environment Variables**, and **redeploy** after changing any
`NEXT_PUBLIC_*` value — those are inlined at build time.

---

## Project layout

### Routes

| path | purpose |
| --- | --- |
| `app/page.tsx` | Ranked dashboard (server) → `components/dashboard.tsx` |
| `app/scoring/page.tsx` | Scoring methodology + worked example |
| `app/accounts/[id]/page.tsx` | Score breakdown (`[id]` = url-encoded domain) |
| `app/accounts/[id]/signals/page.tsx` | Account signals — sub-tabs for **Product usage** / **Call signals** (`components/signals-tabs.tsx`) |
| `app/accounts/[id]/next-action/page.tsx` | Latest recommendation + Run-agent card |
| `app/api/accounts/[id]/recommend/route.ts` | `POST` — start the next-action agent (background) |

### `lib/`

| file | purpose |
| --- | --- |
| `scoring.ts` | Additive priority model (`RULES`, `TIER_THRESHOLDS`, `scoreAccount`) |
| `recommend.ts` | Next-action orchestrator: internal brief → Tavily → Claude → persist |
| `tavily.ts` / `anthropic.ts` | Tavily Research client / Claude synthesis |
| `data.ts` | Supabase-or-mock data access seam (all reads/writes go through here) |
| `view.ts` | Joins accounts to score + priority rank for the dashboard |
| `types.ts` | `CrmAccount`, `ProductTelemetry`, `GongSignal`, `Recommendation`, … |
| `format.ts` | Currency / date / percentage helpers |
| `mock-data.ts` | Offline fallback dataset (used when Supabase env is absent) |
| `supabase/server.ts` | Server-side Supabase client |

### `components/`

| file | purpose |
| --- | --- |
| `app-shell.tsx` | Top nav + footer wrapper (in `app/layout.tsx`) |
| `dashboard.tsx` | The ranked table + filters + summary cards |
| `account-header.tsx` / `account-tabs.tsx` | Shared header + Score / Signals / Next action sub-nav |
| `score-breakdown.tsx` | Section/line score breakdown (score page + `/scoring`) |
| `signals.tsx` | Presentational bits: `MetricCard`, `MetricGroup`, `Chips`, `SentimentBadge`, `GrowthText` |
| `signals-tabs.tsx` | Client toggle between the Product usage and Call signals panels |
| `generate-recommendation.tsx` | "Run agent" card (client) |
| `pending-poller.tsx` | Refreshes the page while a recommendation is generating |
| `primitives.tsx` | `TierBadge`, `SegmentedScoreBar`, `AgentIcon`, `MeterBar` |
