import Link from "next/link";
import type { ReactNode } from "react";
import { SegmentedScoreBar, SECTION_SWATCH, TierBadge } from "@/components/primitives";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { getAccount, getGongSignals, getProductTelemetry } from "@/lib/data";
import {
  GONG_CATEGORIES,
  RECENT_MONTHS,
  RULES,
  SECTION_MAX,
  TIER_THRESHOLDS,
  scoreAccount,
  type PriorityTier,
} from "@/lib/scoring";

export const dynamic = "force-dynamic";

const EXAMPLE_DOMAIN = "https://rhythmtx.com";

const t = RULES.telemetry;
const c = RULES.crm;

const TELEMETRY_RULES = [
  { rule: "Payment volume YoY growth", threshold: `> ${t.paymentVolumeGrowthPct}%`, points: t.pointsEach },
  { rule: "Transaction count YoY growth", threshold: `> ${t.transactionGrowthPct}%`, points: t.pointsEach },
  { rule: "Countries added YoY", threshold: `> ${t.countriesAddedYoy}`, points: t.pointsEach },
  { rule: "Products added YoY", threshold: `> ${t.productsAddedYoy}`, points: t.pointsEach },
];

const CRM_RULES = [
  { rule: "Contract renewal approaching", threshold: `< ${c.renewalWithinDays} days out`, points: c.pointsEach },
  { rule: "Employee growth", threshold: `> ${c.employeeGrowthPct}%`, points: c.pointsEach },
  { rule: "Adyen ARR from the account", threshold: `> $${(c.adyenArr / 1_000_000).toLocaleString("en-US")}M`, points: c.arrPoints },
];

export default async function ScoringPage() {
  const account = await getAccount(EXAMPLE_DOMAIN);
  const [telemetry, signals] = account
    ? await Promise.all([getProductTelemetry(EXAMPLE_DOMAIN), getGongSignals(EXAMPLE_DOMAIN)])
    : [null, []];
  const example = account ? scoreAccount({ account, telemetry, signals }) : null;
  const exSec = example
    ? (Object.fromEntries(example.sections.map((s) => [s.key, s.points])) as Record<
        "telemetry" | "crm" | "gong",
        number
      >)
    : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <Link
        href="/"
        className="text-sm text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
      >
        ← All accounts
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        How the priority score works
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        The score is an <strong>expansion-readiness</strong> signal from 0 to 100. It is purely
        additive — each rule below either fires for a fixed number of points or it doesn&rsquo;t.
        Nothing is normalised or weighted after the fact, so the number is easy to trace back to the
        underlying data.
      </p>

      {/* section weights */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {(
          [
            ["Product usage", SECTION_MAX.telemetry, SECTION_SWATCH.telemetry],
            ["CRM", SECTION_MAX.crm, SECTION_SWATCH.crm],
            ["Gong call signals", SECTION_MAX.gong, SECTION_SWATCH.gong],
          ] as const
        ).map(([label, max, swatch]) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className={`h-2 w-2 rounded-full ${swatch}`} />
              {label}
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {max} pts
            </div>
          </div>
        ))}
      </div>

      {/* Product usage */}
      <Section title={`Product usage — ${SECTION_MAX.telemetry} points`}>
        <p>
          Four year-over-year growth checks from the <code>product_telemetry</code> table,{" "}
          {t.pointsEach} points each. These reward accounts that are actively scaling on the payments
          platform.
        </p>
        <RuleTable rows={TELEMETRY_RULES} />
      </Section>

      {/* CRM */}
      <Section title={`CRM — ${SECTION_MAX.crm} points`}>
        <p>
          Three checks from the <code>crm</code> record: renewal timing and employee growth are{" "}
          {c.pointsEach} points each; Adyen ARR is {c.arrPoints}.
        </p>
        <RuleTable rows={CRM_RULES} />
      </Section>

      {/* Gong */}
      <Section title={`Gong call signals — ${SECTION_MAX.gong} points`}>
        <p>
          For each of the six signal categories, if there is at least one{" "}
          <strong>positive</strong> signal whose <code>last_detected_date</code> is within the last{" "}
          {RECENT_MONTHS} months, that category adds {RULES.gong.pointsPerCategory} points. It is
          capped at one hit per category, so the most this section can contribute is{" "}
          {GONG_CATEGORIES.length} × {RULES.gong.pointsPerCategory} = {SECTION_MAX.gong}. Negative and
          neutral signals, and anything older than {RECENT_MONTHS} months, are ignored.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {GONG_CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {cat} · +{RULES.gong.pointsPerCategory}
            </span>
          ))}
        </div>
      </Section>

      {/* Tiers */}
      <Section title="Tiers">
        <p>The total maps to a tier:</p>
        <ul className="mt-2 space-y-1">
          {TIER_THRESHOLDS.map(([tier, min], i) => {
            const upper = i === 0 ? 100 : TIER_THRESHOLDS[i - 1][1] - 0.5;
            return (
              <li key={tier} className="flex items-center gap-2 text-sm">
                <TierBadge tier={tier as PriorityTier} />
                <span className="tabular-nums text-zinc-600 dark:text-zinc-300">
                  {min} – {upper}
                </span>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Worked example */}
      {example && account && exSec && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Worked example — {account.company_name}
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Running {account.company_name}&rsquo;s live data through the rules above:
          </p>
          <div className="mt-3 flex items-center gap-3">
            <SegmentedScoreBar
              telemetry={exSec.telemetry}
              crm={exSec.crm}
              gong={exSec.gong}
              className="max-w-md"
            />
            <span className="tabular-nums text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {example.score.toFixed(1)}
            </span>
          </div>
          <div className="mt-4">
            <ScoreBreakdown score={example} />
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {exSec.telemetry} + {exSec.crm} + {exSec.gong} = {example.score.toFixed(1)} →{" "}
            {example.tier}.{" "}
            <Link
              href={`/accounts/${encodeURIComponent(account.domain)}`}
              className="text-brand underline-offset-2 hover:underline"
            >
              Open this account
            </Link>
          </p>
        </section>
      )}
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <div className="mt-2 space-y-2 text-sm text-zinc-600 dark:text-zinc-300 [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs dark:[&_code]:bg-zinc-800">
        {children}
      </div>
    </section>
  );
}

function RuleTable({ rows }: { rows: { rule: string; threshold: string; points: number }[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <th className="px-3 py-2 font-medium">Rule</th>
            <th className="px-3 py-2 font-medium">Fires when</th>
            <th className="px-3 py-2 font-medium text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.rule} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
              <td className="px-3 py-2 font-medium text-zinc-800 dark:text-zinc-200">{r.rule}</td>
              <td className="px-3 py-2 tabular-nums text-zinc-600 dark:text-zinc-300">{r.threshold}</td>
              <td className="px-3 py-2 text-right tabular-nums text-zinc-800 dark:text-zinc-200">
                {r.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
