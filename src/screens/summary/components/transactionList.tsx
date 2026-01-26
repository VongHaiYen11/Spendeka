import { Text, useThemeColor, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { getCategoryIcon, getTransactionsByDateRange, Transaction } from '@/server/fakeDBGetData';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Text as RNText, StyleSheet, TouchableOpacity } from 'react-native';

type Range = 'day' | 'week' | 'month' | 'year' | 'all';

interface TransactionListProps {
  startDate: Date;
  endDate: Date;
  range: Range;
  userId?: string;
  limit?: number;
}

// Format currency for display
// Spent (positive): show as -$amount in red
// Income (negative): show as +$amount in green
const formatTransactionAmount = (amount: number) => {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // Spent is positive, show with minus sign
  if (amount > 0) {
    return `-$${formatted}`;
  }
  // Income is negative, show with plus sign
  return `+$${formatted}`;
};

const TransactionItem: React.FC<{
  transaction: Transaction;
  tintColor: string;
  isDark: boolean;
  isLast?: boolean;
}> = ({ transaction, tintColor, isDark, isLast = false }) => {
  const isIncome = transaction.amount < 0;
  const iconColor = isIncome ? '#4CAF50' : '#F44336'; // Green for income, red for spent
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.transactionItem, isLast && styles.lastItem]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Text style={styles.icon}>{getCategoryIcon(transaction.category)}</Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={[styles.transactionName, { color: textColor }]}>
          {transaction.note || transaction.category}
        </Text>
        <Text style={[styles.transactionMeta, { color: secondaryTextColor }]}>
          {transaction.category} — {format(new Date(transaction.date), 'HH:mm')}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: isIncome ? '#4CAF50' : '#F44336' },
        ]}
      >
        {formatTransactionAmount(transaction.amount)}
      </Text>
    </View>
  );
};

const TransactionList: React.FC<TransactionListProps> = ({
  startDate,
  endDate,
  userId = 'user1',
  limit = 5,
}) => {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const isDark = backgroundColor === Colors.dark.background;

  const themeColors = useMemo(
    () => ({
      chartText: isDark ? '#9ca3af' : Colors.general.gray600,
    }),
    [isDark]
  );

  const transactions = useMemo(() => {
    const allTransactions = getTransactionsByDateRange(userId, startDate, endDate);
    // Sort by date descending (newest first)
    return allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [userId, startDate, endDate, limit]);

  const allTransactionsCount = useMemo(() => {
    return getTransactionsByDateRange(userId, startDate, endDate).length;
  }, [userId, startDate, endDate]);

  const hasMore = allTransactionsCount > limit;

  const handleSeeMore = () => {
    // Navigate to history screen with date range params
    router.push({
      pathname: '/history',
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Transactions</Text>
        </View>
        <View style={styles.emptyState}>
          <RNText style={[styles.emptyText, { color: themeColors.chartText }]}>
            No data
          </RNText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Transactions</Text>
        {hasMore && (
          <TouchableOpacity onPress={handleSeeMore}>
            <Text style={[styles.seeMoreText, { color: tintColor }]}>See More</Text>
          </TouchableOpacity>
        )}
      </View>
      <>
        {transactions.map((transaction, index) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            tintColor={tintColor}
            isDark={isDark}
            isLast={index === transactions.length - 1 && !hasMore}
          />
        ))}
        {hasMore && (
          <TouchableOpacity
            style={styles.seeMoreButton}
            onPress={handleSeeMore}
          >
            <Text style={[styles.seeMoreButtonText, { color: tintColor }]}>
              See All Transactions ({allTransactionsCount})
            </Text>
          </TouchableOpacity>
        )}
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 13,
    opacity: 0.7,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  seeMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  seeMoreButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
});

export default TransactionList;
