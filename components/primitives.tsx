import type { PriorityTier } from "@/lib/scoring";

const TIER_STYLES: Record<PriorityTier, string> = {
  Critical: "bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-300 dark:ring-red-400/20",
  High: "bg-orange-100 text-orange-700 ring-orange-600/20 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-400/20",
  Medium: "bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-400/20",
  Low: "bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-400/20",
};

export function TierBadge({ tier }: { tier: PriorityTier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TIER_STYLES[tier]}`}
    >
      {tier}
    </span>
  );
}

type BarTone = "score" | "health" | "neutral";

const BAR_TONES: Record<BarTone, (v: number) => string> = {
  // Score: higher = more urgent = warmer.
  score: (v) =>
    v >= 70 ? "bg-red-500" : v >= 50 ? "bg-orange-500" : v >= 30 ? "bg-amber-500" : "bg-emerald-500",
  // Health: higher = better = greener.
  health: (v) =>
    v >= 70 ? "bg-emerald-500" : v >= 40 ? "bg-amber-500" : "bg-red-500",
  neutral: () => "bg-zinc-400 dark:bg-zinc-500",
};

export function MeterBar({
  value,
  tone = "neutral",
  className = "",
}: {
  value: number; // 0-100
  tone?: BarTone;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${BAR_TONES[tone](pct)}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
