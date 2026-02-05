import { SafeView, Text, useThemeColor, View } from "@/components/Themed";
import { useTransactions } from "@/contexts/TransactionContext";
import {
  EXPENSE_CATEGORIES_EN,
  INCOME_CATEGORIES_EN,
} from "@/models/Expense";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DateGroup from "./components/DateGroup";
import FilterButton from "./components/FilterButton";
import FilterModal, { FilterState } from "./components/FilterModal";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import { format, parseISO } from "date-fns";
import {
  filterTransactions,
  groupTransactionsByDay,
  groupTransactionsByMonth,
  groupTransactionsByYear,
  sortGroupKeys,
} from "./utils/transactionHelpers";

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const [filters, setFilters] = useState<FilterState>({
    transactionType: "all",
    categories: [],
    minAmount: "",
    maxAmount: "",
    startDate: null,
    endDate: null,
    groupBy: "month",
  });

  const {
    transactions: allTransactions,
    isLoading,
    refreshTransactions,
  } = useTransactions();

  // Refresh transactions when user navigates to this screen (e.g. from Home toolbar)
  useFocusEffect(
    useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions])
  );

  const filteredTransactions = useMemo(() => {
    return filterTransactions(allTransactions, searchQuery, {
      transactionType: filters.transactionType,
      categories: filters.categories,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  }, [allTransactions, searchQuery, filters]);

  const groupedTransactions = useMemo(() => {
    if (filters.groupBy === "year") {
      return groupTransactionsByYear(filteredTransactions);
    }
    if (filters.groupBy === "day") {
      return groupTransactionsByDay(filteredTransactions);
    }
    return groupTransactionsByMonth(filteredTransactions);
  }, [filteredTransactions, filters.groupBy]);

  const sortedGroupKeys = useMemo(() => {
    return sortGroupKeys(Object.keys(groupedTransactions));
  }, [groupedTransactions]);

  const expenseCategoryOptions = useMemo(
    () =>
      EXPENSE_CATEGORIES_EN.map((c) => ({ value: c.value, label: c.label })),
    [],
  );
  const incomeCategoryOptions = useMemo(
    () =>
      INCOME_CATEGORIES_EN.map((c) => ({ value: c.value, label: c.label })),
    [],
  );

  return (
    <SafeView style={styles.container}>
      <Header />

      {/* Search and Filter Bar */}
      <View style={[styles.searchContainer, { backgroundColor }]}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <FilterButton onPress={() => setFilterModalVisible(true)} />
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        initialFilters={filters}
        expenseCategoryOptions={expenseCategoryOptions}
        incomeCategoryOptions={incomeCategoryOptions}
        onApply={(newFilters) => {
          setFilters(newFilters);
        }}
      />

      {/* Transaction List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={textColor} />
            <Text style={[styles.emptyText, { color: textColor }]}>
              Loading...
            </Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              No transactions found
            </Text>
          </View>
        ) : (
          sortedGroupKeys.map((groupKey) => {
            const displayKey =
              /^\d{4}-\d{2}-\d{2}$/.test(groupKey)
                ? format(parseISO(groupKey), "MMM d, yyyy")
                : groupKey;
            return (
              <DateGroup
                key={groupKey}
                dateKey={displayKey}
                transactions={groupedTransactions[groupKey] ?? []}
              />
            );
          })
        )}
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
