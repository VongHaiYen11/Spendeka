import { DatabaseTransaction } from "@/types/transaction";
import { format } from "date-fns";

function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
}

// Group transactions by month
export const groupTransactionsByMonth = (
  transactions: DatabaseTransaction[],
) => {
  const groups: Record<string, DatabaseTransaction[]> = {};

  transactions.forEach((transaction) => {
    const date = transaction.createdAt;
    const monthKey = format(date, "MMMM yyyy");

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(transaction);
  });

  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  return groups;
};

// Group transactions by year
export const groupTransactionsByYear = (
  transactions: DatabaseTransaction[],
) => {
  const groups: Record<string, DatabaseTransaction[]> = {};

  transactions.forEach((transaction) => {
    const date = transaction.createdAt;
    const yearKey = format(date, "yyyy");

    if (!groups[yearKey]) {
      groups[yearKey] = [];
    }
    groups[yearKey].push(transaction);
  });

  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  return groups;
};

// Group transactions by day (key: "yyyy-MM-dd" for easy sorting)
export const groupTransactionsByDay = (
  transactions: DatabaseTransaction[],
): Record<string, DatabaseTransaction[]> => {
  const groups: Record<string, DatabaseTransaction[]> = {};

  transactions.forEach((transaction) => {
    const date = transaction.createdAt;
    const dayKey = format(date, "yyyy-MM-dd");

    if (!groups[dayKey]) {
      groups[dayKey] = [];
    }
    groups[dayKey].push(transaction);
  });

  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  return groups;
};

// Sort month keys like "January 2026" (newest first)
export const sortMonthKeys = (monthKeys: string[]): string[] => {
  return [...monthKeys].sort((a, b) => {
    const dateA = new Date(a + " 1");
    const dateB = new Date(b + " 1");
    return dateB.getTime() - dateA.getTime();
  });
};

// Sort group keys: "yyyy-MM-dd" (day), "2026" (year), or "January 2026" (month)
export const sortGroupKeys = (keys: string[]): string[] => {
  if (keys.length <= 1) return keys;
  const isYearFormat = keys.every((k) => /^\d{4}$/.test(k));
  if (isYearFormat) {
    return [...keys].sort((a, b) => Number(b) - Number(a));
  }
  const isDayFormat = keys.every((k) => /^\d{4}-\d{2}-\d{2}$/.test(k));
  if (isDayFormat) {
    return [...keys].sort((a, b) => b.localeCompare(a));
  }
  return sortMonthKeys(keys);
};

// Filter transactions by search query and filters (includes optional date range)
export const filterTransactions = (
  transactions: DatabaseTransaction[],
  searchQuery: string,
  filters?: {
    transactionType?: "all" | "income" | "spent";
    categories?: string[];
    minAmount?: string;
    maxAmount?: string;
    startDate?: Date | null;
    endDate?: Date | null;
  },
): DatabaseTransaction[] => {
  let filtered = transactions;

  // Filter by date range first
  if (filters?.startDate && filters?.endDate) {
    filtered = filtered.filter((t) =>
      isDateInRange(t.createdAt, filters.startDate!, filters.endDate!),
    );
  }

  // Filter by transaction type
  if (filters?.transactionType && filters.transactionType !== "all") {
    filtered = filtered.filter((t) => t.type === filters.transactionType);
  }

  // Filter by categories (category values, e.g. "food", "transport")
  if (filters?.categories && filters.categories.length > 0) {
    filtered = filtered.filter((t) =>
      filters.categories!.includes(t.category),
    );
  }

  // Filter by amount range
  if (filters?.minAmount) {
    const min = parseFloat(filters.minAmount);
    if (!isNaN(min)) {
      filtered = filtered.filter((t) => Math.abs(t.amount) >= min);
    }
  }

  if (filters?.maxAmount) {
    const max = parseFloat(filters.maxAmount);
    if (!isNaN(max)) {
      filtered = filtered.filter((t) => Math.abs(t.amount) <= max);
    }
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.category.toLowerCase().includes(query) ||
        (t.caption && t.caption.toLowerCase().includes(query)),
    );
  }

  return filtered;
};
