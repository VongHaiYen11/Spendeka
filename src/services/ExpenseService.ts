import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '@/config/cloudinaryConfig';
import { createExpense, Expense, ExpenseCategory } from '@/models/Expense';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDateRange, RangeType } from '@/utils/getDateRange';
import { getCategoryIconEmoji } from '@/utils/getCategoryIcon';

const EXPENSES_STORAGE_KEY = '@spendeka_expenses';

/**
 * Database transaction interface - what's actually stored in the database
 * Includes type field to distinguish between income and spent transactions
 */
export interface DatabaseTransaction {
  id: string;
  imageUrl: string;
  caption: string;
  amount: number;
  category: ExpenseCategory;
  type: 'income' | 'spent';
  createdAt: Date;
}

/**
 * Transaction-like interface for compatibility with summary screens.
 * Currently we don't support multiple users, so there's no userId field.
 */
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  note?: string;
  type?: 'income' | 'spent'; // Optional for backward compatibility
}

/**
 * Helper function to compare dates (ignoring time)
 */
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
 * Convert Expense to DatabaseTransaction format
 */
function expenseToDatabaseTransaction(expense: Expense): DatabaseTransaction {
  return {
    id: expense.id,
    imageUrl: expense.imageUrl,
    caption: expense.caption,
    amount: expense.amount,
    category: expense.category,
    type: 'spent', // Expenses created via camera are always spent
    createdAt: expense.createdAt,
  };
}

/**
 * Convert DatabaseTransaction to Expense format (for backward compatibility)
 */
function databaseTransactionToExpense(dbTx: DatabaseTransaction): Expense {
  return {
    id: dbTx.id,
    imageUrl: dbTx.imageUrl,
    caption: dbTx.caption,
    amount: dbTx.amount,
    category: dbTx.category,
    createdAt: dbTx.createdAt,
  };
}

/**
 * Convert DatabaseTransaction to Transaction format (for summary/history screens)
 */
function databaseTransactionToTransaction(dbTx: DatabaseTransaction): Transaction {
  return {
    id: dbTx.id,
    date: dbTx.createdAt.toISOString(),
    amount: dbTx.type === 'income' ? -dbTx.amount : dbTx.amount, // Income is negative, spent is positive
    category: dbTx.category,
    note: dbTx.caption,
    type: dbTx.type,
  };
}

/**
 * Upload ảnh lên Cloudinary và tạo expense mới
 */
