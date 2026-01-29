import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '@/config/cloudinaryConfig';
import { db } from '@/config/firebaseConfig';
import { createExpense, Expense, ExpenseCategory } from '@/models/Expense';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const EXPENSES_COLLECTION = 'expenses';
const EXPENSES_STORAGE_KEY = '@spendeka_expenses'; // Key cũ từ AsyncStorage

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
 * Lưu expense vào Firestore
 */
const saveExpense = async (expense: Expense): Promise<void> => {
  try {
    console.log('📤 Saving expense to Firestore:', {
      id: expense.id,
      caption: expense.caption,
      amount: expense.amount,
      category: expense.category,
    });
    
    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
      id: expense.id,
      imageUrl: expense.imageUrl,
      caption: expense.caption,
      amount: expense.amount,
      category: expense.category,
      createdAt: Timestamp.fromDate(expense.createdAt),
    });
    
    console.log('✅ Expense saved to Firestore successfully! Document ID:', docRef.id);
  } catch (error) {
    console.error('❌ Error saving expense to Firestore:', error);
    throw error;
  }
};

/**
 * Lấy tất cả expenses từ Firestore, sắp xếp theo thời gian mới nhất
 */
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    console.log('📥 Loading expenses from Firestore...');
    const expensesRef = collection(db, EXPENSES_COLLECTION);
    const q = query(expensesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const expenses: Expense[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      expenses.push({
        id: data.id,
        imageUrl: data.imageUrl,
        caption: data.caption,
        amount: data.amount,
        category: data.category,
        createdAt: data.createdAt.toDate(),
      });
    });

    console.log(`✅ Loaded ${expenses.length} expenses from Firestore`);
    return expenses;
  } catch (error) {
    console.error('❌ Error loading expenses from Firestore:', error);
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
 * Xóa expense từ Firestore
 */
export const deleteExpense = async (id: string): Promise<void> => {
  try {
    const expensesRef = collection(db, EXPENSES_COLLECTION);
    const q = query(expensesRef);
    const querySnapshot = await getDocs(q);

    let expenseDocId: string | null = null;
    querySnapshot.forEach((docSnapshot) => {
      if (docSnapshot.data().id === id) {
        expenseDocId = docSnapshot.id;
      }
    });

    if (expenseDocId) {
      await deleteDoc(doc(db, EXPENSES_COLLECTION, expenseDocId));
    } else {
      throw new Error('Expense not found');
    }
  } catch (error) {
    console.error('Error deleting expense from Firestore:', error);
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
 * Xóa tất cả expenses từ Firestore
 */
export const clearAllExpenses = async (): Promise<void> => {
  try {
    const expensesRef = collection(db, EXPENSES_COLLECTION);
    const querySnapshot = await getDocs(expensesRef);

    const deletePromises = querySnapshot.docs.map((docSnapshot) =>
      deleteDoc(doc(db, EXPENSES_COLLECTION, docSnapshot.id))
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error clearing all expenses from Firestore:', error);
    throw error;
  }
};

/**
 * Migrate dữ liệu cũ từ AsyncStorage sang Firestore
 * Chỉ cần gọi một lần sau khi chuyển sang Firestore
 */
export const migrateOldExpensesToFirestore = async (): Promise<number> => {
  try {
    // Lấy dữ liệu cũ từ AsyncStorage
    const expensesJson = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!expensesJson) {
      console.log('No old expenses found in AsyncStorage');
      return 0;
    }

    const oldExpenses: Expense[] = JSON.parse(expensesJson).map((e: any) => ({
      ...e,
      createdAt: new Date(e.createdAt),
    }));

    // Lấy danh sách expenses đã có trong Firestore để tránh duplicate
    const existingExpenses = await getExpenses();
    const existingIds = new Set(existingExpenses.map((e) => e.id));

    // Chỉ migrate những expense chưa có trong Firestore
    const expensesToMigrate = oldExpenses.filter((e) => !existingIds.has(e.id));

    if (expensesToMigrate.length === 0) {
      console.log('All expenses already migrated');
      return 0;
    }

    // Upload từng expense vào Firestore
    const migrationPromises = expensesToMigrate.map((expense) =>
      addDoc(collection(db, EXPENSES_COLLECTION), {
        id: expense.id,
        imageUrl: expense.imageUrl,
        caption: expense.caption,
        amount: expense.amount,
        category: expense.category,
        createdAt: Timestamp.fromDate(expense.createdAt),
      })
    );

    await Promise.all(migrationPromises);

    console.log(`Migrated ${expensesToMigrate.length} expenses to Firestore`);

    // Xóa dữ liệu cũ từ AsyncStorage sau khi migrate thành công (optional)
    // await AsyncStorage.removeItem(EXPENSES_STORAGE_KEY);

    return expensesToMigrate.length;
  } catch (error) {
    console.error('Error migrating expenses to Firestore:', error);
    throw error;
  }
};
