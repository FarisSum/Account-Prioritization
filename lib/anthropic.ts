// Claude synthesis for the "recommended next action" feature.
// ANTHROPIC_API_KEY is read from the environment by the SDK.

import Anthropic from "@anthropic-ai/sdk";
import type { Confidence } from "./types";

export const SYNTHESIS_MODEL = "claude-opus-5";

export interface RecommendationDraft {
  headline: string;
  action: string;
  rationale: string;
  talking_points: string[];
  supporting_context: string;
  confidence: Confidence;
}

export class SynthesisError extends Error {}

const SYSTEM = `You assist an Adyen account manager who owns existing customer relationships.
Given (a) internal account signals and the current priority-score breakdown, and
(b) external research about the company, recommend the SINGLE highest-value next
action the account manager should take, and the context to walk in with.

Adyen sells payment processing: acquiring, local payment methods, risk/fraud
tooling, payouts, recurring payments, unified reporting. Frame the action around
protecting or expanding that relationship.

Respond with ONLY a JSON object, no prose or code fences, matching exactly:
{
  "headline": string,              // <= 90 chars, the recommendation in one line
  "action": string,                // 1-2 sentences: the concrete next step
  "rationale": string,             // 2-4 sentences: why now, tying internal + external signals
  "talking_points": string[],      // 2-4 short bullets the AM can use on the call
  "supporting_context": string,    // one short paragraph of context
  "confidence": "high" | "medium" | "low"
}`;

function stripFences(s: string): string {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function coerce(raw: unknown): RecommendationDraft {
  const o = (raw ?? {}) as Record<string, unknown>;
  const points = Array.isArray(o.talking_points)
    ? o.talking_points.map(String).filter(Boolean)
    : [];
  const confidence: Confidence =
    o.confidence === "high" || o.confidence === "medium" || o.confidence === "low"
      ? o.confidence
      : "low";
  return {
    headline: typeof o.headline === "string" ? o.headline : "Recommended next action",
    action: typeof o.action === "string" ? o.action : "",
    rationale: typeof o.rationale === "string" ? o.rationale : "",
    talking_points: points,
    supporting_context: typeof o.supporting_context === "string" ? o.supporting_context : "",
    confidence,
  };
}

export async function synthesizeRecommendation(userPrompt: string): Promise<RecommendationDraft> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new SynthesisError("ANTHROPIC_API_KEY is not set");
  }

  // Workspace-scoped / identity-linked keys require the workspace id on every request.
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID?.trim();
  const client = new Anthropic(
    workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {},
  );

  const response = await client.messages.create({
    model: SYNTHESIS_MODEL,
    max_tokens: 2000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    system: SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
  });

  if (response.stop_reason === "refusal") {
    throw new SynthesisError("Claude declined to generate a recommendation");
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  if (!text) throw new SynthesisError("Claude returned an empty response");

  try {
    return coerce(JSON.parse(stripFences(text)));
  } catch {
    // Model didn't return clean JSON — fall back to the raw text as the action.
    return {
      headline: "Recommended next action",
      action: text,
      rationale: "",
      talking_points: [],
      supporting_context: "",
      confidence: "low",
    };
  }
}
