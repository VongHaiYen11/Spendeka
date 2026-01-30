import { DatabaseTransaction } from "@/types/transaction";
import { format } from "date-fns";

// Group transactions by month
export const groupTransactionsByMonth = (
  transactions: DatabaseTransaction[],
) => {
  const groups: Record<string, DatabaseTransaction[]> = {};

  transactions.forEach((transaction) => {
    const date = transaction.createdAt;
    // Format as "MMMM yyyy" (e.g., "January 2026")
    const monthKey = format(date, "MMMM yyyy");

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(transaction);
  });

  // Sort transactions within each group by date (newest first)
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  return groups;
};

// Sort month groups by date (newest first)
export const sortMonthKeys = (monthKeys: string[]): string[] => {
  return monthKeys.sort((a, b) => {
    // Parse "MMMM yyyy" format back to dates for comparison
    // Create dates from the month strings (e.g., "January 2026" -> Date)
    const dateA = new Date(a + " 1"); // Add day 1 to make it a valid date
    const dateB = new Date(b + " 1");
    // Compare in reverse (newest first)
    return dateB.getTime() - dateA.getTime();
  });
};

// Filter transactions by search query and filters
export const filterTransactions = (
  transactions: DatabaseTransaction[],
  searchQuery: string,
  filters?: {
    transactionType?: "all" | "income" | "spent";
    categories?: string[];
    minAmount?: string;
    maxAmount?: string;
  },
): DatabaseTransaction[] => {
  let filtered = transactions;

  // Filter by transaction type
  if (filters?.transactionType && filters.transactionType !== "all") {
    filtered = filtered.filter((t) => {
      return t.type === filters.transactionType;
    });
  }

  // Filter by categories
  if (filters?.categories && filters.categories.length > 0) {
    filtered = filtered.filter((t) => filters.categories!.includes(t.category));
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
