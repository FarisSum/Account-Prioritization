// Joins crm rows to their computed score and priority rank for the UI.

import { scoreAccount, type AccountScore, type ScoringWeights } from "./scoring";
import type { CrmAccount } from "./types";

export interface ScoredAccount {
  account: CrmAccount;
  scoring: AccountScore;
  priorityRank: number; // 1 = highest priority, stable regardless of table sort
}

export function scoreAll(
  accounts: CrmAccount[],
  weights?: ScoringWeights,
  asOf?: Date,
): ScoredAccount[] {
  return accounts
    .map((account) => ({ account, scoring: scoreAccount(account, weights, asOf) }))
    .sort((a, b) => b.scoring.score - a.scoring.score)
    .map((entry, i) => ({ ...entry, priorityRank: i + 1 }));
}
