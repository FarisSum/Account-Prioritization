"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { SECTION_SWATCH, SegmentedScoreBar, TierBadge } from "@/components/primitives";
import { daysUntil, formatCompactCurrency, formatPercent, formatRelativeDays } from "@/lib/format";
import type { PriorityTier } from "@/lib/scoring";
import type { Recommendation } from "@/lib/types";
import type { ScoredAccount } from "@/lib/view";

type TierFilter = "All" | PriorityTier;
type SortKey = "priority" | "revenue" | "renewal" | "growth" | "employees" | "tenure";

const TIER_FILTERS: TierFilter[] = ["All", "Critical", "High", "Medium", "Low"];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "priority", label: "Priority score" },
  { key: "revenue", label: "ARR to Adyen" },
  { key: "renewal", label: "Renewal date" },
  { key: "growth", label: "Headcount growth" },
  { key: "employees", label: "Employee count" },
  { key: "tenure", label: "Customer tenure" },
];

function sortValue(entry: ScoredAccount, key: SortKey): number {
  const a = entry.account;
  switch (key) {
    case "priority":
      return entry.scoring.score;
    case "revenue":
      return a.adyen_arr;
    case "renewal": {
      const d = daysUntil(a.contract_renewal_date);
      return d === null ? Number.POSITIVE_INFINITY : d;
    }
    case "growth":
      return a.employee_growth;
    case "employees":
      return a.employee_count;
    case "tenure":
      return a.num_years_as_customer;
  }
}

// Direction that puts the most attention-worthy account first.
const ASCENDING: Record<SortKey, boolean> = {
  priority: false,
  revenue: false,
  renewal: true,
  growth: true,
  employees: false,
  tenure: false,
};

