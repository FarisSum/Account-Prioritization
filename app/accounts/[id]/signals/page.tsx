import { notFound } from "next/navigation";
import { AccountHeader } from "@/components/account-header";
import { AccountTabs } from "@/components/account-tabs";
import { SignalsTabs } from "@/components/signals-tabs";
import { getAccount, getGongSignals, getProductTelemetry } from "@/lib/data";
import { RULES, recentPositivesByCategory } from "@/lib/scoring";

export const dynamic = "force-dynamic";

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

  // Which categories / signals drive the Gong portion of the score.
  const scoreHits = recentPositivesByCategory(gong, new Date());
  const scoreHitCategories = Array.from(scoreHits.keys());
  const scoringIds = Array.from(scoreHits.values())
    .flat()
    .map((s) => s.transcript_id);
  const gongPoints = scoreHits.size * RULES.gong.pointsPerCategory;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <AccountHeader account={account} />
      <AccountTabs domain={account.domain} active="signals" />

      <h2 className="mt-6 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Account signals</h2>

      <SignalsTabs
        telemetry={telemetry}
        gong={gong}
        scoreHitCategories={scoreHitCategories}
        scoringIds={scoringIds}
        gongPoints={gongPoints}
      />
    </main>
  );
}
