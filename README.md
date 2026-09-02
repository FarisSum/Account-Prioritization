# Account Prioritization

Next.js (App Router) + Tailwind dashboard for Account Managers. It ranks
**existing customer** accounts by a transparent, weighted blend of revenue,
renewal timing and growth signals pulled from a Supabase `crm` table.

## Stack

- Next.js 16 (App Router, Server Components) + React 19
- Tailwind CSS v4
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`) — read-only "demo" RLS

## Database

Three tables, all keyed on `domain`:

- **`crm`** (`0001_init.sql`) — one row per customer account; the only source
  the priority score reads from.
- **`product_telemetry`** (`0002_*.sql`) — one row per account, payments-platform
  usage metrics (volume, auth rate, fraud, API, product adoption, …).
- **`gong_signals`** (`0002_*.sql`) — many rows per account, one per
  call-transcript snippet (`category` ∈ Expansion / Cross-sell / Competitive /
  Stakeholder / Renewal / Feedback, `sentiment` ∈ Positive / Neutral / Negative).

`product_telemetry` and `gong_signals` do **not** feed the score — they power the
per-account **Signals** page (`/accounts/[domain]/signals`), a drill-in sibling
to the score-breakdown page.

### `crm` columns

One row per customer account:

| column | notes |
| --- | --- |
| `domain` | primary key, e.g. `https://rhythmtx.com` |
| `company_name`, `industry`, `location`, `country` | descriptive |
| `lead_type` | `CHECK (lead_type = 'Customer')` — customers only |
| `account_owner` | the Account Manager |
| `annual_revenue` | USD (bigint) |
| `contract_renewal_date` | date |
| `employee_growth` | YoY %, may be negative |
| `employee_count` | integer |

Schema + `supabase/seed.sql` (20 sample customers, matching telemetry, ~5 call
signals each) are already applied to project `omcmtkmhcxucllarookv`. RLS allows
anon `SELECT` only. Telemetry values are derived deterministically from each
`crm` row (`md5(domain)` is the only randomness) so they track account size and
growth.

To re-seed or run locally: `supabase db reset` (applies migrations + seed), or
paste `seed.sql` into the SQL editor.

## Run

```bash
npm run dev   # http://localhost:3000
```

`.env.local` holds `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(publishable key). With them set, `lib/data.ts` reads from Supabase; without
them it falls back to `lib/mock-data.ts`.

## Scoring

All logic is in `lib/scoring.ts`. The DB stores only raw signals; the 0–100
**expansion-readiness** score and its tier are derived in-app. The model is
purely additive — each rule fires for fixed points or doesn't:

| Section | Max | Rules |
| --- | --- | --- |
| Product telemetry | 40 | payment-volume YoY > 30%, transaction YoY > 30%, countries added > 2, products added > 1 — 10 pts each |
| CRM | 15 | renewal < 180 days out, employee growth > 15%, annual revenue > $25M — 5 pts each |
| Gong call signals | 45 | +7.5 per signal category with a positive signal detected in the last 6 months, capped at one hit per category (6 × 7.5) |

Tiers: **Critical ≥ 65 · High ≥ 40 · Medium ≥ 20 · Low < 20**. Thresholds and
rule constants live in `RULES` / `TIER_THRESHOLDS` at the top of the file. The
full methodology + a worked example render at **`/scoring`**; every account's
score page shows its own line-by-line breakdown.

## Layout

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Ranked dashboard (server), renders `components/dashboard.tsx` |
| `app/accounts/[id]/page.tsx` | Score breakdown (`[id]` = url-encoded domain) |
| `app/accounts/[id]/signals/page.tsx` | Product telemetry + Gong call signals |
| `app/scoring/page.tsx` | Methodology explainer + worked example |
| `components/account-tabs.tsx` | Sub-nav between the two drill-in pages |
| `components/score-breakdown.tsx` | Section/line breakdown, shared by score + scoring pages |
| `lib/scoring.ts` | Additive priority model (telemetry + CRM + Gong) |
| `lib/data.ts` | Supabase-or-mock data access seam |
| `lib/types.ts` | `CrmAccount`, `ProductTelemetry`, `GongSignal` |
| `lib/mock-data.ts` | Offline fallback dataset |
| `lib/supabase/server.ts` | Server-side Supabase client |