function domainLabel(domain: string): string {
  return domain.replace(/^https?:\/\//, "");
}

const NEW_CUSTOMER_YEARS = 2;

export function Dashboard({
  entries,
  owners,
  recommendations,
  renewalRisk,
}: {
  entries: ScoredAccount[];
  owners: string[];
  recommendations: Record<string, Pick<Recommendation, "status" | "headline">>;
  renewalRisk: Record<string, boolean>;
}) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<TierFilter>("All");
  const [owner, setOwner] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("priority");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = entries.filter((e) => {
      const a = e.account;
      if (tier !== "All" && e.scoring.tier !== tier) return false;
      if (owner !== "all" && a.account_owner !== owner) return false;
      if (
        q &&
        !a.company_name.toLowerCase().includes(q) &&
        !(a.industry ?? "").toLowerCase().includes(q) &&
        !a.domain.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    const asc = ASCENDING[sort];
    return [...filtered].sort((x, y) => {
      const diff = sortValue(x, sort) - sortValue(y, sort);
      return asc ? diff : -diff;
    });
  }, [entries, query, tier, owner, sort]);

  return (
    <div className="space-y-4">
      <SummaryCards entries={entries} />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Search
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Company, industry or domain"
            className="w-60 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Account owner
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">All owners</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-1.5">
          {TIER_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                tier === t
                  ? "bg-brand text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          Showing {rows.length} of {entries.length} accounts
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${SECTION_SWATCH.telemetry}`} /> Usage
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${SECTION_SWATCH.crm}`} /> CRM
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${SECTION_SWATCH.gong}`} /> Gong
          </span>
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[1080px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <th className="px-3 py-2.5 font-medium">#</th>
              <th className="px-3 py-2.5 font-medium">Account</th>
              <th className="px-3 py-2.5 font-medium">Owner</th>
              <th className="px-3 py-2.5 font-medium">Industry</th>
              <th className="px-3 py-2.5 font-medium">ARR to Adyen</th>
              <th className="px-3 py-2.5 font-medium">Tenure</th>
              <th className="px-3 py-2.5 font-medium">Renewal</th>
              <th className="px-3 py-2.5 font-medium">Emp Growth</th>
              <th className="px-3 py-2.5 font-medium">Employees</th>
              <th className="px-3 py-2.5 font-medium">Priority</th>
              <th className="px-3 py-2.5 font-medium">Tier</th>
              <th className="px-3 py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => {
              const a = e.account;
              const sec = Object.fromEntries(
                e.scoring.sections.map((s) => [s.key, s.points]),
              ) as Record<"telemetry" | "crm" | "gong", number>;
              const rec = recommendations[a.domain];
              const naHref = `/accounts/${encodeURIComponent(a.domain)}/next-action`;
              const naText =
                rec?.status === "completed" && rec.headline
                  ? rec.headline
                  : rec?.status === "pending"
                    ? "Generating next action…"
                    : rec?.status === "failed"
                      ? "Next action — last run failed"
                      : null;
              return (
                <Fragment key={a.domain}>
                <tr
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${
                    naText ? "" : "border-b border-zinc-100 dark:border-zinc-800/60"
                  } last:border-0`}
                >
                  <td className="px-3 py-2.5 tabular-nums text-zinc-400">{e.priorityRank}</td>
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/accounts/${encodeURIComponent(a.domain)}`}
                      className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                    >
                      {a.company_name}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-zinc-400">{domainLabel(a.domain)}</span>
                      {a.num_years_as_customer < NEW_CUSTOMER_YEARS && (
                        <span
                          title={`Adyen customer for ${a.num_years_as_customer.toFixed(1)} years`}
                          className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                        >
                          New customer
                        </span>
                      )}
                      {renewalRisk[a.domain] && (
                        <span
                          title="A recent call flagged a renewal or pricing concern"
                          className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
                        >
                          Renewal risk
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">{a.account_owner}</td>
                  <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">{a.industry ?? "—"}</td>
                  <td className="px-3 py-2.5 tabular-nums text-zinc-600 dark:text-zinc-300">
                    {formatCompactCurrency(a.adyen_arr)}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-zinc-600 dark:text-zinc-300">
                    {a.num_years_as_customer.toFixed(1)} yrs
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-zinc-600 dark:text-zinc-300">
                    {formatRelativeDays(daysUntil(a.contract_renewal_date))}
                  </td>
                  <td
                    className={`px-3 py-2.5 tabular-nums ${
                      a.employee_growth < 0
                        ? "text-red-600 dark:text-red-400"
                        : a.employee_growth > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-500"
                    }`}
                  >
                    {formatPercent(a.employee_growth)}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-zinc-600 dark:text-zinc-300">
                    {a.employee_count.toLocaleString("en-US")}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <SegmentedScoreBar
                        telemetry={sec.telemetry}
                        crm={sec.crm}
                        gong={sec.gong}
                        className="w-24"
                      />
                      <span className="tabular-nums text-xs font-medium text-zinc-700 dark:text-zinc-200">
                        {e.scoring.score.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <TierBadge tier={e.scoring.tier} />
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <Link
                      href={`/accounts/${encodeURIComponent(a.domain)}`}
                      className="block text-xs font-medium text-brand underline-offset-2 hover:underline"
                    >
                      Score breakdown →
                    </Link>
                    <Link
                      href={`/accounts/${encodeURIComponent(a.domain)}/signals`}
                      className="mt-1 block text-xs font-medium text-brand underline-offset-2 hover:underline"
                    >
                      Signals →
                    </Link>
                    <Link
                      href={naHref}
                      className="mt-1 block text-xs font-medium text-brand underline-offset-2 hover:underline"
                    >
                      Next action →
                    </Link>
                  </td>
                </tr>
                {naText && (
                  <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                    <td />
                    <td colSpan={11} className="px-3 pb-2.5 pt-0">
                      <Link
                        href={naHref}
                        className="group inline-flex items-baseline gap-1.5 text-xs text-zinc-600 hover:text-brand dark:text-zinc-400"
                      >
                        <span className="font-semibold uppercase tracking-wide text-brand">
                          Next action
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-600">·</span>
                        <span
                          className={
                            rec?.status === "completed"
                              ? "text-zinc-700 group-hover:text-brand dark:text-zinc-200"
                              : "italic text-zinc-400"
                          }
                        >
                          {naText}
                        </span>
                      </Link>
                    </td>
                  </tr>
                )}
                </Fragment>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={12} className="px-3 py-10 text-center text-sm text-zinc-400">
                  No accounts match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCards({ entries }: { entries: ScoredAccount[] }) {
  const totalAdyenArr = entries.reduce((s, e) => s + e.account.adyen_arr, 0);
  const critical = entries.filter((e) => e.scoring.tier === "Critical").length;
  const high = entries.filter((e) => e.scoring.tier === "High").length;
  const attentionAdyenArr = entries
    .filter((e) => e.scoring.tier === "Critical" || e.scoring.tier === "High")
    .reduce((s, e) => s + e.account.adyen_arr, 0);

  const cards: { label: string; value: string; note?: string }[] = [
    { label: "Accounts", value: String(entries.length) },
    { label: "Total ARR to Adyen", value: formatCompactCurrency(totalAdyenArr) },
    { label: "Critical / High", value: `${critical} / ${high}` },
    {
      label: "Adyen ARR needing attention",
      value: formatCompactCurrency(attentionAdyenArr),
      note: "Sum of Adyen ARR for accounts scored Critical or High.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-zinc-200 border-t-2 border-t-brand bg-white p-3 dark:border-zinc-800 dark:border-t-brand dark:bg-zinc-900"
        >
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{c.label}</div>
          <div className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {c.value}
          </div>
          {c.note && (
            <div className="mt-1 text-[11px] leading-tight text-zinc-400 dark:text-zinc-500">
              {c.note}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
