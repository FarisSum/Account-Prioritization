import type { PriorityTier } from "@/lib/scoring";

// "AI sparkle" glyph — the mark for the Next Action agent.
export function AgentIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1.5c.4 4.4 3.1 7.1 7.5 7.5-4.4.4-7.1 3.1-7.5 7.5-.4-4.4-3.1-7.1-7.5-7.5C8.9 8.6 11.6 5.9 12 1.5z" />
      <path
        d="M18.5 13.5c.18 2 1.32 3.14 3.3 3.3-1.98.16-3.12 1.3-3.3 3.3-.18-2-1.32-3.14-3.3-3.3 1.98-.16 3.12-1.3 3.3-3.3z"
        opacity="0.65"
      />
    </svg>
  );
}

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

// Stacked bar showing the three score sections as a fraction of 100.
const SECTION_COLORS = {
  telemetry: "bg-violet-500",
  crm: "bg-sky-500",
  gong: "bg-amber-500",
} as const;

export const SECTION_SWATCH = SECTION_COLORS;

export function SegmentedScoreBar({
  telemetry,
  crm,
  gong,
  className = "",
  height = "h-2",
}: {
  telemetry: number;
  crm: number;
  gong: number;
  className?: string;
  height?: string;
}) {
  const seg = [
    { key: "telemetry" as const, v: telemetry },
    { key: "crm" as const, v: crm },
    { key: "gong" as const, v: gong },
  ];
  return (
    <div
      className={`flex ${height} w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 ${className}`}
      role="img"
      aria-label={`Score ${Math.round(telemetry + crm + gong)} of 100`}
    >
      {seg.map((s, i) => (
        <div
          key={s.key}
          className={`${SECTION_COLORS[s.key]} ${i > 0 ? "border-l border-white dark:border-zinc-900" : ""}`}
          style={{ width: `${Math.max(0, Math.min(100, s.v))}%` }}
        />
      ))}
    </div>
  );
}

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
