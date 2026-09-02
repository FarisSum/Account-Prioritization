// Joins each crm row to its telemetry + call signals, computes the score, and
// assigns a priority rank for the dashboard.

import { scoreAccount, type AccountScore } from "./scoring";
import type { CrmAccount, GongSignal, ProductTelemetry } from "./types";

export interface ScoredAccount {
  account: CrmAccount;
  scoring: AccountScore;
  priorityRank: number; // 1 = highest priority, stable regardless of table sort
}

export function scoreAll(
  accounts: CrmAccount[],
  telemetryByDomain: Map<string, ProductTelemetry>,
  signalsByDomain: Map<string, GongSignal[]>,
  asOf?: Date,
): ScoredAccount[] {
  return accounts
    .map((account) => ({
      account,
      scoring: scoreAccount({
        account,
        telemetry: telemetryByDomain.get(account.domain) ?? null,
        signals: signalsByDomain.get(account.domain) ?? [],
        asOf,
      }),
    }))
    .sort((a, b) => b.scoring.score - a.scoring.score)
    .map((entry, i) => ({ ...entry, priorityRank: i + 1 }));
}

export function groupByDomain<T extends { domain: string }>(rows: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const list = map.get(row.domain) ?? [];
    list.push(row);
    map.set(row.domain, list);
  }
  return map;
}

export function indexByDomain<T extends { domain: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((r) => [r.domain, r]));
}
