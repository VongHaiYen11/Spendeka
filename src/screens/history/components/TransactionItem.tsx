import { Text, useThemeColor, View } from '@/components/Themed';
import { getCategoryIcon, Transaction } from '@/server/fakeDBGetData';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet } from 'react-native';

interface TransactionItemProps {
  transaction: Transaction;
}

// Format currency for display
// Income (positive amount): green with +$amount (no minus)
// Spent (negative amount): red with -$amount
const formatCurrency = (amount: number) => {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // Income is positive amount, show with plus sign (green)
  if (amount > 0) {
    return `+$${formatted}`;
  }
  // Spent is negative amount, show with minus sign (red)
  return `-$${formatted}`;
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isIncome = transaction.amount > 0;
  const iconColor = isIncome ? '#4CAF50' : '#F44336'; // Green for income, red for spent
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'text');

  return (
    <View style={styles.transactionItem}>
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
        {formatCurrency(transaction.amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
});

export default TransactionItem;
