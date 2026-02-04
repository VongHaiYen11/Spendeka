import { Text } from '@/components/Themed';
import { Expense } from '@/models/Expense';
import { Ionicons } from '@expo/vector-icons';
import { Image, View as RNView, StyleSheet, TouchableOpacity } from 'react-native';

interface TodaySummaryCardProps {
  colorScheme: 'light' | 'dark' | null;
  textColor: string;
  backgroundColor: string;
  todayExpenses: Expense[];
  totalIncomeToday: number;
  totalSpentToday: number;
  onOpenExpense: (expense: Expense) => void;
  formatAmount: (value: number) => string;
}

export default function TodaySummaryCard({
  colorScheme,
  textColor,
  backgroundColor,
  todayExpenses,
  totalIncomeToday,
  totalSpentToday,
  onOpenExpense,
  formatAmount,
}: TodaySummaryCardProps) {
  return (
    <RNView style={styles.todayCardWrapper}>
      <Text style={styles.todayLabelText}>Today</Text>
      <RNView style={[styles.todayCard, { backgroundColor }]}>
        {/* Left: today's latest photo */}
        <TouchableOpacity
          style={styles.todayImagesContainer}
          activeOpacity={todayExpenses.length ? 0.8 : 1}
          disabled={!todayExpenses.length}
          onPress={() => {
            if (todayExpenses.length) {
              onOpenExpense(todayExpenses[0]);
            }
          }}
        >
          {todayExpenses.length ? (
            <Image
              source={{ uri: todayExpenses[0].imageUrl }}
              style={styles.todayImage}
              resizeMode="cover"
            />
          ) : (
            <RNView style={styles.todayEmptyImage}>
              <Ionicons
                name="image-outline"
                size={28}
                color={colorScheme === 'dark' ? '#777' : '#999'}
              />
              <Text style={[styles.todayEmptyText, { color: textColor }]}>
                No photos today
              </Text>
            </RNView>
          )}
        </TouchableOpacity>

        {/* Right: today totals - stacked sections */}
        <RNView style={styles.todayInfo}>
          <RNView style={styles.summaryBlock}>
            <Text style={[styles.summaryLabel, { color: textColor }]}>
              Income
            </Text>
            <Text style={styles.todayIncomeValue}>
              +{formatAmount(totalIncomeToday)}
            </Text>
          </RNView>

          <RNView
            style={[
              styles.todayHorizontalDivider,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(0,0,0,0.1)',
              },
            ]}
          />

          <RNView style={styles.summaryBlock}>
            <Text style={[styles.summaryLabel, { color: textColor }]}>
              Spent
            </Text>
            <Text style={styles.todayExpenseValue}>
              -{formatAmount(totalSpentToday)}
            </Text>
          </RNView>
        </RNView>
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  todayCardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  todayLabelText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  todayCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 16,
    height: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  todayImagesContainer: {
    flex: 1,
    marginRight: 12,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayImage: {
    width: '100%',
    height: '100%',
  },
  todayEmptyImage: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayEmptyText: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.7,
  },
  todayInfo: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  summaryBlock: {
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
    textAlign: 'left',
  },
  todayHorizontalDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
    width: '100%',
  },
  todayIncomeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2ecc71',
    textAlign: 'center',
    marginTop: 2,
  },
  todayExpenseValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 2,
  },
});

