import data from '@/data/fakeData.json';
import { getDateRange } from '@/utils/getDateRange';

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  amount: number;
  category: string;
  note?: string;
}

interface FakeDataStore {
  transactions: Transaction[];
}

const store = data as FakeDataStore;

// Helper function to compare dates (ignoring time)
function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  // Set time to start of day for proper date comparison
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  return dateToCheck >= start && dateToCheck <= end;
}

export function getUserTransactions(userId: string) {
  return store.transactions.filter(t => t.userId === userId);
}

// Lọc theo range
export function getTransactionsByRange(userId: string, range: string, currentDate: Date) {
  const { start, end } = getDateRange(range as any, currentDate);
  return getUserTransactions(userId).filter(t => {
    const d = new Date(t.date);
    if (!start) {
        // all-time: từ đầu đến hôm nay
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        return d <= endDate;
    }
    return isDateInRange(d, start, end);
  });
}

export function getTransactionsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  return getUserTransactions(userId).filter(t => {
    const d = new Date(t.date);
    return isDateInRange(d, startDate, endDate);
  });
}

export function getRawSummaryData(userId: string, startDate: Date, endDate: Date) {
  return getTransactionsByDateRange(userId, startDate, endDate);
}

// Split amount: negative = income, positive = spent
function splitAmount(amount: number) {
  if (amount < 0) {
    return { income: Math.abs(amount), spent: 0 };
  }
  return { income: 0, spent: amount };
}

// Calculate saved (income) amount for a range
export function getSavedAmount(userId: string, range: string, currentDate: Date): number {
  const txs = getTransactionsByRange(userId, range, currentDate);
  return txs.reduce((sum, t) => {
    const { income } = splitAmount(t.amount);
    return sum + income;
  }, 0);
}

// Calculate saved (income) amount for a date range
export function getSavedAmountByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): number {
  const txs = getTransactionsByDateRange(userId, startDate, endDate);
  return txs.reduce((sum, t) => {
    const { income } = splitAmount(t.amount);
    return sum + income;
  }, 0);
}

// Calculate spent amount for a range
export function getSpentAmount(userId: string, range: string, currentDate: Date): number {
  const txs = getTransactionsByRange(userId, range, currentDate);
  return txs.reduce((sum, t) => {
    const { spent } = splitAmount(t.amount);
    return sum + spent;
  }, 0);
}

// Calculate spent amount for a date range
export function getSpentAmountByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): number {
  const txs = getTransactionsByDateRange(userId, startDate, endDate);
  return txs.reduce((sum, t) => {
    const { spent } = splitAmount(t.amount);
    return sum + spent;
  }, 0);
}

// Calculate total amount (income - spent, or net)
export function getTotalAmount(userId: string, range: string, currentDate: Date): number {
  const txs = getTransactionsByRange(userId, range, currentDate);
  return txs.reduce((sum, t) => sum + t.amount, 0);
}

// Calculate total amount for a date range
export function getTotalAmountByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): number {
  const txs = getTransactionsByDateRange(userId, startDate, endDate);
  return txs.reduce((sum, t) => sum + t.amount, 0);
}

// Tổng tiền theo category
export function summarizeByCategory(userId: string, range: string, currentDate: Date) {
  const txs = getTransactionsByRange(userId, range, currentDate);
  return txs.reduce((acc: Record<string, number>, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
}

// Get category data for income (negative amounts)
export function getIncomeByCategory(
  userId: string,
  startDate: Date,
  endDate: Date
): Record<string, number> {
  const txs = getTransactionsByDateRange(userId, startDate, endDate);
  return txs.reduce((acc: Record<string, number>, t) => {
    const { income } = splitAmount(t.amount);
    if (income > 0) {
      acc[t.category] = (acc[t.category] || 0) + income;
    }
    return acc;
  }, {});
}

// Get category data for spent (positive amounts)
export function getSpentByCategory(
  userId: string,
  startDate: Date,
  endDate: Date
): Record<string, number> {
  const txs = getTransactionsByDateRange(userId, startDate, endDate);
  return txs.reduce((acc: Record<string, number>, t) => {
    const { spent } = splitAmount(t.amount);
    if (spent > 0) {
      acc[t.category] = (acc[t.category] || 0) + spent;
    }
    return acc;
  }, {});
}

// Get category color from database
export function getCategoryColor(categoryId: string): string {
  const category = (data as any).categories?.find((c: any) => c.id === categoryId);
  return category?.color || '#CCCCCC'; // Default gray if not found
}
