import { Dashboard } from "@/components/dashboard";
import { getAccounts } from "@/lib/data";
import { DEFAULT_WEIGHTS, FACTOR_LABELS, FACTOR_ORDER } from "@/lib/scoring";
import { scoreAll } from "@/lib/view";

export const dynamic = "force-dynamic";

export default async function Page() {
  const accounts = await getAccounts();
  const entries = scoreAll(accounts);

  const owners = Array.from(new Set(accounts.map((a) => a.account_owner))).sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Account Prioritization
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Customer accounts ranked by a weighted blend of revenue, renewal timing and growth
          signals from the CRM. Weighting:{" "}
          {FACTOR_ORDER.map(
            (k) => `${FACTOR_LABELS[k]} ${Math.round(DEFAULT_WEIGHTS[k] * 100)}%`,
          ).join(" · ")}
          .
        </p>
      </header>

      <Dashboard entries={entries} owners={owners} />
    </main>
  );
}
