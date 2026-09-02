// Row shapes for the Supabase tables (see supabase/migrations/).
// Dates come back from PostgREST as ISO strings; numeric columns as numbers.

export interface CrmAccount {
  domain: string; // primary key, e.g. "https://rhythmtx.com"
  company_name: string;
  lead_type: "Customer"; // the app only handles existing customers
  employee_growth: number; // YoY %, e.g. 20 or -8.5
  account_owner: string; // the Account Manager
  industry: string | null;
  employee_count: number;
  annual_revenue: number; // USD
  contract_renewal_date: string | null; // ISO date
  location: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

// public.product_telemetry — one row per account, payments-platform usage.
export interface ProductTelemetry {
  domain: string;
  payment_volume_monthly: number | null;
  payment_volume_yoy_growth: number | null;
  transaction_count_monthly: number | null;
  transaction_count_yoy_growth: number | null;
  authorization_rate: number | null;
  decline_rate: number | null;
  payment_methods_used: string[];
  countries_processing: number | null;
  countries_added_yoy: number | null;
  currencies_processed: number | null;
  api_calls_monthly: number | null;
  api_volume_yoy_growth: number | null;
  api_error_rate: number | null;
  recurring_payments_monthly: number | null;
  recurring_payment_yoy_growth: number | null;
  tokens_stored: number | null;
  risk_rules_active: number | null;
  fraud_rate: number | null;
  chargebacks_monthly: number | null;
  dispute_management_pct: number | null;
  reporting_exports_monthly: number | null;
  active_users: number | null;
  active_api_keys: number | null;
  webhooks_monthly: number | null;
  webhook_failure_rate: number | null;
  products_adopted: string[];
  products_added_yoy: number | null;
  created_at: string;
  updated_at: string;
}

export type GongCategory =
  | "Expansion"
  | "Cross-sell"
  | "Competitive"
  | "Stakeholder"
  | "Renewal"
  | "Feedback";

export type GongSentiment = "Positive" | "Neutral" | "Negative";

// public.gong_signals — many rows per account, one per call-transcript snippet.
export interface GongSignal {
  transcript_id: string;
  domain: string;
  category: GongCategory;
  sentiment: GongSentiment;
  signal: string;
  transcript_text: string;
  last_detected_date: string; // ISO date — when the signal was last heard on a call
  created_at: string;
}

export interface ResearchSource {
  title: string;
  url: string;
  favicon?: string | null;
}

export type Confidence = "high" | "medium" | "low";

// public.recommendations — "recommended next action" outputs, newest wins.
export interface Recommendation {
  id: string;
  domain: string;
  status: "completed" | "failed";
  headline: string | null;
  action: string | null;
  rationale: string | null;
  talking_points: string[];
  supporting_context: string | null;
  confidence: Confidence | null;
  score_snapshot: number | null;
  tier_snapshot: string | null;
  research_summary: string | null;
  research_sources: ResearchSource[];
  model: string | null;
  error: string | null;
  created_at: string;
}
