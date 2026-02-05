import { SafeView, Text, useThemeColor, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTransactions } from '@/contexts/TransactionContext';
import { Expense } from '@/models/Expense';
import { ExpenseDetailScreen } from '@/screens/camera';
import { isSameDay } from 'date-fns';
import TextToTransactionModal from './TextToTransactionModal';
import SpeechToTransactionModal from './SpeechToTransactionModal';
import HomeHeader from './HomeHeader';
import HomeToolbar from './HomeToolbar';
import TodaySummaryCard from './TodaySummaryCard';
import { ParsedTransactionFromText } from '@/types/textToTransaction';
import type { TransactionCategory } from '@/types/transaction';

export default function Home() {
  const router = useRouter();
  const { transactions, reloadTransactions } = useTransactions();
  const [userName] = useState('User'); // TODO: Get from user profile/authentication
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [textInputValue, setTextInputValue] = useState('');
  const [speechModalVisible, setSpeechModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
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

  const todayTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => isSameDay(t.createdAt, now));
  }, [transactions]);

  const totalIncomeToday = useMemo(
    () =>
      todayTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [todayTransactions],
  );

  const totalSpentToday = useMemo(
    () =>
      todayTransactions
        .filter((t) => t.type === 'spent' || !t.type)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [todayTransactions],
  );

  const formatAmount = (value: number) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 0 });

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

  const openSpeechModal = () => setSpeechModalVisible(true);
  const closeSpeechModal = () => {
    setSpeechModalVisible(false);
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

  const handleParsedTransaction = (parsed: ParsedTransactionFromText) => {
    // Map parsed Gemini result to add-transaction route params.
    // Let the AddTransaction screen validate and provide defaults for any missing fields.
    const params: Record<string, string> = {
      caption: parsed.caption ?? '',
      amount: String(parsed.amount ?? ''),
      type: parsed.type ?? 'spent',
      category: parsed.category ?? '',
      createdAt: parsed.createdAt ?? '',
    };

    router.push({
      pathname: '/add-transaction',
      params,
    } as any);
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
        onPressVoice={openSpeechModal}
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
        onParsed={handleParsedTransaction}
      />

      {/* Speech to Transaction Modal */}
      <SpeechToTransactionModal
        visible={speechModalVisible}
        onClose={closeSpeechModal}
        onParsed={handleParsedTransaction}
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

