import { SafeView, Text, useThemeColor, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useTransactions } from '@/contexts/TransactionContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Expense } from '@/models/Expense';
import {
  getSavedAmountByDateRange,
  getSpentAmountByDateRange,
} from '@/services/TransactionService';
import { formatDollar } from '@/utils/formatCurrency';
import { getDateRange } from '@/utils/getDateRange';
import { isSameDay } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StatusBar, StyleSheet, ScrollView } from 'react-native';
import Overview from '@/screens/summary/components/overview';
import ChartCategories from '@/screens/summary/components/chartCategories';
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
  const [totalIncomeToday, setTotalIncomeToday] = useState(0);
  const [totalSpentToday, setTotalSpentToday] = useState(0);
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].text;
  const textColor = useThemeColor({}, 'text');
  const todayCardBackground = colorScheme === 'dark' ? '#1a1a1a' : '#ffffff';

  // Range for embedded Summary charts on Home (fixed to "day")
  const homeRange: 'day' = 'day';
  const homeCurrentDate = new Date();
  const { start: homeStart, end: homeEnd } = getDateRange(homeRange, homeCurrentDate);
  const homeStartDate = homeStart || new Date();
  const homeEndDate = homeEnd || new Date();

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

  const handleGoHistory = () => {
    router.push('/history' as import('expo-router').Href);
  };

  const openTextModal = () => setTextModalVisible(true);
  const closeTextModal = () => {
    setTextModalVisible(false);
    setTextInputValue('');
  };

  const handleOpenCameraFromToday = () => {
    router.push('/camera' as import('expo-router').Href);
  };

  return (
    <SafeView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <HomeHeader userName={userName} iconColor={iconColor} />

      <HomeToolbar
        iconColor={iconColor}
        onPressHistory={handleGoHistory}
        onPressText={openTextModal}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TodaySummaryCard
          colorScheme={colorScheme}
          textColor={textColor}
          backgroundColor={todayCardBackground}
          todayExpenses={todayExpenses}
          totalIncomeToday={totalIncomeToday}
          totalSpentToday={totalSpentToday}
          onOpenCamera={handleOpenCameraFromToday}
          formatAmount={formatAmount}
        />

        {/* Summary-style sections: Overview & Categories (same layout as Summary tab) */}
        <Overview
          startDate={homeStartDate}
          endDate={homeEndDate}
          range={homeRange}
        />
        <ChartCategories
          startDate={homeStartDate}
          endDate={homeEndDate}
          range={homeRange}
        />
      </ScrollView>

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});

