import { SafeView, Text, useThemeColor, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { getTransactionsByDateRange, Transaction } from '@/server/fakeDBGetData';
import { parseISO } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import DateGroup from './components/DateGroup';
import FilterButton from './components/FilterButton';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import { filterTransactions, groupTransactionsByDate, sortDateKeys } from './utils/transactionHelpers';

const USER_ID = 'user1';

export default function HistoryScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Get date range from params or use default
  const startDate = useMemo(() => {
    return params.startDate ? parseISO(params.startDate as string) : new Date(2000, 0, 1);
  }, [params.startDate]);

  const endDate = useMemo(() => {
    return params.endDate ? parseISO(params.endDate as string) : new Date();
  }, [params.endDate]);

  // Get and filter transactions
  const allTransactions = useMemo(() => {
    const transactions = getTransactionsByDateRange(USER_ID, startDate, endDate);
    return filterTransactions(transactions, searchQuery);
  }, [startDate, endDate, searchQuery]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(allTransactions);
  }, [allTransactions]);

  // Sort date groups
  const sortedDateKeys = useMemo(() => {
    return sortDateKeys(Object.keys(groupedTransactions));
  }, [groupedTransactions]);

  return (
    <SafeView style={styles.container}>
      <Header />

      {/* Search and Filter Bar */}
      <View style={[styles.searchContainer, { backgroundColor }]}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <FilterButton />
      </View>

      {/* Transaction List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sortedDateKeys.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: textColor }]}>
              No transactions found
            </Text>
          </View>
        ) : (
          sortedDateKeys.map((dateKey) => (
            <DateGroup
              key={dateKey}
              dateKey={dateKey}
              transactions={groupedTransactions[dateKey]}
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
