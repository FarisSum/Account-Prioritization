import { notFound } from "next/navigation";
import { AccountHeader } from "@/components/account-header";
import { AccountTabs } from "@/components/account-tabs";
import { GenerateRecommendation } from "@/components/generate-recommendation";
import { PendingPoller } from "@/components/pending-poller";
import { getAccount, getLatestRecommendation, supabaseConfigured } from "@/lib/data";
import { formatTimestamp } from "@/lib/format";
import type { Confidence, Recommendation } from "@/lib/types";

const STALE_PENDING_MS = 4 * 60 * 1000;

export const dynamic = "force-dynamic";

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  high: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

export default async function NextActionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const domain = decodeURIComponent(id);

  const account = await getAccount(domain);
  if (!account) notFound();

  const rec = await getLatestRecommendation(domain);
  const configured = supabaseConfigured();

  const pending = rec?.status === "pending";
  // Server component render — wall-clock read is intentional.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const stalePending =
    pending && rec?.started_at
      ? now - new Date(rec.started_at).getTime() > STALE_PENDING_MS
      : false;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <AccountHeader account={account} />
      <AccountTabs domain={account.domain} active="next-action" />

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Recommended next action
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Combines this account&rsquo;s CRM record, product telemetry and recent Gong signals with
          fresh Tavily research on <span className="font-mono">{account.domain.replace(/^https?:\/\//, "")}</span>,
          then asks Claude for the single highest-value move.
        </p>

        <div className="mt-4">
          {!configured ? (
            <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">
              Set <span className="font-mono">NEXT_PUBLIC_SUPABASE_*</span>,{" "}
              <span className="font-mono">TAVILY_API_KEY</span> and{" "}
              <span className="font-mono">ANTHROPIC_API_KEY</span> in{" "}
              <span className="font-mono">.env.local</span> to enable this.
            </p>
          ) : pending && !stalePending ? (
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand/40 border-t-brand" />
              Generating… started {formatTimestamp(rec!.started_at)}. You can leave this page.
              <PendingPoller />
            </div>
          ) : (
            <GenerateRecommendation domain={account.domain} hasExisting={!!rec} />
          )}
          {stalePending && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              The previous run has been going for a while — it may have failed silently. Regenerating
              starts a fresh one.
            </p>
          )}
        </div>

        {rec && rec.status !== "pending" && <RecommendationCard rec={rec} />}
        {!rec && configured && (
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            No recommendation generated yet.
          </p>
        )}
      </section>
    </main>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  if (rec.status === "failed") {
    return (
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900 dark:bg-red-950/40">
        <p className="font-medium text-red-700 dark:text-red-300">Last run failed</p>
        <p className="mt-1 text-red-600 dark:text-red-400">{rec.error ?? "Unknown error"}</p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {formatTimestamp(rec.created_at)}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {rec.headline}
          </h3>
          {rec.confidence && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${CONFIDENCE_STYLES[rec.confidence]}`}
            >
              {rec.confidence} confidence
            </span>
          )}
        </div>

        {rec.action && (
          <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">{rec.action}</p>
        )}

        {rec.rationale && (
          <div className="mt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Why now
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{rec.rationale}</p>
          </div>
        )}

        {rec.talking_points.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Talking points
            </div>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
              {rec.talking_points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {rec.supporting_context && (
          <div className="mt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Context
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {rec.supporting_context}
            </p>
          </div>
        )}

        <p className="mt-4 text-xs text-zinc-400">
          Priority {rec.score_snapshot ?? "—"}/100 ({rec.tier_snapshot ?? "—"}) ·{" "}
          {rec.model ?? "—"} · {formatTimestamp(rec.created_at)}
        </p>
      </div>

      {rec.research_sources.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Research sources ({rec.research_sources.length})
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {rec.research_sources.map((s, i) => (
              <li key={i} className="truncate">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  {s.title || s.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rec.research_summary && (
        <details className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Full research summary
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
            {rec.research_summary}
          </p>
        </details>
      )}
    </div>
  );
}
