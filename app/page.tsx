import Link from "next/link";
import { Dashboard } from "@/components/dashboard";
import {
  getAccounts,
  getAllGongSignals,
  getAllProductTelemetry,
  getLatestRecommendationsByDomain,
} from "@/lib/data";
import { SECTION_MAX } from "@/lib/scoring";
import { groupByDomain, indexByDomain, scoreAll } from "@/lib/view";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [accounts, telemetry, signals, recMap] = await Promise.all([
    getAccounts(),
    getAllProductTelemetry(),
    getAllGongSignals(),
    getLatestRecommendationsByDomain(),
  ]);

  const entries = scoreAll(accounts, indexByDomain(telemetry), groupByDomain(signals));

  const recommendations = Object.fromEntries(
    Array.from(recMap.entries()).map(([domain, r]) => [
      domain,
      { status: r.status, headline: r.headline },
    ]),
  );

  const renewalRisk = Object.fromEntries(
    signals
      .filter((s) => s.category === "Renewal" && s.sentiment === "Negative")
      .map((s) => [s.domain, true]),
  );

  const owners = Array.from(new Set(accounts.map((a) => a.account_owner))).sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Prioritized accounts
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Your customer book ranked by an expansion-readiness score out of 100 — product
            usage {SECTION_MAX.telemetry}, CRM {SECTION_MAX.crm}, Gong call signals{" "}
            {SECTION_MAX.gong}.{" "}
            <Link href="/scoring" className="font-medium text-brand hover:underline">
              How scoring works →
            </Link>
          </p>
        </div>
      </header>

      <Dashboard
        entries={entries}
        owners={owners}
        recommendations={recommendations}
        renewalRisk={renewalRisk}
      />
    </main>
  );
}
