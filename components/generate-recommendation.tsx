"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GenerateRecommendation({
  domain,
  hasExisting,
}: {
  domain: string;
  hasExisting: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(domain)}/recommend`, {
        method: "POST",
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!body.ok) {
        setError(body.error ?? "Generation failed");
      }
      router.refresh(); // re-render the server page with the newest row
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
      >
        {loading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {loading
          ? "Researching…"
          : hasExisting
            ? "Regenerate recommendation"
            : "Generate recommendation"}
      </button>
      {loading && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Fetching account data, running Tavily research and synthesising — this can take up to a
          minute.
        </p>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
