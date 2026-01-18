import data from '@/data/fakeData.json';
import { getDateRange } from '@/utils/getDateRange';

export function getUserTransactions(userId: string) {
  return data.transactions.filter(t => t.userId === userId);
}

// Lọc theo range
export function getTransactionsByRange(userId: string, range: string, currentDate: Date) {
  const { start, end } = getDateRange(range as any, currentDate);
  return getUserTransactions(userId).filter(t => {
    const d = new Date(t.date);
    if (!start) {
        // all-time: từ đầu đến hôm nay
        return d <= end;
    }
    return d >= start && d <= end;
  });
}

// Tổng tiền theo category
export function summarizeByCategory(userId: string, range: string, currentDate: Date) {
  const txs = getTransactionsByRange(userId, range, currentDate);
  return txs.reduce((acc: Record<string, number>, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
}

// Tổng tiền
export function getTotalAmount(userId: string, range: string, currentDate: Date) {
  const txs = getTransactionsByRange(userId, range, currentDate);
  return txs.reduce((sum, t) => sum + t.amount, 0);
}
