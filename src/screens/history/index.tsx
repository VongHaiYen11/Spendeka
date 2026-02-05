import { SafeView, Text, useThemeColor, View } from "@/components/Themed";
import { useTransactions } from "@/contexts/TransactionContext";
import {
  EXPENSE_CATEGORIES_EN,
  INCOME_CATEGORIES_EN,
} from "@/models/Expense";
import { DatabaseTransaction } from "@/types/transaction";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import DateGroup from "./components/DateGroup";
import FilterButton from "./components/FilterButton";
import FilterModal, { FilterState } from "./components/FilterModal";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import {
  filterTransactions,
  groupTransactionsByMonth,
  groupTransactionsByYear,
  groupTransactionsFlat,
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

  const { transactions: allTransactions } = useTransactions();

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
    if (filters.groupBy === "none") {
      return groupTransactionsFlat(filteredTransactions);
    }
    return groupTransactionsByMonth(filteredTransactions);
  }, [filteredTransactions, filters.groupBy]);

  const sortedGroupKeys = useMemo(() => {
    return sortGroupKeys(Object.keys(groupedTransactions));
  }, [groupedTransactions]);

  const categoryOptions = useMemo(
    () => [
      ...EXPENSE_CATEGORIES_EN.map((c) => ({ value: c.value, label: c.label })),
      ...INCOME_CATEGORIES_EN.map((c) => ({ value: c.value, label: c.label })),
    ],
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
        availableCategories={categoryOptions}
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
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              No transactions found
            </Text>
          </View>
        ) : (
          sortedGroupKeys.map((groupKey) => (
            <DateGroup
              key={groupKey}
              dateKey={groupKey}
              transactions={groupedTransactions[groupKey] ?? []}
            />
          ))
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
