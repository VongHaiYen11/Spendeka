import { SafeView, Text, useThemeColor, View } from "@/components/Themed";
import { useTransactions } from "@/contexts/TransactionContext";
import { useI18n } from "@/i18n";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORIES_EN,
  INCOME_CATEGORIES_EN,
  INCOME_CATEGORIES_VI,
} from "@/models/Expense";
import { useFocusEffect } from "@react-navigation/native";
import { format, parseISO } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import DateGroup from "./components/DateGroup";
import FilterButton from "./components/FilterButton";
import FilterModal, { FilterState } from "./components/FilterModal";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
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
  const { t, languageKey } = useI18n();

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
    }, [refreshTransactions]),
  );

  // Build category label map for bilingual search
  const categoryLabelMap = useMemo(() => {
    const expenseCategories =
      languageKey === "vie" ? EXPENSE_CATEGORIES : EXPENSE_CATEGORIES_EN;
    const incomeCategories =
      languageKey === "vie" ? INCOME_CATEGORIES_VI : INCOME_CATEGORIES_EN;
    const map: Record<string, string> = {};
    [...expenseCategories, ...incomeCategories].forEach((cat) => {
      map[cat.value] = cat.label;
    });
    return map;
  }, [languageKey]);

  const filteredTransactions = useMemo(() => {
    return filterTransactions(allTransactions, searchQuery, {
      transactionType: filters.transactionType,
      categories: filters.categories,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
      startDate: filters.startDate,
      endDate: filters.endDate,
      categoryLabelMap,
    });
  }, [allTransactions, searchQuery, filters, categoryLabelMap]);

  const dateLocale = useMemo(() => {
    return languageKey === "vie" ? vi : enUS;
  }, [languageKey]);

  const groupedTransactions = useMemo(() => {
    if (filters.groupBy === "year") {
      return groupTransactionsByYear(filteredTransactions);
    }
    if (filters.groupBy === "day") {
      return groupTransactionsByDay(filteredTransactions);
    }
    return groupTransactionsByMonth(filteredTransactions, dateLocale);
  }, [filteredTransactions, filters.groupBy, dateLocale]);

  const sortedGroupKeys = useMemo(() => {
    return sortGroupKeys(Object.keys(groupedTransactions));
  }, [groupedTransactions]);

  const expenseCategoryOptions = useMemo(() => {
    const categories =
      languageKey === "vie" ? EXPENSE_CATEGORIES : EXPENSE_CATEGORIES_EN;
    return categories.map((c) => ({ value: c.value, label: c.label }));
  }, [languageKey]);
  const incomeCategoryOptions = useMemo(() => {
    const categories =
      languageKey === "vie" ? INCOME_CATEGORIES_VI : INCOME_CATEGORIES_EN;
    return categories.map((c) => ({ value: c.value, label: c.label }));
  }, [languageKey]);

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
              {t("history.loading")}
            </Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              {t("history.empty")}
            </Text>
          </View>
        ) : (
          sortedGroupKeys.map((groupKey) => {
            const formattedKey = /^\d{4}-\d{2}-\d{2}$/.test(groupKey)
              ? format(parseISO(groupKey), "MMM d, yyyy", { locale: dateLocale })
              : groupKey;
            const displayKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
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
