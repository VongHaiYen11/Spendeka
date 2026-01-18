import { SafeView } from '@/components/Themed';
import { useState } from 'react';
import AccountInfo from './components/accountInfo';
import HeaderSummary from './components/header';

type RangeType = 'day' | 'week' | 'month' | 'year' | 'all';

export default function Summary() {
  const [range, setRange] = useState<RangeType>('day');
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <SafeView>
      <HeaderSummary
        range={range}
        setRange={setRange}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />
      <AccountInfo period={range} savedAmount={0} spentAmount={0} />
    </SafeView>
  );
}
