export interface Ledger {
  id: string;
  payingExpenses: Paying[];
  deductionExpenses: Paying[];
  calcGroups: Record<string, number>;
  createdAt: string;
}

export interface Paying {
  memo?: string | null;
  group:  string | null;
  value:  string | null;
  purpose:  string | null;
}

export interface PatchLedger {
  id: string;
  paying: Paying[],
  deduction: Paying[],
}

export interface PostLedger {
  paying: Paying[];
  deduction: Paying[];
  createdAt: string;
}

export interface Deduction {
  purpose: string;
  value?: string;
}