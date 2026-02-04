import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '@/models/Expense';

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
    <View style={styles.todayCardWrapper}>
      <View style={[styles.todayCard, { backgroundColor }]}>
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
            <View style={styles.todayEmptyImage}>
              <Ionicons
                name="image-outline"
                size={28}
                color={colorScheme === 'dark' ? '#777' : '#999'}
              />
              <Text style={[styles.todayEmptyText, { color: textColor }]}>
                No photos today
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Right: today totals */}
        <View style={styles.todayInfo}>
          <Text style={[styles.todayTitle, { color: textColor }]}>Today</Text>
          <Text style={styles.todayIncomeValue}>
            +{formatAmount(totalIncomeToday)}
          </Text>
          <Text style={styles.todayExpenseValue}>
            -{formatAmount(totalSpentToday)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  todayCardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
    paddingLeft: 8,
    justifyContent: 'center',
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  todayIncomeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2ecc71',
    marginTop: 4,
  },
  todayExpenseValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e74c3c',
    marginTop: 2,
  },
});

