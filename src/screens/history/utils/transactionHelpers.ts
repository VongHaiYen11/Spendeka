import { Transaction } from "@/services/ExpenseService";
import { format } from "date-fns";

// Group transactions by month
export const groupTransactionsByMonth = (transactions: Transaction[]) => {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    // Format as "MMMM yyyy" (e.g., "January 2026")
    const monthKey = format(date, "MMMM yyyy");

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(transaction);
  });

  // Sort transactions within each group by date (newest first)
  Object.keys(groups).forEach((key) => {
    groups[key].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
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

// Filter transactions by search query
export const filterTransactions = (
  transactions: Transaction[],
  searchQuery: string,
): Transaction[] => {
  if (!searchQuery.trim()) {
    return transactions;
  }

  const query = searchQuery.toLowerCase();
  return transactions.filter(
    (t) =>
      t.category.toLowerCase().includes(query) ||
      (t.note && t.note.toLowerCase().includes(query)),
  );
};
