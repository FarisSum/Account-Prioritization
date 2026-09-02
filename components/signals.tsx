import type { ReactNode } from "react";
import type { GongSentiment } from "@/lib/types";

export function GrowthText({ value, className = "" }: { value: number | null; className?: string }) {
  if (value === null || value === undefined) return <span className="text-zinc-400">—</span>;
  const tone =
    value < 0
      ? "text-red-600 dark:text-red-400"
      : value > 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-zinc-500";
  return (
    <span className={`tabular-nums ${tone} ${className}`}>
      {value > 0 ? "+" : ""}
      {value}%
    </span>
  );
}

export function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-1 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
      {sub != null && <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{sub}</div>}
    </div>
  );
}

export function MetricGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>
    </div>
  );
}

export function Chips({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-zinc-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <span
          key={it}
          className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          {it}
        </span>
      ))}
    </div>
  );
}

const SENTIMENT_STYLES: Record<GongSentiment, string> = {
  Positive:
    "bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-400/20",
  Neutral:
    "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-400/20",
  Negative:
    "bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-300 dark:ring-red-400/20",
};

export function SentimentBadge({ sentiment }: { sentiment: GongSentiment }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${SENTIMENT_STYLES[sentiment]}`}
    >
      {sentiment}
    </span>
  );
}
