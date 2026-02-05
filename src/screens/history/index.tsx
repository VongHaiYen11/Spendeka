import { SafeView, Text, useThemeColor, View } from "@/components/Themed";
import { useTransactions } from "@/contexts/TransactionContext";
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
    sortMonthKeys,
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

  // Transaction History always shows all transactions (not filtered by date range)
  const { transactions: allTransactions } = useTransactions();

  const filteredTransactions = useMemo(() => {
    return filterTransactions(allTransactions, searchQuery, {
      transactionType: filters.transactionType,
      categories: filters.categories,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
    });
  }, [allTransactions, searchQuery, filters]);

  // Group by month
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByMonth(filteredTransactions);
  }, [filteredTransactions]);

  // Sort month groups (newest first)
  const sortedMonthKeys = useMemo(() => {
    return sortMonthKeys(Object.keys(groupedTransactions));
  }, [groupedTransactions]);

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
        {sortedMonthKeys.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              No transactions found
            </Text>
          </View>
        ) : (
          sortedMonthKeys.map((monthKey) => (
            <DateGroup
              key={monthKey}
              dateKey={monthKey}
              transactions={groupedTransactions[monthKey]}
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
