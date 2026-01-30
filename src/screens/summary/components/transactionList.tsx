import { Text, useThemeColor, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useTransactions } from "@/contexts/TransactionContext";
import { DatabaseTransaction, getCategoryIconConfig } from "@/types/transaction";
import { filterTransactionsByDateRange } from "@/utils/transactionHelpers";
import { formatDollar } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Text as RNText, StyleSheet, TouchableOpacity } from "react-native";

type Range = "day" | "week" | "month" | "year" | "all";

interface TransactionListProps {
  startDate: Date;
  endDate: Date;
  range: Range;
  limit?: number;
}

// Format currency for display
// Spent: show as -$amount in red
// Income: show as +$amount in green
const formatTransactionAmount = (amount: number, type: "income" | "spent") => {
  const formatted = formatDollar(Math.abs(amount));
  if (type === "income") {
    return formatted.replace(/^\$/, "+$");
  }
  // Spent show with minus sign
  return formatted.replace(/^\$/, "-$");
};

const TransactionItem: React.FC<{
  transaction: DatabaseTransaction;
  tintColor: string;
  isDark: boolean;
  isLast?: boolean;
}> = ({ transaction, tintColor, isDark, isLast = false }) => {
  const isIncome = transaction.type === "income";
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryTextColor = useThemeColor({}, "text");
  const categoryIcon = getCategoryIconConfig(transaction.category);

  return (
    <View style={[styles.transactionItem, isLast && styles.lastItem]}>
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
        {formatTransactionAmount(transaction.amount, transaction.type)}
      </Text>
    </View>
  );
};

const TransactionList: React.FC<TransactionListProps> = ({
  startDate,
  endDate,
  limit = 5,
}) => {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const isDark = backgroundColor === Colors.dark.background;

  const themeColors = useMemo(
    () => ({
      chartText: isDark ? "#9ca3af" : Colors.general.gray600,
    }),
    [isDark],
  );

  // Get transactions from global state
  const { transactions: allTransactions } = useTransactions();

  // Filter and sort transactions
  const { transactions, allTransactionsCount } = useMemo(() => {
    const filtered = filterTransactionsByDateRange(
      allTransactions,
      startDate,
      endDate,
    );
    // Sort by date descending (newest first)
    const sorted = filtered
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return {
      transactions: sorted,
      allTransactionsCount: filtered.length,
    };
  }, [allTransactions, startDate, endDate, limit]);

  const hasMore = allTransactionsCount > limit;

  const handleSeeMore = () => {
    // Navigate to history screen with date range params
    router.push({
      pathname: "/history",
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
        <TouchableOpacity onPress={handleSeeMore}>
          <Text style={[styles.seeMoreText, { color: tintColor }]}>
            See More
          </Text>
        </TouchableOpacity>
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
              See More
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
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
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
  },
  seeMoreButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  seeMoreButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
});

export default TransactionList;
