// Offline fallback for lib/data.ts when Supabase env vars are absent.
// A subset of supabase/seed.sql; keep roughly in sync. "Today" is ~2026-09-01.

import type { CrmAccount, GongSignal, ProductTelemetry } from "./types";

const TS = "2026-08-01T09:00:00Z";

type Seed = Omit<CrmAccount, "lead_type" | "created_at" | "updated_at">;

const SEEDS: Seed[] = [
  { domain: "https://rhythmtx.com", company_name: "Rhythm Pharmaceuticals", employee_growth: 20, account_owner: "Sam Cool", industry: "Pharmaceutical", employee_count: 300, annual_revenue: 30_000_000, contract_renewal_date: "2027-01-01", location: "Boston, MA", country: "USA" },
  { domain: "https://novacore.io", company_name: "NovaCore Systems", employee_growth: 42, account_owner: "Dana Whitfield", industry: "SaaS", employee_count: 1200, annual_revenue: 85_000_000, contract_renewal_date: "2026-10-15", location: "Austin, TX", country: "USA" },
  { domain: "https://pinnaclefin.com", company_name: "Pinnacle Financial", employee_growth: 5, account_owner: "Marcus Lee", industry: "Fintech", employee_count: 4500, annual_revenue: 260_000_000, contract_renewal_date: "2026-09-25", location: "New York, NY", country: "USA" },
  { domain: "https://brightleaf.co", company_name: "Brightleaf Retail", employee_growth: -12, account_owner: "Priya Nair", industry: "Retail", employee_count: 800, annual_revenue: 40_000_000, contract_renewal_date: "2026-11-30", location: "Chicago, IL", country: "USA" },
  { domain: "https://orbitallogistics.com", company_name: "Orbital Logistics", employee_growth: -18, account_owner: "Marcus Lee", industry: "Logistics", employee_count: 3200, annual_revenue: 140_000_000, contract_renewal_date: "2026-10-05", location: "Memphis, TN", country: "USA" },
  { domain: "https://quantumsec.io", company_name: "Quantum Security", employee_growth: 48, account_owner: "Dana Whitfield", industry: "Cybersecurity", employee_count: 600, annual_revenue: 47_000_000, contract_renewal_date: "2026-12-05", location: "Reston, VA", country: "USA" },
  { domain: "https://lumen-edu.org", company_name: "Lumen Education", employee_growth: 3, account_owner: "Priya Nair", industry: "Education", employee_count: 400, annual_revenue: 12_000_000, contract_renewal_date: "2027-08-20", location: "Denver, CO", country: "USA" },
  { domain: "https://apextelecom.net", company_name: "Apex Telecom", employee_growth: -3, account_owner: "Tom Alvarez", industry: "Telecom", employee_count: 7500, annual_revenue: 410_000_000, contract_renewal_date: "2027-09-15", location: "Dallas, TX", country: "USA" },
];

export const MOCK_ACCOUNTS: CrmAccount[] = SEEDS.map((s) => ({
  ...s,
  lead_type: "Customer",
  created_at: TS,
  updated_at: TS,
}));

const ALL_METHODS = ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "iDEAL", "Klarna", "SEPA Direct Debit"];
const ALL_PRODUCTS = ["Online Payments", "POS", "Risk", "Recurring", "Payouts", "Data & Reporting"];

/** Derive plausible telemetry from a mock crm row (Supabase has the real thing). */
export function mockTelemetry(domain: string): ProductTelemetry | null {
  const a = MOCK_ACCOUNTS.find((x) => x.domain === domain);
  if (!a) return null;
  const g = a.employee_growth;
  const pv = Math.round(a.annual_revenue * 1.35);
  const pvg = Math.round(g * 1.9 * 10) / 10;
  const txn = Math.round(pv / 45);
  const authr = Math.round((90 + (g < 0 ? g * 0.15 : 1)) * 10) / 10;
  const methodCount = g > 20 ? 7 : g < 0 ? 5 : 6;
  const productCount = g > 20 ? 5 : g < -10 ? 2 : 4;
  return {
    domain,
    payment_volume_monthly: pv,
    payment_volume_yoy_growth: pvg,
    transaction_count_monthly: txn,
    transaction_count_yoy_growth: Math.round(pvg * 0.9 * 10) / 10,
    authorization_rate: authr,
    decline_rate: Math.round((100 - authr) * 10) / 10,
    payment_methods_used: ALL_METHODS.slice(0, methodCount),
    countries_processing: Math.max(1, Math.round(Math.log(a.employee_count) * 1.3)),
    countries_added_yoy: g < 0 ? 0 : g > 25 ? 3 : 1,
    currencies_processed: Math.max(1, Math.round(Math.log(a.employee_count))),
    api_calls_monthly: txn * 7,
    api_volume_yoy_growth: Math.round(g * 2 * 10) / 10,
    api_error_rate: Math.round((0.6 + (g < 0 ? 0.4 : 0)) * 10) / 10,
    recurring_payments_monthly: Math.round(txn * 0.08),
    recurring_payment_yoy_growth: Math.round(g * 2.1 * 10) / 10,
    tokens_stored: Math.round(txn * 0.4),
    risk_rules_active: 20 + (productCount * 4),
    fraud_rate: Math.round((0.15 + (g < 0 ? 0.2 : 0)) * 1000) / 1000,
    chargebacks_monthly: Math.round(txn * 0.0015),
    dispute_management_pct: 85,
    reporting_exports_monthly: 12 + productCount * 4,
    active_users: Math.max(2, Math.round(Math.log(a.employee_count) * 2.4)),
    active_api_keys: Math.max(1, Math.round(Math.log(a.employee_count))),
    webhooks_monthly: txn * 4,
    webhook_failure_rate: 0.4,
    products_adopted: ALL_PRODUCTS.slice(0, productCount),
    products_added_yoy: g < 0 ? 0 : g > 30 ? 2 : 1,
    created_at: TS,
    updated_at: TS,
  };
}

/** A few generic call signals for the mock domains. */
export function mockGongSignals(domain: string): GongSignal[] {
  const a = MOCK_ACCOUNTS.find((x) => x.domain === domain);
  if (!a) return [];
  const rows: Omit<GongSignal, "domain" | "created_at">[] =
    a.employee_growth < 0
      ? [
          { transcript_id: `${domain}#1`, category: "Competitive", sentiment: "Negative", signal: "Competitor evaluation", transcript_text: "We're comparing pricing and coverage with another processor as part of a vendor review." },
          { transcript_id: `${domain}#2`, category: "Renewal", sentiment: "Negative", signal: "Pricing concern", transcript_text: "Our processing costs have become hard to justify given where volume is trending." },
          { transcript_id: `${domain}#3`, category: "Stakeholder", sentiment: "Negative", signal: "Champion departed", transcript_text: "The person who owned this relationship has left and the new team is re-evaluating vendors." },
        ]
      : [
          { transcript_id: `${domain}#1`, category: "Expansion", sentiment: "Positive", signal: "Volume growth", transcript_text: "Processing volume is up year over year and the forecast has it climbing further." },
          { transcript_id: `${domain}#2`, category: "Cross-sell", sentiment: "Positive", signal: "Recurring Payments", transcript_text: "We want to consolidate subscription billing and expand our use of recurring payments." },
          { transcript_id: `${domain}#3`, category: "Competitive", sentiment: "Negative", signal: "Competitor evaluation", transcript_text: "We're also benchmarking pricing with another provider as we scale." },
        ];
  return rows.map((r) => ({ ...r, domain, created_at: TS }));
}
