// Orchestrates the "recommended next action": gather internal signals →
// Tavily research → Claude synthesis → persist. Server-only.

import { synthesizeRecommendation, SYNTHESIS_MODEL } from "./anthropic";
import { getAccount, getGongSignals, getProductTelemetry, insertRecommendation } from "./data";
import { formatCompactCurrency, formatDate } from "./format";
import { recentPositivesByCategory, scoreAccount } from "./scoring";
import { researchCompany } from "./tavily";
import type { CrmAccount, GongSignal, ProductTelemetry, Recommendation } from "./types";

const MAX_RESEARCH_CHARS = 6_000;

function internalBrief(
  account: CrmAccount,
  telemetry: ProductTelemetry | null,
  signals: GongSignal[],
): { text: string; scoreSnapshot: number; tierSnapshot: string } {
  const scoring = scoreAccount({ account, telemetry, signals });
  const lines: string[] = [];

  lines.push(`# Account`);
  lines.push(`- Company: ${account.company_name} (${account.domain})`);
  lines.push(`- Industry: ${account.industry ?? "—"} · Owner: ${account.account_owner}`);
  lines.push(`- Location: ${account.location ?? "—"}, ${account.country ?? "—"}`);
  lines.push(`- Annual revenue: ${formatCompactCurrency(account.annual_revenue)}`);
  lines.push(`- Employee count: ${account.employee_count} (growth ${account.employee_growth}% YoY)`);
  lines.push(`- Contract renewal: ${formatDate(account.contract_renewal_date)}`);

  lines.push(`\n# Priority score: ${scoring.score}/100 (${scoring.tier})`);
  for (const section of scoring.sections) {
    lines.push(`## ${section.label} — ${section.points}/${section.max}`);
    for (const l of section.lines) {
      lines.push(`- [${l.met ? "x" : " "}] ${l.label}: ${l.detail} (${l.points}/${l.max})`);
    }
  }

  if (telemetry) {
    lines.push(`\n# Product telemetry`);
    lines.push(
      `- Monthly volume ${formatCompactCurrency(telemetry.payment_volume_monthly ?? 0)} ` +
        `(${telemetry.payment_volume_yoy_growth ?? 0}% YoY), ` +
        `transactions ${telemetry.transaction_count_monthly ?? 0} ` +
        `(${telemetry.transaction_count_yoy_growth ?? 0}% YoY)`,
    );
    lines.push(
      `- Auth rate ${telemetry.authorization_rate ?? "—"}%, fraud ${telemetry.fraud_rate ?? "—"}%, ` +
        `API error ${telemetry.api_error_rate ?? "—"}%`,
    );
    lines.push(
      `- Countries ${telemetry.countries_processing ?? "—"} (+${telemetry.countries_added_yoy ?? 0} YoY), ` +
        `products adopted: ${telemetry.products_adopted.join(", ") || "—"} ` +
        `(+${telemetry.products_added_yoy ?? 0} YoY)`,
    );
  } else {
    lines.push(`\n# Product telemetry: none on file`);
  }

  const recent = recentPositivesByCategory(signals, new Date());
  lines.push(`\n# Recent positive call signals (last 6 months)`);
  if (recent.size === 0) {
    lines.push(`- none`);
  } else {
    for (const [category, rows] of recent) {
      for (const r of rows) {
        lines.push(
          `- [${category}] ${r.signal} (${formatDate(r.last_detected_date)}): "${r.transcript_text}"`,
        );
      }
    }
  }
  const negatives = signals.filter((s) => s.sentiment === "Negative");
  if (negatives.length) {
    lines.push(`\n# Negative / risk call signals`);
    for (const r of negatives.slice(0, 6)) {
      lines.push(`- [${r.category}] ${r.signal}: "${r.transcript_text}"`);
    }
  }

  return { text: lines.join("\n"), scoreSnapshot: scoring.score, tierSnapshot: scoring.tier };
}

export async function generateRecommendation(domain: string): Promise<Recommendation> {
  const account = await getAccount(domain);
  if (!account) throw new Error(`No account for ${domain}`);

  const [telemetry, signals] = await Promise.all([
    getProductTelemetry(domain),
    getGongSignals(domain),
  ]);

  const brief = internalBrief(account, telemetry, signals);

  const base: Omit<Recommendation, "id" | "created_at"> = {
    domain,
    status: "failed",
    headline: null,
    action: null,
    rationale: null,
    talking_points: [],
    supporting_context: null,
    confidence: null,
    score_snapshot: brief.scoreSnapshot,
    tier_snapshot: brief.tierSnapshot,
    research_summary: null,
    research_sources: [],
    model: SYNTHESIS_MODEL,
    error: null,
  };

  try {
    const research = await researchCompany({
      companyName: account.company_name,
      domain: account.domain,
    });

    const researchSummary = research.content.slice(0, MAX_RESEARCH_CHARS);
    const sourceList = research.sources
      .slice(0, 12)
      .map((s, i) => `[${i + 1}] ${s.title} — ${s.url}`)
      .join("\n");

    const prompt = [
      "## INTERNAL SIGNALS",
      brief.text,
      "\n## EXTERNAL RESEARCH (Tavily)",
      researchSummary || "(no research returned)",
      sourceList ? `\n### Sources\n${sourceList}` : "",
      "\n## TASK",
      "Recommend the single highest-value next action for the account manager. Return the JSON object only.",
    ].join("\n");

    const draft = await synthesizeRecommendation(prompt);

    return await insertRecommendation({
      ...base,
      status: "completed",
      headline: draft.headline,
      action: draft.action,
      rationale: draft.rationale,
      talking_points: draft.talking_points,
      supporting_context: draft.supporting_context,
      confidence: draft.confidence,
      research_summary: researchSummary,
      research_sources: research.sources.slice(0, 12),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return await insertRecommendation({ ...base, status: "failed", error: message });
  }
}
