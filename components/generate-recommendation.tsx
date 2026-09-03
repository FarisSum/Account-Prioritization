"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AgentIcon } from "@/components/primitives";

export function GenerateRecommendation({
  domain,
  hasExisting,
}: {
  domain: string;
  hasExisting: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(domain)}/recommend`, {
        method: "POST",
        keepalive: true, // let the request finish even if the page is closing
      });
      if (!res.ok && res.status !== 202) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `Request failed (${res.status})`);
      }
      // The agent now runs server-side; refresh to show the "running" state.
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-brand/30 bg-brand-soft/40 p-4 dark:bg-brand-soft/20">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand text-white shadow-sm">
          <AgentIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Next Action agent
            </span>
            <span className="rounded-full border border-brand/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand">
              Agent
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
            Reads this account&rsquo;s CRM, product usage and recent Gong calls, runs live web
            research on the company with <strong>Tavily</strong>, then has <strong>Claude</strong>{" "}
            draft the single highest-value next move. Runs in the background — it keeps going if you
            navigate away, and the result appears here in about a minute.
          </p>

          <button
            type="button"
            onClick={run}
            disabled={submitting}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong disabled:opacity-60"
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <AgentIcon className="h-4 w-4" />
            )}
            {hasExisting ? "Re-run agent" : "Run agent"}
          </button>

          {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
