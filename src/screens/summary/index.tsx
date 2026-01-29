import { SafeView } from '@/components/Themed';
import {
  getSavedAmount,
  getSavedAmountByDateRange,
  getSpentAmount,
  getSpentAmountByDateRange,
  getTotalAmountByDateRange,
  getTotalAmountByRange,
} from '@/services/ExpenseService';
import { getDateRange } from '@/utils/getDateRange';
import { useEffect, useState } from 'react';
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

  const { start, end } = getDateRange(range, currentDate);
  // For 'all' range, use a very old date as start if undefined
  const startDate = start || new Date(2000, 0, 1);
  const endDate = end || new Date();

  // Calculate amounts based on range (using async functions)
  const [savedAmount, setSavedAmount] = useState(0);
  const [spentAmount, setSpentAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const loadAmounts = async () => {
      const saved =
        range === 'all'
          ? await getSavedAmountByDateRange(startDate, endDate)
          : await getSavedAmount(range, currentDate);

      const spent =
        range === 'all'
          ? await getSpentAmountByDateRange(startDate, endDate)
          : await getSpentAmount(range, currentDate);

      const total =
        range === 'all'
          ? await getTotalAmountByDateRange(startDate, endDate)
          : await getTotalAmountByRange(range, currentDate);

      setSavedAmount(saved);
      setSpentAmount(spent);
      setTotalAmount(total);
    };

    loadAmounts();
  }, [range, currentDate, startDate, endDate]);

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