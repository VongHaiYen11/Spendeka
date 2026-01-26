import { SafeView } from '@/components/Themed';
import {
  getSavedAmount,
  getSavedAmountByDateRange,
  getSpentAmount,
  getSpentAmountByDateRange,
  getTotalAmount,
  getTotalAmountByDateRange,
} from '@/server/fakeDBGetData';
import { getDateRange } from '@/utils/getDateRange';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import AccountInfo from './components/accountInfo';
import ChartCategories from './components/chartCategories';
import HeaderSummary from './components/header';
import BarChart from './components/overview';

type RangeType = 'day' | 'week' | 'month' | 'year' | 'all';

const USER_ID = 'user1';

export default function Summary() {
  const [range, setRange] = useState<RangeType>('day');
  const [currentDate, setCurrentDate] = useState(new Date());

  const { start, end } = getDateRange(range, currentDate);
  // For 'all' range, use a very old date as start if undefined
  const startDate = start || new Date(2000, 0, 1);
  const endDate = end || new Date();

  // Calculate amounts based on range
  const savedAmount = useMemo(() => {
    if (range === 'all') {
      return getSavedAmountByDateRange(USER_ID, startDate, endDate);
    }
    return getSavedAmount(USER_ID, range, currentDate);
  }, [range, currentDate, startDate, endDate]);

  const spentAmount = useMemo(() => {
    if (range === 'all') {
      return getSpentAmountByDateRange(USER_ID, startDate, endDate);
    }
    return getSpentAmount(USER_ID, range, currentDate);
  }, [range, currentDate, startDate, endDate]);

  const totalAmount = useMemo(() => {
    if (range === 'all') {
      return getTotalAmountByDateRange(USER_ID, startDate, endDate);
    }
    return getTotalAmount(USER_ID, range, currentDate);
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
        <BarChart
          startDate={startDate}
          endDate={endDate}
          range={range}
        />
        <ChartCategories
          startDate={startDate}
          endDate={endDate}
          range={range}
        />
      </ScrollView>
    </SafeView>
  );
}
