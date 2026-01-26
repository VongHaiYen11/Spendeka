import { Transaction } from '@/server/fakeDBGetData';
import { format, isToday, isYesterday } from 'date-fns';

// Group transactions by date
export const groupTransactionsByDate = (transactions: Transaction[]) => {
  const groups: Record<string, Transaction[]> = {};
  
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    let dateKey: string;
    
    if (isToday(date)) {
      dateKey = 'TODAY';
    } else if (isYesterday(date)) {
      dateKey = 'YESTERDAY';
    } else {
      dateKey = format(date, 'dd/MM/yy');
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
  });
  
  // Sort transactions within each group by time (newest first)
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  
  return groups;
};

// Sort date groups: TODAY, YESTERDAY, then by date (newest first)
export const sortDateKeys = (dateKeys: string[]): string[] => {
  return dateKeys.sort((a, b) => {
    if (a === 'TODAY') return -1;
    if (b === 'TODAY') return 1;
    if (a === 'YESTERDAY') return -1;
    if (b === 'YESTERDAY') return 1;
    // For date strings, parse and compare
    return b.localeCompare(a);
  });
};

// Filter transactions by search query
export const filterTransactions = (
  transactions: Transaction[],
  searchQuery: string
): Transaction[] => {
  if (!searchQuery.trim()) {
    return transactions;
  }
  
  const query = searchQuery.toLowerCase();
  return transactions.filter(
    (t) =>
      t.category.toLowerCase().includes(query) ||
      (t.note && t.note.toLowerCase().includes(query))
  );
};
