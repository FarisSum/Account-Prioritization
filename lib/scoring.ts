// Account-priority scoring — additive points model, 0 to 100.
//
// The score is an expansion-readiness signal: it rewards accounts that are
// growing on the payments platform, look healthy in the CRM, and are sending
// positive buying signals on calls. Nothing is normalised — each rule either
// fires for a fixed number of points or it doesn't, so the math is easy to
// explain (see /scoring) and easy to retune here.
//
//   Product usage      40 pts  (4 rules x 10)
//   CRM                15 pts  (3 rules x 5)
//   Gong call signals  45 pts  (6 categories x 7.5)
//
// Total 100. Tiers: Critical >= 65, High >= 40, Medium >= 20, else Low.

import { daysUntil } from "./format";
import type { CrmAccount, GongCategory, GongSignal, ProductTelemetry } from "./types";

export type PriorityTier = "Critical" | "High" | "Medium" | "Low";

export const RECENT_MONTHS = 6; // "detected in the last 6 months"

export const GONG_CATEGORIES: GongCategory[] = [
  "Expansion",
  "Cross-sell",
  "Renewal",
  "Competitive",
  "Stakeholder",
  "Feedback",
];

// ---- rule thresholds (the knobs) -------------------------------------------
export const RULES = {
  telemetry: {
    paymentVolumeGrowthPct: 30, // > 30% YoY
    transactionGrowthPct: 30, // > 30% YoY
    countriesAddedYoy: 2, // > 2
    productsAddedYoy: 1, // > 1
    pointsEach: 10,
  },
  crm: {
    renewalWithinDays: 180, // < 180 days out (or overdue)
    employeeGrowthPct: 15, // > 15%
    annualRevenue: 25_000_000, // > $25M
    pointsEach: 5,
  },
  gong: {
    pointsPerCategory: 7.5, // one hit per category, capped
  },
} as const;

export const SECTION_MAX = { telemetry: 40, crm: 15, gong: 45 } as const;

export const TIER_THRESHOLDS: [PriorityTier, number][] = [
  ["Critical", 65],
  ["High", 40],
  ["Medium", 20],
  ["Low", 0],
];

export function tierForScore(score: number): PriorityTier {
  for (const [tier, min] of TIER_THRESHOLDS) if (score >= min) return tier;
  return "Low";
}

// ---- breakdown shapes -----------------------------------------------------
export interface ScoreLine {
  label: string;
  detail: string; // the account's actual value / why it did or didn't fire
  points: number;
  max: number;
  met: boolean;
}

export interface ScoreSection {
  key: "telemetry" | "crm" | "gong";
  label: string;
  points: number;
  max: number;
  lines: ScoreLine[];
}

export interface AccountScore {
  score: number; // 0-100, .5 precision
  tier: PriorityTier;
  sections: ScoreSection[];
}

export interface ScoreInput {
  account: CrmAccount;
  telemetry: ProductTelemetry | null;
  signals: GongSignal[];
  asOf?: Date;
}

// ---- helpers ------------------------------------------------------------------
function recentCutoff(asOf: Date): Date {
  const d = new Date(asOf);
  d.setMonth(d.getMonth() - RECENT_MONTHS);
  return d;
}

function isOnOrAfter(dateISO: string | null, cutoff: Date): boolean {
  if (!dateISO) return false;
  return new Date(`${dateISO}T00:00:00Z`).getTime() >= cutoff.getTime();
}

const gp = (met: boolean, pts: number) => (met ? pts : 0);

