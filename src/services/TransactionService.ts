import {
    CLOUDINARY_CONFIG,
    CLOUDINARY_UPLOAD_URL,
} from "@/config/cloudinaryConfig";
import { auth, db } from "@/config/firebaseConfig";
import { transactionEventEmitter } from "@/contexts/TransactionEventEmitter";
import { createExpense, Expense, ExpenseCategory } from "@/models/Expense";
import { DatabaseTransaction } from "@/types/transaction";
import { getCategoryIconEmoji } from "@/utils/getCategoryIcon";
import { getDateRange, RangeType } from "@/utils/getDateRange";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

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

const EXPENSES_COLLECTION = "expenses";

const getCurrentUserId = (): string | null => {
  const user = auth?.currentUser;
  return user?.uid ?? null;
};

/**
 * Generate a unique transaction id (shared by camera and add-transaction flows)
 */
export function generateTransactionId(): string {
  return `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Single function for creating and saving a transaction to the database.
 * Used by: Add Transaction screen, Camera (ExpensePreviewScreen).
 * - Uploads image to Cloudinary if imageUri is provided, then sets transaction.imageUrl.
 * - Saves to Firestore (saveDatabaseTransaction emits so charts/history refresh).
 */
export const createAndSaveTransaction = async (
  transaction: DatabaseTransaction,
  imageUri?: string | null
): Promise<void> => {
  if (imageUri) {
    transaction.imageUrl =
      (await uploadImageToCloudinary(imageUri)) || undefined;
  }
  await saveDatabaseTransaction(transaction);
};

/**
 * @deprecated Use createAndSaveTransaction with a DatabaseTransaction instead.
 * Upload ảnh lên Cloudinary và tạo expense mới (expense-only, type "spent").
 */
export const createExpenseWithImage = async (
  imageUri: string,
  caption: string,
  amount: number,
  category: ExpenseCategory,
): Promise<Expense> => {
  const transaction: DatabaseTransaction = {
    id: generateTransactionId(),
    imageUrl: undefined,
    caption,
    amount,
    category,
    type: "spent",
    createdAt: new Date(),
  };
  await createAndSaveTransaction(transaction, imageUri);
  return {
    id: transaction.id,
    imageUrl: transaction.imageUrl ?? "",
    caption: transaction.caption,
    amount: transaction.amount,
    category: transaction.category,
    type: transaction.type,
    createdAt: transaction.createdAt,
  };
};

/**
 * Upload ảnh lên Cloudinary
 */
export const uploadImageToCloudinary = async (uri: string): Promise<string> => {
  const formData = new FormData();

  const uriParts = uri.split(".");
  const fileType = uriParts[uriParts.length - 1];

  formData.append("file", {
    uri: uri,
    type: `image/${fileType}`,
    name: `expense_${Date.now()}.${fileType}`,
  } as any);

  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("folder", "spendeka_expenses");

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Upload failed");
  }

  const data = await response.json();
  return data.secure_url;
};

/**
 * Lưu expense vào Firestore (converts to DatabaseTransaction)
 */
const saveExpense = async (expense: Expense): Promise<void> => {
  try {
    // Convert Expense to DatabaseTransaction format
    const dbTransaction: DatabaseTransaction = {
      id: expense.id,
      imageUrl: expense.imageUrl ?? "",
      caption: expense.caption,
      amount: expense.amount,
      category: expense.category,
      type: "spent", // Default to 'spent' for backward compatibility
      createdAt: expense.createdAt,
    };

    await saveDatabaseTransaction(dbTransaction);
    // Notify all listeners that transactions have changed
    transactionEventEmitter.emit();
  } catch (error) {
    throw error;
  }
};

/**
 * Save DatabaseTransaction directly to Firestore
 */
export const saveDatabaseTransaction = async (
  transaction: DatabaseTransaction,
): Promise<void> => {
  try {
    const userId = transaction.userId ?? getCurrentUserId();
    if (!userId) {
      throw new Error("No authenticated user. Cannot save transaction.");
    }

    await addDoc(collection(db, EXPENSES_COLLECTION), {
      id: transaction.id,
      userId,
      imageUrl: transaction.imageUrl ?? "",
      caption: transaction.caption,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      createdAt: Timestamp.fromDate(transaction.createdAt),
    });
    // Notify all listeners that transactions have changed
    transactionEventEmitter.emit();
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tất cả expenses từ Firestore, sắp xếp theo thời gian mới nhất
 */
export const getDatabaseTransactions = async (): Promise<
  DatabaseTransaction[]
> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      return [];
    }

    const expensesRef = collection(db, EXPENSES_COLLECTION);
    const q = query(expensesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const transactions: DatabaseTransaction[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (!data.createdAt) return;
      transactions.push({
        id: data.id,
        userId: data.userId,
        imageUrl: data.imageUrl || "", // Default to empty string if missing
        caption: data.caption,
        amount: data.amount,
        category: data.category,
        type: data.type || "spent", // Default to 'spent' for backward compatibility
        createdAt: data.createdAt.toDate(),
      });
    });

    // Sort newest first on client to avoid composite index requirement
    transactions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return transactions;
  } catch (error) {
    return [];
  }
};

/**
 * Convert DatabaseTransaction to Expense (for backward compatibility)
 */
const databaseTransactionToExpense = (tx: DatabaseTransaction): Expense => ({
  id: tx.id,
  imageUrl: tx.imageUrl ?? "",
  caption: tx.caption,
  amount: tx.amount,
  category: tx.category,
  type: tx.type,
  createdAt: tx.createdAt,
});

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
 * Find Firestore document id by transaction id (stored in document field "id")
 */
const getFirestoreDocIdByTransactionId = async (
  transactionId: string,
): Promise<string | null> => {
  if (!transactionId) return null;
  const expensesRef = collection(db, EXPENSES_COLLECTION);
  const q = query(expensesRef);
  const querySnapshot = await getDocs(q);
  let docId: string | null = null;
  const idStr = String(transactionId);
  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const docIdField = data?.id;
    if (docIdField != null && String(docIdField) === idStr) {
      docId = docSnapshot.id;
    }
  });
  return docId;
};

/**
 * Update an existing transaction in Firestore
 */
export const updateDatabaseTransaction = async (
  transaction: DatabaseTransaction,
): Promise<void> => {
  const docId = await getFirestoreDocIdByTransactionId(transaction.id);
  if (!docId) {
    throw new Error("Transaction not found");
  }
  await updateDoc(doc(db, EXPENSES_COLLECTION, docId), {
    caption: transaction.caption,
    amount: transaction.amount,
    category: transaction.category,
    type: transaction.type,
    createdAt: Timestamp.fromDate(transaction.createdAt),
    userId: transaction.userId ?? getCurrentUserId(),
    ...(transaction.imageUrl !== undefined && { imageUrl: transaction.imageUrl ?? "" }),
  });
  transactionEventEmitter.emit();
};

/**
 * Xóa expense từ Firestore
 */
export const deleteExpense = async (id: string): Promise<void> => {
  const expenseDocId = await getFirestoreDocIdByTransactionId(id);
  if (!expenseDocId) {
    throw new Error("Expense not found");
  }
  await deleteDoc(doc(db, EXPENSES_COLLECTION, expenseDocId));
  transactionEventEmitter.emit();
};

/**
 * Lấy tổng chi tiêu theo category
 */
export const getExpensesByCategory = async (
  category: ExpenseCategory,
): Promise<Expense[]> => {
  const expenses = await getExpenses();
  return expenses.filter((e) => e.category === category);
};

/**
 * Lấy tổng chi tiêu trong khoảng thời gian
 */
export const getExpensesInRange = async (
  startDate: Date,
  endDate: Date,
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
  endDate: Date,
): Promise<DatabaseTransaction[]> => {
  const dbTransactions = await getDatabaseTransactions();
  return dbTransactions.filter((t) =>
    isDateInRange(t.createdAt, startDate, endDate),
  );
};

/**
 * Tính tổng số tiền
 */
export const getTotalAmount = async (): Promise<number> => {
  const expenses = await getExpenses();
  return expenses.reduce((sum, e) => sum + e.amount, 0);
};

/**
 * Xóa tất cả expenses từ Firestore
 */
export const clearAllExpenses = async (): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      return;
    }

    const expensesRef = collection(db, EXPENSES_COLLECTION);
    const q = query(expensesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((docSnapshot) =>
      deleteDoc(doc(db, EXPENSES_COLLECTION, docSnapshot.id)),
    );

    await Promise.all(deletePromises);
  } catch (error) {
    throw error;
  }
};

// ============================================================================
// Functions for summary and history screens (using DatabaseTransaction directly)
// ============================================================================

/**
 * Get transactions by date range (returns DatabaseTransaction[])
 */
export const getTransactionsByDateRange = async (
  startDate: Date,
  endDate: Date,
): Promise<DatabaseTransaction[]> => {
  return await getDatabaseTransactionsInRange(startDate, endDate);
};

/**
 * Get raw summary data (for overview chart) - returns DatabaseTransaction[]
 */
export const getRawSummaryData = async (
  startDate: Date,
  endDate: Date,
): Promise<DatabaseTransaction[]> => {
  return await getTransactionsByDateRange(startDate, endDate);
};

/**
 * Get transactions by range (for summary screens) - returns DatabaseTransaction[]
 */
export const getTransactionsByRange = async (
  range: string,
  currentDate: Date,
): Promise<DatabaseTransaction[]> => {
  const { start, end } = getDateRange(range as RangeType, currentDate);
  const dbTransactions = await getDatabaseTransactions();

  return dbTransactions.filter((t) => {
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
 * Calculate saved (income) amount for a range
 */
export const getSavedAmount = async (
  range: string,
  currentDate: Date,
): Promise<number> => {
  const txs = await getTransactionsByRange(range, currentDate);
  // Use type field from DatabaseTransaction
  return txs
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

/**
 * Calculate saved (income) amount for a date range
 */
export const getSavedAmountByDateRange = async (
  startDate: Date,
  endDate: Date,
): Promise<number> => {
  const txs = await getTransactionsByDateRange(startDate, endDate);
  // Use type field from DatabaseTransaction
  return txs
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

/**
 * Calculate spent amount for a range
 */
export const getSpentAmount = async (
  range: string,
  currentDate: Date,
): Promise<number> => {
  const txs = await getTransactionsByRange(range, currentDate);
  // Use type field from DatabaseTransaction
  return txs
    .filter((t) => t.type === "spent")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

/**
 * Calculate spent amount for a date range
 */
export const getSpentAmountByDateRange = async (
  startDate: Date,
  endDate: Date,
): Promise<number> => {
  const txs = await getTransactionsByDateRange(startDate, endDate);
  // Use type field from DatabaseTransaction
  return txs
    .filter((t) => t.type === "spent")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

/**
 * Calculate total amount for a range (income - spent)
 */
export const getTotalAmountByRange = async (
  range: string,
  currentDate: Date,
): Promise<number> => {
  const txs = await getTransactionsByRange(range, currentDate);
  return txs.reduce((sum, t) => {
    // Income adds to total, spent subtracts from total
    return t.type === "income" ? sum + t.amount : sum - t.amount;
  }, 0);
};

/**
 * Calculate total amount for a date range (income - spent)
 */
export const getTotalAmountByDateRange = async (
  startDate: Date,
  endDate: Date,
): Promise<number> => {
  const txs = await getTransactionsByDateRange(startDate, endDate);
  return txs.reduce((sum, t) => {
    // Income adds to total, spent subtracts from total
    return t.type === "income" ? sum + t.amount : sum - t.amount;
  }, 0);
};

/**
 * Get income by category
 */
export const getIncomeByCategory = async (
  startDate: Date,
  endDate: Date,
): Promise<Record<string, number>> => {
  const txs = await getTransactionsByDateRange(startDate, endDate);
  // Use type field from DatabaseTransaction
  return txs
    .filter((t) => t.type === "income")
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
  endDate: Date,
): Promise<Record<string, number>> => {
  const txs = await getTransactionsByDateRange(startDate, endDate);
  // Use type field from DatabaseTransaction
  // Include transactions with type "spent" or undefined/null (default to spent for backward compatibility)
  return txs
    .filter((t) => !t.type || t.type === "spent")
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
