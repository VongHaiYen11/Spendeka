import { SafeView, Text, useThemeColor, View } from "@/components/Themed";
import {
    getTransactionsByDateRange
} from "@/server/fakeDBGetData";
import { parseISO } from "date-fns";
import { useLocalSearchParams } from "expo-router";
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

const USER_ID = "user1";

export default function HistoryScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  // Get date range from params or use default
  const startDate = useMemo(() => {
    return params.startDate
      ? parseISO(params.startDate as string)
      : new Date(2000, 0, 1);
  }, [params.startDate]);

  const endDate = useMemo(() => {
    return params.endDate ? parseISO(params.endDate as string) : new Date();
  }, [params.endDate]);

  const [filters, setFilters] = useState<FilterState>({
    transactionType: 'all',
    categories: [],
    minAmount: '',
    maxAmount: '',
    startDate: startDate,
    endDate: endDate,
    groupBy: 'month',
  });

  // Update filters when date range changes
  React.useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      startDate: startDate,
      endDate: endDate,
    }));
  }, [startDate, endDate]);

  // Get and filter transactions
  const allTransactions = useMemo(() => {
    const transactions = getTransactionsByDateRange(
      USER_ID,
      startDate,
      endDate,
    );
    return filterTransactions(transactions, searchQuery);
  }, [startDate, endDate, searchQuery]);

  // Group by month
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByMonth(allTransactions);
  }, [allTransactions]);

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
          // Filter logic will be implemented later
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
