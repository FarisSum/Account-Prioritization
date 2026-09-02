// Minimal server-side client for Tavily's async Research endpoint.
// Docs: https://docs.tavily.com/documentation/api-reference/endpoint/research
// TAVILY_API_KEY must be server-only (never NEXT_PUBLIC_*).

import type { ResearchSource } from "./types";

const BASE = "https://api.tavily.com";
const POLL_INTERVAL_MS = 3_000;
const MAX_WAIT_MS = 110_000;

export interface ResearchResult {
  content: string;
  sources: ResearchSource[];
  responseTime: number | null;
}

export class TavilyError extends Error {}

function apiKey(): string {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new TavilyError("TAVILY_API_KEY is not set");
  return key;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Start a research task and poll until it completes (or times out). */
export async function researchCompany(input: {
  companyName: string;
  domain: string;
  signal?: AbortSignal;
}): Promise<ResearchResult> {
  const key = apiKey();
  const headers = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };

  const query =
    `Research the company at ${input.domain} (${input.companyName}). ` +
    `Focus on the last 12 months: revenue or headcount growth, funding, ` +
    `geographic or product expansion, leadership changes, and their ` +
    `payments / checkout / e-commerce strategy — the angle a payments provider ` +
    `(Adyen) account manager would use to plan an expansion conversation.`;

  const startRes = await fetch(`${BASE}/research`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      input: query,
      model: "mini",
      output_length: "short",
    }),
    signal: input.signal,
  });

  if (!startRes.ok) {
    throw new TavilyError(
      `Tavily research start failed (${startRes.status}): ${await safeText(startRes)}`,
    );
  }

  const { request_id: requestId } = (await startRes.json()) as { request_id?: string };
  if (!requestId) throw new TavilyError("Tavily research did not return a request_id");

  const deadline = Date.now() + MAX_WAIT_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);
    const pollRes = await fetch(`${BASE}/research/${requestId}`, { headers, signal: input.signal });

    if (pollRes.status === 202) continue; // pending / in_progress
    if (!pollRes.ok) {
      throw new TavilyError(
        `Tavily research poll failed (${pollRes.status}): ${await safeText(pollRes)}`,
      );
    }

    const data = (await pollRes.json()) as {
      status?: string;
      content?: unknown;
      sources?: ResearchSource[];
      response_time?: number;
    };

    if (data.status === "failed") {
      throw new TavilyError("Tavily research task failed");
    }
    if (data.status === "completed") {
      return {
        content:
          typeof data.content === "string" ? data.content : JSON.stringify(data.content ?? ""),
        sources: Array.isArray(data.sources) ? data.sources : [],
        responseTime: typeof data.response_time === "number" ? data.response_time : null,
      };
    }
    // any other status → keep polling
  }

  throw new TavilyError("Tavily research timed out");
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return "<no body>";
  }
}
