import { EXPENSE_CATEGORIES_EN, INCOME_CATEGORIES_EN } from '@/models/Expense';

/**
 * Get category icon name (Ionicons name) based on category name
 * Supports both expense and income categories
 */
export const getCategoryIcon = (categoryName: string): string => {
  const lower = categoryName.toLowerCase();
  const expense = EXPENSE_CATEGORIES_EN.find((c) => c.value === lower);
  if (expense) return expense.icon;
  const income = INCOME_CATEGORIES_EN.find((c) => c.value === lower);
  if (income) return income.icon;
  return 'ellipsis-horizontal';
};

/**
 * Get category emoji icon based on category name (for compatibility with summary screens)
 * Supports both expense and income categories
 */
export const getCategoryIconEmoji = (categoryName: string): string => {
  const lower = categoryName.toLowerCase();
  const expenseMap: Record<string, string> = {
    food: '🍽️',
    transport: '🚗',
    shopping: '🛒',
    entertainment: '🎮',
    bills: '📄',
    health: '🏥',
    education: '📚',
    other: '📝',
  };
  const incomeMap: Record<string, string> = {
    salary: '💼',
    freelance: '💻',
    investment: '📈',
    gift: '🎁',
    refund: '↩️',
    other_income: '💰',
  };
  return expenseMap[lower] ?? incomeMap[lower] ?? '📝';
};
