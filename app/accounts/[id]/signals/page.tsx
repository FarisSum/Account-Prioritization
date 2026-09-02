import { notFound } from "next/navigation";
import { AccountHeader } from "@/components/account-header";
import { AccountTabs } from "@/components/account-tabs";
import {
  Chips,
  GrowthText,
  MetricCard,
  MetricGroup,
  SentimentBadge,
} from "@/components/signals";
import { getAccount, getGongSignals, getProductTelemetry } from "@/lib/data";
import { formatCompact, formatCompactCurrency, formatSignedCount } from "@/lib/format";
import type { GongCategory, GongSignal } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORY_ORDER: GongCategory[] = [
  "Expansion",
  "Cross-sell",
  "Renewal",
  "Competitive",
  "Stakeholder",
  "Feedback",
];

function pct(n: number | null): string {
  return n === null || n === undefined ? "—" : `${n}%`;
}

export default async function AccountSignalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const domain = decodeURIComponent(id);

  const account = await getAccount(domain);
  if (!account) notFound();

  const [telemetry, gong] = await Promise.all([
    getProductTelemetry(domain),
    getGongSignals(domain),
  ]);

  const byCategory = new Map<GongCategory, GongSignal[]>();
  for (const g of gong) {
    const list = byCategory.get(g.category) ?? [];
    list.push(g);
    byCategory.set(g.category, list);
  }
  const sentimentCounts = {
    Positive: gong.filter((g) => g.sentiment === "Positive").length,
    Neutral: gong.filter((g) => g.sentiment === "Neutral").length,
    Negative: gong.filter((g) => g.sentiment === "Negative").length,
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <AccountHeader account={account} />
      <AccountTabs domain={account.domain} active="signals" />

      {/* ---------------- Product telemetry ---------------- */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Product telemetry</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Payments-platform usage for this account. Not part of the priority score.
        </p>

        {!telemetry ? (
          <p className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">
            No telemetry on file for this account.
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            <MetricGroup title="Payments">
              <MetricCard
                label="Monthly volume"
                value={
                  telemetry.payment_volume_monthly === null
                    ? "—"
                    : formatCompactCurrency(telemetry.payment_volume_monthly)
                }
                sub={<GrowthText value={telemetry.payment_volume_yoy_growth} />}
              />
              <MetricCard
                label="Monthly transactions"
                value={
                  telemetry.transaction_count_monthly === null
                    ? "—"
                    : formatCompact(telemetry.transaction_count_monthly)
                }
                sub={<GrowthText value={telemetry.transaction_count_yoy_growth} />}
              />
              <MetricCard label="Authorization rate" value={pct(telemetry.authorization_rate)} />
              <MetricCard label="Decline rate" value={pct(telemetry.decline_rate)} />
            </MetricGroup>

            <MetricGroup title="Risk & disputes">
              <MetricCard label="Fraud rate" value={pct(telemetry.fraud_rate)} />
              <MetricCard
                label="Chargebacks / mo"
                value={
                  telemetry.chargebacks_monthly === null
                    ? "—"
                    : telemetry.chargebacks_monthly.toLocaleString("en-US")
                }
              />
              <MetricCard label="Risk rules active" value={telemetry.risk_rules_active ?? "—"} />
              <MetricCard label="Disputes in-platform" value={pct(telemetry.dispute_management_pct)} />
            </MetricGroup>

            <MetricGroup title="API & integration">
              <MetricCard
                label="API calls / mo"
                value={
                  telemetry.api_calls_monthly === null
                    ? "—"
                    : formatCompact(telemetry.api_calls_monthly)
                }
                sub={<GrowthText value={telemetry.api_volume_yoy_growth} />}
              />
              <MetricCard label="API error rate" value={pct(telemetry.api_error_rate)} />
              <MetricCard label="Active API keys" value={telemetry.active_api_keys ?? "—"} />
              <MetricCard
                label="Webhooks / mo"
                value={
                  telemetry.webhooks_monthly === null
                    ? "—"
                    : formatCompact(telemetry.webhooks_monthly)
                }
                sub={`${pct(telemetry.webhook_failure_rate)} failure`}
              />
            </MetricGroup>

            <MetricGroup title="Recurring & vaulting">
              <MetricCard
                label="Recurring payments / mo"
                value={
                  telemetry.recurring_payments_monthly === null
                    ? "—"
                    : formatCompact(telemetry.recurring_payments_monthly)
                }
                sub={<GrowthText value={telemetry.recurring_payment_yoy_growth} />}
              />
              <MetricCard
                label="Tokens stored"
                value={
                  telemetry.tokens_stored === null ? "—" : formatCompact(telemetry.tokens_stored)
                }
              />
              <MetricCard label="Active dashboard users" value={telemetry.active_users ?? "—"} />
              <MetricCard
                label="Report exports / mo"
                value={telemetry.reporting_exports_monthly ?? "—"}
              />
            </MetricGroup>

            <MetricGroup title="Reach">
              <MetricCard
                label="Countries processing"
                value={telemetry.countries_processing ?? "—"}
                sub={
                  telemetry.countries_added_yoy === null
                    ? undefined
                    : `${formatSignedCount(telemetry.countries_added_yoy)} YoY`
                }
              />
              <MetricCard label="Currencies" value={telemetry.currencies_processed ?? "—"} />
              <MetricCard
                label="Products adopted"
                value={telemetry.products_adopted.length || "—"}
                sub={
                  telemetry.products_added_yoy === null
                    ? undefined
                    : `${formatSignedCount(telemetry.products_added_yoy)} YoY`
                }
              />
              <MetricCard label="Payment methods" value={telemetry.payment_methods_used.length || "—"} />
            </MetricGroup>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Payment methods
                </h3>
                <Chips items={telemetry.payment_methods_used} />
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Products
                </h3>
                <Chips items={telemetry.products_adopted} />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ---------------- Gong call signals ---------------- */}
      <section className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Call signals <span className="font-normal text-zinc-400">({gong.length})</span>
          </h2>
          <div className="flex gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="text-emerald-600 dark:text-emerald-400">
              {sentimentCounts.Positive} positive
            </span>
            <span>{sentimentCounts.Neutral} neutral</span>
            <span className="text-red-600 dark:text-red-400">
              {sentimentCounts.Negative} negative
            </span>
          </div>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Snippets surfaced from customer calls (Gong). Not part of the priority score.
        </p>

        {gong.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">
            No call signals on file for this account.
          </p>
        ) : (
          <div className="mt-4 space-y-6">
            {CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => (
              <div key={category}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {category}
                </h3>
                <ul className="space-y-2">
                  {byCategory.get(category)!.map((g) => (
                    <li
                      key={g.transcript_id}
                      className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-center gap-2">
                        <SentimentBadge sentiment={g.sentiment} />
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {g.signal}
                        </span>
                        <span className="ml-auto text-xs text-zinc-400">{g.transcript_id}</span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                        “{g.transcript_text}”
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
