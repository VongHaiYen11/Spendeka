import {
  EXPENSE_CATEGORIES_EN,
  INCOME_CATEGORIES_EN,
  type ExpenseCategory,
  type IncomeCategory,
} from "@/models/Expense";

/**
 * Database Transaction structure - matches Firestore schema
 * imageUrl can be blank (e.g. for manual/income entries without a photo)
 */
export interface DatabaseTransaction {
  id: string;
  imageUrl?: string; // Optional; can be blank for transactions without image
  caption: string;
  amount: number;
  category: TransactionCategory;
  type: "income" | "spent";
  createdAt: Date;
}

/** Re-export from @/models/Expense */
export type { ExpenseCategory, IncomeCategory } from "@/models/Expense";

/**
 * Union of all transaction categories (expense or income)
 */
export type TransactionCategory = ExpenseCategory | IncomeCategory;

/**
 * Category Icon Configuration
 * Icon and color are defined in @/models/Expense (EXPENSE_CATEGORIES_EN / INCOME_CATEGORIES_EN)
 */
export interface CategoryIconConfig {
  icon: string; // Ionicons name
  color: string; // Background color for icon container
}

/**
 * Get category icon configuration (expense or income)
 * Icon and color are defined in @/models/Expense for easy editing
 */
export const getCategoryIconConfig = (
  category: TransactionCategory
): CategoryIconConfig => {
  const fromExpense = EXPENSE_CATEGORIES_EN.find((c) => c.value === category);
  if (fromExpense) return { icon: fromExpense.icon, color: fromExpense.color };
  const fromIncome = INCOME_CATEGORIES_EN.find((c) => c.value === category);
  if (fromIncome) return { icon: fromIncome.icon, color: fromIncome.color };
  return { icon: "ellipsis-horizontal", color: "#AEB6BF" };
};
