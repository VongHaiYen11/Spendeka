import { DatabaseTransaction } from "@/types/transaction";
import { getDateRange, RangeType } from "@/utils/getDateRange";

// Helper function to compare dates (ignoring time)
function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return dateToCheck >= start && dateToCheck <= end;
}

/**
 * Filter transactions by date range
 */
export const filterTransactionsByDateRange = (
  transactions: DatabaseTransaction[],
  startDate: Date,
  endDate: Date,
): DatabaseTransaction[] => {
  return transactions.filter((t) => isDateInRange(t.createdAt, startDate, endDate));
};

/**
 * Filter transactions by range (day, week, month, year, all)
 */
export const filterTransactionsByRange = (
  transactions: DatabaseTransaction[],
  range: RangeType,
  currentDate: Date,
): DatabaseTransaction[] => {
  const { start, end } = getDateRange(range, currentDate);

  return transactions.filter((t) => {
    const d = t.createdAt;
    if (!start) {
      // all-time: từ đầu đến hôm nay
      const endDate = new Date(end || new Date());
      endDate.setHours(23, 59, 59, 999);
      return d <= endDate;
    }
    return isDateInRange(d, start, end);
  });
};

/**
 * Calculate saved (income) amount from transactions
 */
export const calculateSavedAmount = (
  transactions: DatabaseTransaction[],
): number => {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

/**
 * Calculate spent amount from transactions
 */
export const calculateSpentAmount = (
  transactions: DatabaseTransaction[],
): number => {
  return transactions
    .filter((t) => !t.type || t.type === "spent")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

/**
 * Calculate total amount (income - spent) from transactions
 */
export const calculateTotalAmount = (
  transactions: DatabaseTransaction[],
): number => {
  return transactions.reduce((sum, t) => {
    // Income adds to total, spent subtracts from total
    return t.type === "income" ? sum + t.amount : sum - t.amount;
  }, 0);
};

/**
 * Get income by category from transactions
 */
export const getIncomeByCategoryFromTransactions = (
  transactions: DatabaseTransaction[],
): Record<string, number> => {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {});
};

/**
 * Get spent by category from transactions
 */
export const getSpentByCategoryFromTransactions = (
  transactions: DatabaseTransaction[],
): Record<string, number> => {
  return transactions
    .filter((t) => !t.type || t.type === "spent")
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {});
};
