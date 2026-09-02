import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountHeader } from "@/components/account-header";
import { AccountTabs } from "@/components/account-tabs";
import { SegmentedScoreBar, TierBadge } from "@/components/primitives";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { getAccount, getGongSignals, getProductTelemetry } from "@/lib/data";
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

  const [telemetry, signals] = await Promise.all([
    getProductTelemetry(domain),
    getGongSignals(domain),
  ]);

  const scoring = scoreAccount({ account, telemetry, signals });
  const sec = Object.fromEntries(scoring.sections.map((s) => [s.key, s.points])) as Record<
    "telemetry" | "crm" | "gong",
    number
  >;

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

      <div className="mt-6 flex items-center justify-between gap-3">
        <SegmentedScoreBar
          telemetry={sec.telemetry}
          crm={sec.crm}
          gong={sec.gong}
          className="max-w-md"
        />
        <Link
          href="/scoring"
          className="shrink-0 text-xs font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        >
          How scoring works →
        </Link>
      </div>

      <div className="mt-4">
        <ScoreBreakdown score={scoring} />
      </div>
    </main>
  );
}
