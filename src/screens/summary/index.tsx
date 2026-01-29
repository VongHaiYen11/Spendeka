import { SafeView } from '@/components/Themed';
import { useTransactions } from '@/contexts/TransactionContext';
import { getDateRange } from '@/utils/getDateRange';
import {
  calculateSavedAmount,
  calculateSpentAmount,
  calculateTotalAmount,
  filterTransactionsByDateRange,
  filterTransactionsByRange,
} from '@/utils/transactionHelpers';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import AccountInfo from './components/accountInfo';
import ChartCategories from './components/chartCategories';
import HeaderSummary from './components/header';
import Overview from './components/overview';
import TransactionList from './components/transactionList';

type RangeType = 'day' | 'week' | 'month' | 'year' | 'all';

export default function Summary() {
  const [range, setRange] = useState<RangeType>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { transactions } = useTransactions();

  const { start, end } = getDateRange(range, currentDate);
  // For 'all' range, use a very old date as start if undefined
  const startDate = start || new Date(2000, 0, 1);
  const endDate = end || new Date();

  // Filter transactions based on current range
  const filteredTransactions = useMemo(() => {
    if (range === 'all') {
      return filterTransactionsByDateRange(transactions, startDate, endDate);
    }
    return filterTransactionsByRange(transactions, range, currentDate);
  }, [transactions, range, currentDate, startDate, endDate]);

  // Calculate amounts from filtered transactions
  const savedAmount = useMemo(
    () => calculateSavedAmount(filteredTransactions),
    [filteredTransactions],
  );

  const spentAmount = useMemo(
    () => calculateSpentAmount(filteredTransactions),
    [filteredTransactions],
  );

  const totalAmount = useMemo(
    () => calculateTotalAmount(filteredTransactions),
    [filteredTransactions],
  );

  return (
    <SafeView>
      <HeaderSummary
        range={range}
        setRange={setRange}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <AccountInfo
          period={range}
          savedAmount={savedAmount}
          spentAmount={spentAmount}
          totalAmount={range === 'all' ? totalAmount : undefined}
        />
        <Overview
          startDate={startDate}
          endDate={endDate}
          range={range}
        />
        <ChartCategories
          startDate={startDate}
          endDate={endDate}
          range={range}
        />
        <TransactionList
          startDate={startDate}
          endDate={endDate}
          range={range}
        />
      </ScrollView>
    </SafeView>
  );
}