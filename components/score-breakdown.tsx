import type { AccountScore, ScoreSection } from "@/lib/scoring";

export function SectionCard({ section }: { section: ScoreSection }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{section.label}</h3>
        <span className="tabular-nums text-sm font-medium text-zinc-600 dark:text-zinc-300">
          {section.points} / {section.max}
        </span>
      </div>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {section.lines.map((line) => (
          <li key={line.label} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
            <span
              className={
                line.met
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-300 dark:text-zinc-600"
              }
              aria-hidden
            >
              {line.met ? "●" : "○"}
            </span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{line.label}</span>
            <span className="text-zinc-500 dark:text-zinc-400">{line.detail}</span>
            <span
              className={`ml-auto tabular-nums ${
                line.met
                  ? "font-medium text-zinc-800 dark:text-zinc-200"
                  : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {line.points} / {line.max}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScoreBreakdown({ score }: { score: AccountScore }) {
  return (
    <div className="space-y-4">
      {score.sections.map((section) => (
        <SectionCard key={section.key} section={section} />
      ))}
      <div className="flex items-center justify-between rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Priority score</span>
        <span className="tabular-nums text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {score.score.toFixed(1)} / 100 · {score.tier}
        </span>
      </div>
    </div>
  );
}
