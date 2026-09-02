import { notFound } from "next/navigation";
import { AccountHeader } from "@/components/account-header";
import { AccountTabs } from "@/components/account-tabs";
import { MeterBar, TierBadge } from "@/components/primitives";
import { getAccount } from "@/lib/data";
import { daysUntil, formatCurrency, formatDate, formatPercent, formatRelativeDays } from "@/lib/format";
import { scoreAccount } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function AccountScorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const domain = decodeURIComponent(id);
  const account = await getAccount(domain);
  if (!account) notFound();

  const scoring = scoreAccount(account);

  const signals = [
    { label: "Annual revenue", value: formatCurrency(account.annual_revenue) },
    {
      label: "Contract renewal",
      value: `${formatDate(account.contract_renewal_date)} · ${formatRelativeDays(
        daysUntil(account.contract_renewal_date),
      )}`,
    },
    { label: "Headcount growth", value: `${formatPercent(account.employee_growth)} YoY` },
    { label: "Employees", value: account.employee_count.toLocaleString("en-US") },
    { label: "Country", value: account.country ?? "—" },
    { label: "Account owner", value: account.account_owner },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <AccountHeader
        account={account}
        right={
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {scoring.score.toFixed(1)}
              </span>
              <TierBadge tier={scoring.tier} />
            </div>
            <div className="mt-1 text-xs text-zinc-400">priority score / 100</div>
          </div>
        }
      />

      <AccountTabs domain={account.domain} active="score" />

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {signals.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="text-xs text-zinc-500 dark:text-zinc-400">{s.label}</div>
            <div className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          How this score is built
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Each signal is normalised to a 0–100 attention value, then multiplied by its weight. The
          weighted points sum to the priority score.
        </p>

        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                <th className="px-3 py-2.5 font-medium">Factor</th>
                <th className="px-3 py-2.5 font-medium">Signal</th>
                <th className="px-3 py-2.5 font-medium">Weight</th>
                <th className="px-3 py-2.5 font-medium">Attention</th>
                <th className="px-3 py-2.5 font-medium text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {scoring.factors.map((f) => (
                <tr
                  key={f.key}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                >
                  <td className="px-3 py-2.5 font-medium text-zinc-800 dark:text-zinc-200">
                    {f.label}
                  </td>
                  <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-300">{f.raw}</td>
                  <td className="px-3 py-2.5 tabular-nums text-zinc-500">
                    {Math.round(f.weight * 100)}%
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <MeterBar value={f.contribution} tone="score" className="w-24" />
                      <span className="tabular-nums text-xs text-zinc-500">
                        {Math.round(f.contribution)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                    {f.weightedPoints.toFixed(1)}
                  </td>
                </tr>
              ))}
              <tr className="bg-zinc-50 dark:bg-zinc-900">
                <td
                  colSpan={4}
                  className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500"
                >
                  Priority score
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                  {scoring.score.toFixed(1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
