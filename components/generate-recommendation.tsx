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
      // The work now runs server-side; refresh to show the "generating" state.
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={run}
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
      >
        {submitting && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {hasExisting ? "Regenerate recommendation" : "Generate recommendation"}
      </button>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Research + synthesis runs in the background — it keeps going if you navigate away, and the
        result shows up here when it&rsquo;s done (usually under a minute).
      </p>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
