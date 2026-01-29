import { EXPENSE_CATEGORIES_EN } from '@/models/Expense';

/**
 * Get category icon name (Ionicons name) based on category name
 * @param categoryName - The category name (e.g., 'food', 'transport')
 * @returns The Ionicons icon name (e.g., 'fast-food', 'car')
 */
export const getCategoryIcon = (categoryName: string): string => {
  const category = EXPENSE_CATEGORIES_EN.find(
    (c) => c.value.toLowerCase() === categoryName.toLowerCase()
  );
  return category?.icon || 'ellipsis-horizontal';
};

/**
 * Get category emoji icon based on category name (for compatibility with summary screens)
 * @param categoryName - The category name (e.g., 'food', 'transport')
 * @returns The emoji icon
 */
export const getCategoryIconEmoji = (categoryName: string): string => {
  // Map ExpenseCategory to emoji icons
  const categoryIconMap: Record<string, string> = {
    food: '🍽️',
    transport: '🚗',
    shopping: '🛒',
    entertainment: '🎮',
    bills: '📄',
    health: '🏥',
    education: '📚',
    other: '📝',
  };

  return categoryIconMap[categoryName.toLowerCase()] || '📝';
};
