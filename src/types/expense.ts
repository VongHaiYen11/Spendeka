/**
 * Database Transaction structure - matches Firestore schema
 */
export interface DatabaseTransaction {
  id: string;
  imageUrl: string;
  caption: string;
  amount: number;
  category: ExpenseCategory;
  type: "income" | "spent";
  createdAt: Date;
}

/**
 * Expense Category type - matches your DatabaseTransaction
 * Note: Must match ExpenseCategory in @/models/Expense.ts
 */
export type ExpenseCategory =
  | "food"
  | "transport"
  | "shopping"
  | "bills"
  | "entertainment"
  | "health"
  | "education"
  | "other";

/**
 * Category Icon Configuration
 * Maps each category to its Ionicons name and color
 * Easy to edit and maintain in one place
 */
export interface CategoryIconConfig {
  icon: string; // Ionicons name
  color: string; // Background color for icon container
}

export const CATEGORY_ICONS: Record<ExpenseCategory, CategoryIconConfig> = {
  food: { icon: "fast-food", color: "#FF6B6B" },
  transport: { icon: "car", color: "#4ECDC4" },
  shopping: { icon: "bag-handle", color: "#FFE66D" },
  entertainment: { icon: "game-controller", color: "#95E1D3" },
  bills: { icon: "receipt", color: "#DDA0DD" },
  health: { icon: "medical", color: "#98D8C8" },
  education: { icon: "book", color: "#F7DC6F" },
  other: { icon: "ellipsis-horizontal", color: "#AEB6BF" },
};

/**
 * Get category icon configuration
 */
export const getCategoryIconConfig = (
  category: ExpenseCategory,
): CategoryIconConfig => {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.other;
};
