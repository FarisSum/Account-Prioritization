import Link from "next/link";
import { Dashboard } from "@/components/dashboard";
import { getAccounts, getAllGongSignals, getAllProductTelemetry } from "@/lib/data";
import { SECTION_MAX } from "@/lib/scoring";
import { groupByDomain, indexByDomain, scoreAll } from "@/lib/view";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [accounts, telemetry, signals] = await Promise.all([
    getAccounts(),
    getAllProductTelemetry(),
    getAllGongSignals(),
  ]);

  const entries = scoreAll(accounts, indexByDomain(telemetry), groupByDomain(signals));

  const owners = Array.from(new Set(accounts.map((a) => a.account_owner))).sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Account Prioritization
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Customer accounts ranked by an expansion-readiness score out of 100: product
            telemetry {SECTION_MAX.telemetry}, CRM {SECTION_MAX.crm}, Gong call signals{" "}
            {SECTION_MAX.gong}.
          </p>
        </div>
        <Link
          href="/scoring"
          className="shrink-0 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          How scoring works →
        </Link>
      </header>

      <Dashboard entries={entries} owners={owners} />
    </main>
  );
}
