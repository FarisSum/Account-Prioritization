// Data access seam. Reads from Supabase when it is configured
// (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local),
// otherwise serves lib/mock-data.ts so the UI still works.

import {
  MOCK_ACCOUNTS,
  mockGongSignals,
  mockTelemetry,
} from "./mock-data";
import type { CrmAccount, GongSignal, ProductTelemetry } from "./types";

const SUPABASE_READY =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