// ---- telemetry section (40) -------------------------------------------------
function telemetrySection(t: ProductTelemetry | null): ScoreSection {
  const P = RULES.telemetry.pointsEach;
  const lines: ScoreLine[] = [];

  const pv = t?.payment_volume_yoy_growth ?? null;
  lines.push({
    label: "Payment volume YoY growth",
    detail: pv === null ? "no telemetry" : `${pv > 0 ? "+" : ""}${pv}% (need > ${RULES.telemetry.paymentVolumeGrowthPct}%)`,
    max: P,
    met: pv !== null && pv > RULES.telemetry.paymentVolumeGrowthPct,
    points: gp(pv !== null && pv > RULES.telemetry.paymentVolumeGrowthPct, P),
  });

  const tx = t?.transaction_count_yoy_growth ?? null;
  lines.push({
    label: "Transaction count YoY growth",
    detail: tx === null ? "no telemetry" : `${tx > 0 ? "+" : ""}${tx}% (need > ${RULES.telemetry.transactionGrowthPct}%)`,
    max: P,
    met: tx !== null && tx > RULES.telemetry.transactionGrowthPct,
    points: gp(tx !== null && tx > RULES.telemetry.transactionGrowthPct, P),
  });

  const ca = t?.countries_added_yoy ?? null;
  lines.push({
    label: "Countries added YoY",
    detail: ca === null ? "no telemetry" : `${ca} (need > ${RULES.telemetry.countriesAddedYoy})`,
    max: P,
    met: ca !== null && ca > RULES.telemetry.countriesAddedYoy,
    points: gp(ca !== null && ca > RULES.telemetry.countriesAddedYoy, P),
  });

  const pa = t?.products_added_yoy ?? null;
  lines.push({
    label: "Products added YoY",
    detail: pa === null ? "no telemetry" : `${pa} (need > ${RULES.telemetry.productsAddedYoy})`,
    max: P,
    met: pa !== null && pa > RULES.telemetry.productsAddedYoy,
    points: gp(pa !== null && pa > RULES.telemetry.productsAddedYoy, P),
  });

  return {
    key: "telemetry",
    label: "Product usage",
    max: SECTION_MAX.telemetry,
    points: lines.reduce((s, l) => s + l.points, 0),
    lines,
  };
}

// ---- CRM section (15) -----------------------------------------------------
function crmSection(a: CrmAccount, asOf: Date): ScoreSection {
  const P = RULES.crm.pointsEach;
  const days = daysUntil(a.contract_renewal_date, asOf);
  const renewalMet = days !== null && days < RULES.crm.renewalWithinDays;
  const growthMet = a.employee_growth > RULES.crm.employeeGrowthPct;
  const revenueMet = a.annual_revenue > RULES.crm.annualRevenue;

  const lines: ScoreLine[] = [
    {
      label: "Renewal approaching",
      detail:
        days === null
          ? "no renewal date"
          : `${days < 0 ? "overdue" : `${days}d out`} (need < ${RULES.crm.renewalWithinDays}d)`,
      max: P,
      met: renewalMet,
      points: gp(renewalMet, P),
    },
    {
      label: "Employee growth",
      detail: `${a.employee_growth > 0 ? "+" : ""}${a.employee_growth}% (need > ${RULES.crm.employeeGrowthPct}%)`,
      max: P,
      met: growthMet,
      points: gp(growthMet, P),
    },
    {
      label: "Annual revenue",
      detail: `$${(a.annual_revenue / 1_000_000).toLocaleString("en-US")}M (need > $${(RULES.crm.annualRevenue / 1_000_000).toLocaleString("en-US")}M)`,
      max: P,
      met: revenueMet,
      points: gp(revenueMet, P),
    },
  ];

  return {
    key: "crm",
    label: "CRM",
    max: SECTION_MAX.crm,
    points: lines.reduce((s, l) => s + l.points, 0),
    lines,
  };
}

// ---- Gong section (45) --------------------------------------------------------
export function recentPositivesByCategory(
  signals: GongSignal[],
  asOf: Date,
): Map<GongCategory, GongSignal[]> {
  const cutoff = recentCutoff(asOf);
  const map = new Map<GongCategory, GongSignal[]>();
  for (const s of signals) {
    if (s.sentiment !== "Positive") continue;
    if (!isOnOrAfter(s.last_detected_date, cutoff)) continue;
    const list = map.get(s.category) ?? [];
    list.push(s);
    map.set(s.category, list);
  }
  return map;
}

function gongSection(signals: GongSignal[], asOf: Date): ScoreSection {
  const P = RULES.gong.pointsPerCategory;
  const hits = recentPositivesByCategory(signals, asOf);

  const lines: ScoreLine[] = GONG_CATEGORIES.map((category) => {
    const found = hits.get(category) ?? [];
    return {
      label: category,
      detail:
        found.length === 0
          ? "no recent positive signal"
          : `${found.length} recent positive signal${found.length > 1 ? "s" : ""}`,
      max: P,
      met: found.length > 0,
      points: gp(found.length > 0, P),
    };
  });

  return {
    key: "gong",
    label: "Gong call signals",
    max: SECTION_MAX.gong,
    points: lines.reduce((s, l) => s + l.points, 0),
    lines,
  };
}

// ---- entry point -----------------------------------------------------------
export function scoreAccount(input: ScoreInput): AccountScore {
  const asOf = input.asOf ?? new Date();
  const sections = [
    telemetrySection(input.telemetry),
    crmSection(input.account, asOf),
    gongSection(input.signals, asOf),
  ];
  const score = Math.round(sections.reduce((s, sec) => s + sec.points, 0) * 10) / 10;
  return { score, tier: tierForScore(score), sections };
}
