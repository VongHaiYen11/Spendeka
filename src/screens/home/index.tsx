import { SafeView, Text, useThemeColor, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useTransactions } from '@/contexts/TransactionContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Expense } from '@/models/Expense';
import { ExpenseDetailScreen } from '@/screens/camera';
import {
  getSavedAmountByDateRange,
  getSpentAmountByDateRange,
} from '@/services/TransactionService';
import { formatDollar } from '@/utils/formatCurrency';
import { isSameDay } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import HomeHeader from './HomeHeader';
import HomeToolbar from './HomeToolbar';
import TextToTransactionModal from './TextToTransactionModal';
import TodaySummaryCard from './TodaySummaryCard';

export default function Home() {
  const router = useRouter();
  const { transactions, reloadTransactions } = useTransactions();
  const [userName] = useState('User'); // TODO: Get from user profile/authentication
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [textInputValue, setTextInputValue] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [totalIncomeToday, setTotalIncomeToday] = useState(0);
  const [totalSpentToday, setTotalSpentToday] = useState(0);
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].text;
  const textColor = useThemeColor({}, 'text');
  const todayCardBackground = colorScheme === 'dark' ? '#1a1a1a' : '#ffffff';

  const expenses = useMemo<Expense[]>(() => {
    return transactions
      .map((tx) => ({
        id: tx.id,
        imageUrl: tx.imageUrl ?? '',
        caption: tx.caption,
        amount: tx.amount,
        category: tx.category,
        type: tx.type,
        createdAt: tx.createdAt,
      }))
      .filter(
        (expense) =>
          expense.type !== 'income' &&
          expense.imageUrl &&
          expense.imageUrl.trim() !== '',
      );
  }, [transactions]);

  const todayExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter((e) => isSameDay(e.createdAt, now));
  }, [expenses]);

  // Use TransactionService helpers to calculate today's income/spent totals
  useEffect(() => {
    const fetchTodayTotals = async () => {
      try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const [income, spent] = await Promise.all([
          getSavedAmountByDateRange(start, end),
          getSpentAmountByDateRange(start, end),
        ]);

        setTotalIncomeToday(income);
        setTotalSpentToday(spent);
      } catch (error) {
        // Silent fail; keep previous values
      }
    };

    fetchTodayTotals();
  }, [transactions]);

  const formatAmount = (value: number) => formatDollar(value);

  const handleDump = () => {
    router.push('/add-transaction' as import('expo-router').Href);
  };

  const handleGoHistory = () => {
    router.push('/history' as import('expo-router').Href);
  };

  const openTextModal = () => setTextModalVisible(true);
  const closeTextModal = () => {
    setTextModalVisible(false);
    setTextInputValue('');
  };

  const handleOpenTodayExpenseDetail = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  const handleCloseExpenseDetail = () => {
    setSelectedExpense(null);
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert(
      'Delete expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { deleteExpense } = await import('@/services/TransactionService');
              await deleteExpense(expenseId);
              await reloadTransactions();
              setSelectedExpense(null);
            } catch (error) {
              Alert.alert('Error', 'Could not delete expense');
            }
          },
        },
      ],
    );
  };

  if (selectedExpense) {
    return (
      <ExpenseDetailScreen
        expenses={expenses}
        initialExpenseId={selectedExpense.id}
        onClose={handleCloseExpenseDetail}
        onDelete={handleDeleteExpense}
      />
    );
  }

  return (
    <SafeView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <HomeHeader userName={userName} iconColor={iconColor} />

      <HomeToolbar
        iconColor={iconColor}
        onPressHistory={handleGoHistory}
        onPressText={openTextModal}
      />

      <TodaySummaryCard
        colorScheme={colorScheme}
        textColor={textColor}
        backgroundColor={todayCardBackground}
        todayExpenses={todayExpenses}
        totalIncomeToday={totalIncomeToday}
        totalSpentToday={totalSpentToday}
        onOpenExpense={handleOpenTodayExpenseDetail}
        formatAmount={formatAmount}
      />
      
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Home</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <TouchableOpacity style={styles.dumpButton} onPress={handleDump}>
          <Text style={[styles.dumpButtonText, { color: iconColor }]}>Dump</Text>
        </TouchableOpacity>
      </View>

      {/* Text to Transaction Modal */}
      <TextToTransactionModal
        visible={textModalVisible}
        value={textInputValue}
        onChangeText={setTextInputValue}
        onClose={closeTextModal}
      />
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  dumpButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(128,128,128,0.3)',
  },
  dumpButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

