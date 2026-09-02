// Transparent, tunable account-priority scoring.
//
// public.crm stores only raw signals. Priority is derived here so the weighting
// stays visible and adjustable. Each signal is normalised to a 0-100 "attention"
// contribution, combined with a weight, and the weighted average becomes the
// 0-100 priority score. Every step is reported back in `AccountScore.factors`
// so the UI can show its work.

import { daysUntil, formatCompactCurrency, formatPercent, formatRelativeDays } from "./format";
import type { CrmAccount } from "./types";

export type PriorityTier = "Critical" | "High" | "Medium" | "Low";

export interface ScoringWeights {
  annualRevenue: number;
  renewalUrgency: number;
  employeeGrowth: number;
  employeeCount: number;
}

// Weights are relative; they are normalised to sum to 1 before scoring.
export const DEFAULT_WEIGHTS: ScoringWeights = {
  annualRevenue: 0.35,
  renewalUrgency: 0.3,
  employeeGrowth: 0.2,
  employeeCount: 0.15,
};

export const FACTOR_LABELS: Record<keyof ScoringWeights, string> = {
  annualRevenue: "Revenue at stake",
  renewalUrgency: "Renewal urgency",
  employeeGrowth: "Headcount momentum",
  employeeCount: "Account size",
};

// Fixed order so the breakdown reads consistently everywhere.
export const FACTOR_ORDER: (keyof ScoringWeights)[] = [
  "annualRevenue",
  "renewalUrgency",
  "employeeGrowth",
  "employeeCount",
];

// Tuning constants for the per-signal normalisation curves.
const REVENUE_FLOOR = 1_000_000; // ARR at/below this scores 0 on revenue
const REVENUE_CEIL = 500_000_000; // ARR at/above this maxes out revenue
const RENEWAL_NEAR_DAYS = 30; // <= this many days to renewal -> full urgency
const RENEWAL_FAR_DAYS = 270; // >= this many days to renewal -> no urgency
const RENEWAL_UNKNOWN = 30; // contribution when no renewal date is set
const GROWTH_DECLINE_CAP = 15; // a 15% headcount drop -> full attention (churn risk)
const GROWTH_EXPANSION_CAP = 40; // 40%+ headcount growth -> full attention (expansion)
const SIZE_FLOOR = 50; // employees at/below this score 0 on size
const SIZE_CEIL = 5_000; // employees at/above this max out size

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

/** Position of `value` on a log scale between `floor` and `ceil`, as 0-100. */
function logScale(value: number, floor: number, ceil: number): number {
  if (value <= floor) return 0;
  if (value >= ceil) return 100;
  return ((Math.log10(value) - Math.log10(floor)) / (Math.log10(ceil) - Math.log10(floor))) * 100;
}

export interface FactorBreakdown {
  key: keyof ScoringWeights;
  label: string;
  weight: number; // normalised, 0-1
  contribution: number; // this signal's 0-100 attention value
  weightedPoints: number; // contribution * weight — the points added to the score
  raw: string; // the underlying signal, human readable
}

export interface AccountScore {
  score: number; // 0-100, one decimal place
  tier: PriorityTier;
  factors: FactorBreakdown[];
}

export function tierForScore(score: number): PriorityTier {
  if (score >= 70) return "Critical";
  if (score >= 50) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

function factorInputs(account: CrmAccount, asOf: Date) {
  const renewalDays = daysUntil(account.contract_renewal_date, asOf);
  const growth = account.employee_growth;

  // Headcount momentum is U-shaped: a shrinking customer is a churn risk and a
  // fast-growing one is an expansion opportunity — both deserve an AM's time.
  const growthContribution =
    growth < 0
      ? clamp((-growth / GROWTH_DECLINE_CAP) * 100)
      : clamp((growth / GROWTH_EXPANSION_CAP) * 100);

  return {
    annualRevenue: {
      contribution: logScale(account.annual_revenue, REVENUE_FLOOR, REVENUE_CEIL),
      raw: `${formatCompactCurrency(account.annual_revenue)} ARR`,
    },
    renewalUrgency: {
      contribution:
        renewalDays === null
          ? RENEWAL_UNKNOWN
          : clamp(
              ((RENEWAL_FAR_DAYS - renewalDays) / (RENEWAL_FAR_DAYS - RENEWAL_NEAR_DAYS)) * 100,
            ),
      raw: account.contract_renewal_date
        ? `renews ${formatRelativeDays(renewalDays)}`
        : "no renewal date",
    },
    employeeGrowth: {
      contribution: growthContribution,
      raw: `${formatPercent(growth)} headcount${growth < 0 ? " (churn risk)" : growth > 0 ? " (expansion)" : ""}`,
    },
    employeeCount: {
      contribution: logScale(account.employee_count, SIZE_FLOOR, SIZE_CEIL),
      raw: `${account.employee_count.toLocaleString("en-US")} employees`,
    },
  } satisfies Record<keyof ScoringWeights, { contribution: number; raw: string }>;
}

export function scoreAccount(
  account: CrmAccount,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  asOf: Date = new Date(),
): AccountScore {
  const inputs = factorInputs(account, asOf);
  const totalWeight = FACTOR_ORDER.reduce((sum, key) => sum + Math.max(0, weights[key]), 0) || 1;

  const factors: FactorBreakdown[] = FACTOR_ORDER.map((key) => {
    const weight = Math.max(0, weights[key]) / totalWeight;
    const contribution = inputs[key].contribution;
    return {
      key,
      label: FACTOR_LABELS[key],
      weight,
      contribution,
      weightedPoints: contribution * weight,
      raw: inputs[key].raw,
    };
  });

  const score = Math.round(factors.reduce((sum, f) => sum + f.weightedPoints, 0) * 10) / 10;
  return { score, tier: tierForScore(score), factors };
}
