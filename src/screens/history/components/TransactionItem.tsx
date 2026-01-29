import { Text, useThemeColor, View } from "@/components/Themed";
import { DatabaseTransaction, getCategoryIconConfig } from "@/types/expense";
import { formatDollar } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import { StyleSheet } from "react-native";

interface TransactionItemProps {
  transaction: DatabaseTransaction;
}

// Format currency for display
// Income: green with +$amount
// Spent: red with -$amount
const formatCurrency = (amount: number, type: "income" | "spent") => {
  const formatted = formatDollar(Math.abs(amount));
  if (type === "income") {
    return formatted.replace(/^\$/, "+$");
  }
  // Spent show with minus sign
  return formatted.replace(/^\$/, "-$");
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isIncome = transaction.type === "income";
  const textColor = useThemeColor({}, "text");
  const secondaryTextColor = useThemeColor({}, "text");
  const categoryIcon = getCategoryIconConfig(transaction.category);

  return (
    <View style={styles.transactionItem}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: categoryIcon.color + "20" },
        ]}
      >
        <Ionicons
          name={categoryIcon.icon as any}
          size={20}
          color={categoryIcon.color}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={[styles.transactionName, { color: textColor }]}>
          {transaction.caption || transaction.category}
        </Text>
        <Text style={[styles.transactionMeta, { color: secondaryTextColor }]}>
          {transaction.category} — {format(transaction.createdAt, "HH:mm")}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: isIncome ? "#4CAF50" : "#F44336" },
        ]}
      >
        {formatCurrency(transaction.amount, transaction.type)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 13,
    opacity: 0.7,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default TransactionItem;
