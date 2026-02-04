export type TransactionType = "income" | "spent";

export interface ParsedTransactionFromText {
  caption: string;
  amount: number;
  category: string;
  type: TransactionType;
  createdAt: string; // ISO datetime string
}

