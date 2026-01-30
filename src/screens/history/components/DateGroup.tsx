import { Text, useThemeColor, View } from "@/components/Themed";
import { DatabaseTransaction } from "@/types/expense";
import { formatDollar } from "@/utils/formatCurrency";
import React from "react";
import { StyleSheet } from "react-native";
import TransactionItem from "./TransactionItem";

interface DateGroupProps {
  dateKey: string;
  transactions: DatabaseTransaction[];
}

// Calculate total for a date group (sum of both spent and income)
const calculateGroupTotal = (transactions: DatabaseTransaction[]) => {
  // Sum absolute values of all transactions (both spent and income)
  return transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

const DateGroup: React.FC<DateGroupProps> = ({ dateKey, transactions }) => {
  const textColor = useThemeColor({}, "text");
  const total = calculateGroupTotal(transactions);

  return (
    <View style={styles.dateGroup}>
      <View style={styles.dateHeader}>
        <Text style={[styles.dateLabel, { color: textColor }]}>{dateKey}</Text>
      </View>
      <>
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
        <View style={styles.groupTotal}>
          <Text style={[styles.totalLabel, { color: textColor }]}>
            Total: {formatDollar(total)}
          </Text>
        </View>
      </>
    </View>
  );
};

const styles = StyleSheet.create({
  dateGroup: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  dateHeader: {
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    opacity: 0.7,
  },
  groupTotal: {
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default DateGroup;