export const createExpenseWithImage = async (
  imageUri: string,
  caption: string,
  amount: number,
  category: ExpenseCategory
): Promise<Expense> => {
  try {
    // Upload ảnh lên Cloudinary
    const imageUrl = await uploadImageToCloudinary(imageUri);

    // Tạo expense mới
    const expense = createExpense(imageUrl, caption, amount, category);

    // Lưu vào storage
    await saveExpense(expense);

    return expense;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

/**
 * Upload ảnh lên Cloudinary
 */
const uploadImageToCloudinary = async (uri: string): Promise<string> => {
  const formData = new FormData();

  const uriParts = uri.split('.');
  const fileType = uriParts[uriParts.length - 1];

  formData.append('file', {
    uri: uri,
    type: `image/${fileType}`,
    name: `expense_${Date.now()}.${fileType}`,
  } as any);

  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'spendeka_expenses');

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};

/**
 * Lưu expense vào AsyncStorage (converts to DatabaseTransaction)
 */
const saveExpense = async (expense: Expense): Promise<void> => {
  try {
    const dbTx = expenseToDatabaseTransaction(expense);
    const existingTransactions = await getDatabaseTransactions();
    const updatedTransactions = [dbTx, ...existingTransactions];
    await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
};

/**
 * Get all database transactions from storage
 */
const getDatabaseTransactions = async (): Promise<DatabaseTransaction[]> => {
  try {
    const transactionsJson = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!transactionsJson) {
      return [];
    }

    const transactions: DatabaseTransaction[] = JSON.parse(transactionsJson);
    return transactions
      .map((t) => ({
        ...t,
        createdAt: new Date(t.createdAt),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error loading database transactions:', error);
    return [];
  }
};

/**
 * Lấy tất cả expenses, sắp xếp theo thời gian mới nhất
 * Converts DatabaseTransaction to Expense for backward compatibility
 */
export const getExpenses = async (): Promise<Expense[]> => {
  const dbTransactions = await getDatabaseTransactions();
  return dbTransactions.map(databaseTransactionToExpense);
};

/**
 * Lấy expense theo ID
 */
export const getExpenseById = async (id: string): Promise<Expense | null> => {
  const expenses = await getExpenses();
  return expenses.find((e) => e.id === id) || null;
};

/**
 * Xóa expense
 */
export const deleteExpense = async (id: string): Promise<void> => {
  try {
    const existingTransactions = await getDatabaseTransactions();
    const updatedTransactions = existingTransactions.filter((t) => t.id !== id);
    await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

/**
 * Lấy tổng chi tiêu theo category
 */
export const getExpensesByCategory = async (
  category: ExpenseCategory
): Promise<Expense[]> => {
  const expenses = await getExpenses();
  return expenses.filter((e) => e.category === category);
};

/**
 * Lấy tổng chi tiêu trong khoảng thời gian
 */
export const getExpensesInRange = async (
  startDate: Date,
  endDate: Date
): Promise<Expense[]> => {
  const dbTransactions = await getDatabaseTransactions();
  return dbTransactions
    .filter((t) => isDateInRange(t.createdAt, startDate, endDate))
    .map(databaseTransactionToExpense);
};

/**
 * Get database transactions in date range
 */
const getDatabaseTransactionsInRange = async (
  startDate: Date,
  endDate: Date
): Promise<DatabaseTransaction[]> => {
  const dbTransactions = await getDatabaseTransactions();
  return dbTransactions.filter((t) => isDateInRange(t.createdAt, startDate, endDate));
};

/**
 * Tính tổng số tiền
 */
export const getTotalAmount = async (): Promise<number> => {
  const expenses = await getExpenses();
  return expenses.reduce((sum, e) => sum + e.amount, 0);
};

/**
 * Xóa tất cả expenses
 */
export const clearAllExpenses = async (): Promise<void> => {
  await AsyncStorage.removeItem(EXPENSES_STORAGE_KEY);
};

// ============================================================================
// Adapter functions for summary screens (compatible with fakeDBGetData.ts)
// ============================================================================

/**
 * Get transactions by date range (for summary screens)
 */
export const getTransactionsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> => {
  const dbTransactions = await getDatabaseTransactionsInRange(startDate, endDate);
  return dbTransactions.map(databaseTransactionToTransaction);
};

/**
 * Get raw summary data (for overview chart)
 */
export const getRawSummaryData = async (
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> => {
  return getTransactionsByDateRange(startDate, endDate);
};

/**
 * Get transactions by range (for summary screens)
 */
export const getTransactionsByRange = async (
  range: string,
  currentDate: Date
): Promise<Transaction[]> => {
  const { start, end } = getDateRange(range as RangeType, currentDate);
  const dbTransactions = await getDatabaseTransactions();

  return dbTransactions
    .filter((t) => {
      const d = t.createdAt;
      if (!start) {
        // all-time: từ đầu đến hôm nay
        const endDate = new Date(end || new Date());
        endDate.setHours(23, 59, 59, 999);
        return d <= endDate;
      }
      return isDateInRange(d, start, end);
    })
    .map(databaseTransactionToTransaction);
};

/**
 * Calculate saved (income) amount for a range
 */
export const getSavedAmount = async (
  range: string,
  currentDate: Date
): Promise<number> => {
  const txs = await getTransactionsByRange(range, currentDate);
  return txs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

/**
 * Calculate saved (income) amount for a date range
 */
export const getSavedAmountByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<number> => {
  const txs = await getTransactionsByDateRange(startDate, endDate);
  return txs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

/**
 * Calculate spent amount for a range
 */
export const getSpentAmount = async (
  range: string,
  currentDate: Date
): Promise<number> => {
  const txs = await getTransactionsByRange(range, currentDate);
  return txs
    .filter((t) => t.type === 'spent')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

/**
 * Calculate spent amount for a date range
 */
export const getSpentAmountByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<number> => {
  const txs = await getTransactionsByDateRange(startDate, endDate);
  return txs
    .filter((t) => t.type === 'spent')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

/**
 * Calculate total amount for a range (income - spent)
 */
export const getTotalAmountByRange = async (
  range: string,
  currentDate: Date
): Promise<number> => {
  const txs = await getTransactionsByRange(range, currentDate);
  return txs.reduce((sum, t) => {
    // Income is negative amount, spent is positive amount
    return sum + t.amount;
  }, 0);
};

/**
 * Calculate total amount for a date range (income - spent)
 */
export const getTotalAmountByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<number> => {
  const txs = await getTransactionsByDateRange(startDate, endDate);
  return txs.reduce((sum, t) => {
    // Income is negative amount, spent is positive amount
    return sum + t.amount;
  }, 0);
};

/**
 * Get income by category
 */
export const getIncomeByCategory = async (
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> => {
  const txs = await getTransactionsByDateRange(startDate, endDate);
  return txs
    .filter((t) => t.type === 'income')
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {});
};

/**
 * Get spent by category
 */
export const getSpentByCategory = async (
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> => {
  const txs = await getTransactionsByDateRange(startDate, endDate);
  return txs
    .filter((t) => t.type === 'spent')
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {});
};

/**
 * Get category icon from ExpenseCategory (returns emoji for compatibility)
 * @deprecated Use getCategoryIconEmoji from '@/utils/getCategoryIcon' instead
 */
export const getCategoryIcon = (categoryId: string): string => {
  return getCategoryIconEmoji(categoryId);
};
