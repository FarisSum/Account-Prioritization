// Data access seam. Reads from Supabase when it is configured
// (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local),
// otherwise serves lib/mock-data.ts so the UI still works.

import {
  MOCK_ACCOUNTS,
  mockGongSignals,
  mockTelemetry,
} from "./mock-data";
import type { CrmAccount, GongSignal, ProductTelemetry, Recommendation } from "./types";

const SUPABASE_READY =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseConfigured(): boolean {
  return SUPABASE_READY;
}

async function client() {
  const { createSupabaseServerClient } = await import("./supabase/server");
  return createSupabaseServerClient();
}

export async function getAccounts(): Promise<CrmAccount[]> {
  if (!SUPABASE_READY) return MOCK_ACCOUNTS;
  try {
    const supabase = await client();
    const { data, error } = await supabase
      .from("crm")
      .select("*")
      .order("company_name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as CrmAccount[];
  } catch (err) {
    console.warn("[data] Supabase read failed, falling back to mock data:", err);
    return MOCK_ACCOUNTS;
  }
}

export async function getAccount(domain: string): Promise<CrmAccount | null> {
  if (!SUPABASE_READY) return MOCK_ACCOUNTS.find((a) => a.domain === domain) ?? null;
  try {
    const supabase = await client();
    const { data, error } = await supabase
      .from("crm")
      .select("*")
      .eq("domain", domain)
      .maybeSingle();
    if (error) throw error;
    return (data as CrmAccount) ?? null;
  } catch (err) {
    console.warn("[data] Supabase read failed, falling back to mock data:", err);
    return MOCK_ACCOUNTS.find((a) => a.domain === domain) ?? null;
  }
}

export async function getAllProductTelemetry(): Promise<ProductTelemetry[]> {
  if (!SUPABASE_READY) {
    return MOCK_ACCOUNTS.map((a) => mockTelemetry(a.domain)).filter(
      (t): t is ProductTelemetry => t !== null,
    );
  }
  try {
    const supabase = await client();
    const { data, error } = await supabase.from("product_telemetry").select("*");
    if (error) throw error;
    return (data ?? []) as ProductTelemetry[];
  } catch (err) {
    console.warn("[data] Supabase read failed, falling back to mock data:", err);
    return MOCK_ACCOUNTS.map((a) => mockTelemetry(a.domain)).filter(
      (t): t is ProductTelemetry => t !== null,
    );
  }
}

export async function getAllGongSignals(): Promise<GongSignal[]> {
  if (!SUPABASE_READY) return MOCK_ACCOUNTS.flatMap((a) => mockGongSignals(a.domain));
  try {
    const supabase = await client();
    const { data, error } = await supabase
      .from("gong_signals")
      .select("*")
      .order("transcript_id", { ascending: true });
    if (error) throw error;
    return (data ?? []) as GongSignal[];
  } catch (err) {
    console.warn("[data] Supabase read failed, falling back to mock data:", err);
    return MOCK_ACCOUNTS.flatMap((a) => mockGongSignals(a.domain));
  }
}

export async function getProductTelemetry(domain: string): Promise<ProductTelemetry | null> {
  if (!SUPABASE_READY) return mockTelemetry(domain);
  try {
    const supabase = await client();
    const { data, error } = await supabase
      .from("product_telemetry")
      .select("*")
      .eq("domain", domain)
      .maybeSingle();
    if (error) throw error;
    return (data as ProductTelemetry) ?? null;
  } catch (err) {
    console.warn("[data] Supabase read failed, falling back to mock data:", err);
    return mockTelemetry(domain);
  }
}

export async function getGongSignals(domain: string): Promise<GongSignal[]> {
  if (!SUPABASE_READY) return mockGongSignals(domain);
  try {
    const supabase = await client();
    const { data, error } = await supabase
      .from("gong_signals")
      .select("*")
      .eq("domain", domain)
      .order("transcript_id", { ascending: true });
    if (error) throw error;
    return (data ?? []) as GongSignal[];
  } catch (err) {
    console.warn("[data] Supabase read failed, falling back to mock data:", err);
    return mockGongSignals(domain);
  }
}

// --- recommendations (needs Supabase; no mock fallback) --------------------

export async function getLatestRecommendation(domain: string): Promise<Recommendation | null> {
  if (!SUPABASE_READY) return null;
  try {
    const supabase = await client();
    const { data, error } = await supabase
      .from("recommendations")
      .select("*")
      .eq("domain", domain)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as Recommendation) ?? null;
  } catch (err) {
    console.warn("[data] getLatestRecommendation failed:", err);
    return null;
  }
}

/** Newest recommendation per domain — for the dashboard headline row. */
export async function getLatestRecommendationsByDomain(): Promise<Map<string, Recommendation>> {
  const out = new Map<string, Recommendation>();
  if (!SUPABASE_READY) return out;
  try {
    const supabase = await client();
    const { data, error } = await supabase
      .from("recommendations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    for (const row of (data ?? []) as Recommendation[]) {
      if (!out.has(row.domain)) out.set(row.domain, row); // first seen = newest
    }
    return out;
  } catch (err) {
    console.warn("[data] getLatestRecommendationsByDomain failed:", err);
    return out;
  }
}

export async function insertRecommendation(
  row: Omit<Recommendation, "id" | "created_at">,
): Promise<Recommendation> {
  const supabase = await client();
  const { data, error } = await supabase
    .from("recommendations")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data as Recommendation;
}

export async function updateRecommendation(
  id: string,
  patch: Partial<Omit<Recommendation, "id" | "domain" | "created_at">>,
): Promise<void> {
  const supabase = await client();
  const { error } = await supabase.from("recommendations").update(patch).eq("id", id);
  if (error) throw error;
}
