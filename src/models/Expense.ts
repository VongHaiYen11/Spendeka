// Expense model
export interface Expense {
  id: string;
  imageUrl?: string; // Optional; can be blank for transactions without image
  caption: string;
  amount: number;
  category: ExpenseCategory;
  type?: "income" | "spent"; // Optional for backward compatibility
  createdAt: Date;
}

// Expense category types
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'health'
  | 'education'
  | 'other';

interface CategoryInfo {
  value: ExpenseCategory;
  label: string;
  icon: string;
  color: string;
}

// English category labels
export const EXPENSE_CATEGORIES_EN: CategoryInfo[] = [
  { value: 'food', label: 'Food', icon: 'fast-food', color: '#FF6B6B' },
  { value: 'transport', label: 'Transport', icon: 'car', color: '#4ECDC4' },
  { value: 'shopping', label: 'Shopping', icon: 'bag-handle', color: '#FFE66D' },
  { value: 'entertainment', label: 'Fun', icon: 'game-controller', color: '#95E1D3' },
  { value: 'bills', label: 'Bills', icon: 'receipt', color: '#DDA0DD' },
  { value: 'health', label: 'Health', icon: 'medical', color: '#98D8C8' },
  { value: 'education', label: 'Education', icon: 'book', color: '#F7DC6F' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#AEB6BF' },
];

// Vietnamese category labels (kept for backward compatibility)
export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { value: 'food', label: 'Ăn uống', icon: 'fast-food', color: '#FF6B6B' },
  { value: 'transport', label: 'Di chuyển', icon: 'car', color: '#4ECDC4' },
  { value: 'shopping', label: 'Mua sắm', icon: 'bag-handle', color: '#FFE66D' },
  { value: 'entertainment', label: 'Giải trí', icon: 'game-controller', color: '#95E1D3' },
  { value: 'bills', label: 'Hóa đơn', icon: 'receipt', color: '#DDA0DD' },
  { value: 'health', label: 'Sức khỏe', icon: 'medical', color: '#98D8C8' },
  { value: 'education', label: 'Học tập', icon: 'book', color: '#F7DC6F' },
  { value: 'other', label: 'Khác', icon: 'ellipsis-horizontal', color: '#AEB6BF' },
];

// Helper to create new expense (imageUrl can be blank)
export const createExpense = (
  imageUrl: string,
  caption: string,
  amount: number,
  category: ExpenseCategory,
  type: "income" | "spent" = "spent"
): Expense => ({
  id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  imageUrl: imageUrl ?? "",
  caption,
  amount,
  category,
  type,
  createdAt: new Date(),
});

// Helper to get category info (English)
export const getCategoryInfo = (category: ExpenseCategory): CategoryInfo => {
  return EXPENSE_CATEGORIES_EN.find((c) => c.value === category) || EXPENSE_CATEGORIES_EN[7];
};

// Format amount
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};
