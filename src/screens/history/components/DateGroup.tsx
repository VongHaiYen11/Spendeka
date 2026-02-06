import { Text, useThemeColor, View } from "@/components/Themed";
import { calculateNetTotal, DatabaseTransaction } from "@/types/transaction";
import { formatDollar } from "@/utils/formatCurrency";
import React from "react";
import { StyleSheet } from "react-native";
import TransactionItem from "./TransactionItem";

interface DateGroupProps {
  dateKey: string;
  transactions: DatabaseTransaction[];
}

const formatTotalWithSign = (total: number) => {
  if (total >= 0) return `+${formatDollar(total)}`;
  return formatDollar(total); // already includes "-"
};

const DateGroup: React.FC<DateGroupProps> = ({ dateKey, transactions }) => {
  const textColor = useThemeColor({}, "text");
  const total = calculateNetTotal(transactions);
  const totalColor = total > 0 ? "#4CAF50" : total < 0 ? "#F44336" : textColor;

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
          <Text style={[styles.totalLabel, { color: totalColor }]}>
            Total: {formatTotalWithSign(total)}
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
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default DateGroup;
