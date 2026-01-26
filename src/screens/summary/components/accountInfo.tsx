import { formatDollar } from '@/utils/formatCurrency';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

/* =======================
   Types
======================= */
export type Period = 'day' | 'week' | 'month' | 'year' | 'all';
type CardType = 'saved' | 'spent' | 'all';

interface FinanceCardProps {
  label: string;
  amount: number;
  type: CardType;
  period: Period;
  colors: [string, string, ...string[]];
}

interface AccountInfoProps {
  period: Period;
  savedAmount: number;
  spentAmount: number;
  totalAmount?: number; // chỉ dùng khi period === 'all'
}


/* =======================
   Footer text map
======================= */
const footerTextMap: Record<CardType, Record<Period, string>> = {
  saved: {
    day: 'Today',
    week: 'This week',
    month: 'This month',
    year: 'This year',
    all: 'All time',
  },
  spent: {
    day: 'Today',
    week: 'This week',
    month: 'This month',
    year: 'This year',
    all: 'All time',
  },
  all: {
    day: '—',
    week: '—',
    month: '—',
    year: '—',
    all: 'All time',
  },
};

const getFooterText = (type: CardType, period: Period) =>
  footerTextMap[type][period];

/* =======================
   FinanceCard
======================= */
const FinanceCard: React.FC<FinanceCardProps> = ({
  label,
  amount,
  type,
  period,
  colors,
}) => {
  const displayAmount = formatDollar(amount);

  return (
    <View className="flex-1">
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderRadius: 20,
        }}
      >
        {/* Header */}
        <Text className="text-white/80 text-lg font-medium">
          {label}
        </Text>

        {/* Amount */}
        <Text className="text-white text-2xl font-bold mt-2">
          {displayAmount}
        </Text>

        {/* Footer */}
        <Text className="text-white/70 text-[12px] mt-2 tracking-tight">
          {getFooterText(type, period)}
        </Text>
      </LinearGradient>
    </View>
  );
};

const AllSummary: React.FC<{ amount: number }> = ({ amount }) => {
    return (
      <LinearGradient
        colors={['#6C8CF5', '#4F6CD9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 18,
          borderRadius: 20,
        }}
      >
        <Text className="text-white/80 text-lg font-medium">
          All time balance
        </Text>
  
        <Text className="text-white text-3xl font-bold mt-2">
          {formatDollar(amount)}
        </Text>
  
        <Text className="text-white/70 text-[12px] mt-2 tracking-tight">
            Up to this point
        </Text>
      </LinearGradient>
    );
  };
  

/* =======================
   AccountInfo
======================= */
const AccountInfo: React.FC<AccountInfoProps> = ({
    period,
    savedAmount,
    spentAmount,
    totalAmount,
  }) => {
    return (
      <View className="w-full px-4 flex-col gap-y-3">
        {/* ===== All-time card (top) ===== */}
        {period === 'all' && (
            <AllSummary amount={totalAmount ?? 0} />
        )}

        {/* ===== Saved / Spent row ===== */}
        <View className="flex-row gap-x-3">
          <FinanceCard
            label="Saved"
            amount={savedAmount}
            type="saved"
            period={period}
            colors={['#72E394', '#49B68D']}
          />
  
          <FinanceCard
            label="Spent"
            amount={spentAmount}
            type="spent"
            period={period}
            colors={['#E56B89', '#C84E6D']}
          />
        </View>
      </View>
    );
  };
  

export default AccountInfo;
