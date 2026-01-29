import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '@/config/cloudinaryConfig';
import { createExpense, Expense, ExpenseCategory } from '@/models/Expense';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSES_STORAGE_KEY = '@spendeka_expenses';

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
 * Lưu expense vào AsyncStorage
 */
const saveExpense = async (expense: Expense): Promise<void> => {
  try {
    const existingExpenses = await getExpenses();
    const updatedExpenses = [expense, ...existingExpenses];
    await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
  } catch (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
};

/**
 * Lấy tất cả expenses, sắp xếp theo thời gian mới nhất
 */
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const expensesJson = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!expensesJson) {
      return [];
    }

    const expenses: Expense[] = JSON.parse(expensesJson);
    return expenses
      .map((e) => ({
        ...e,
        createdAt: new Date(e.createdAt),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
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
    const existingExpenses = await getExpenses();
    const updatedExpenses = existingExpenses.filter((e) => e.id !== id);
    await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
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
  const expenses = await getExpenses();
  return expenses.filter(
    (e) => e.createdAt >= startDate && e.createdAt <= endDate
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
 * Xóa tất cả expenses
 */
export const clearAllExpenses = async (): Promise<void> => {
  await AsyncStorage.removeItem(EXPENSES_STORAGE_KEY);
};
