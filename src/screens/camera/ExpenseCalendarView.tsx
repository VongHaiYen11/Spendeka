import { Text, View } from '@/components/Themed';
import { PRIMARY_COLOR } from '@/constants/Colors';
import { Expense, formatAmount } from '@/models/Expense';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  View as RNView,
} from 'react-native';

const { width } = Dimensions.get('window');
const DAY_SIZE = (width - 48) / 7; // 7 days per week, with padding

interface DayData {
  date: number;
  totalAmount: number;
  latestImageUrl: string | null;
  hasExpense: boolean;
}

interface MonthData {
  year: number;
  month: number;
  monthName: string;
  days: (DayData | null)[];
  totalAmount: number;
}

interface ExpenseCalendarViewProps {
  expenses: Expense[];
}

export default function ExpenseCalendarView({ expenses }: ExpenseCalendarViewProps) {
  // Group expenses by month and day for calendar view
  const monthsData = useMemo(() => {
    if (expenses.length === 0) return [];

    // Group by month
    const monthMap = new Map<string, Expense[]>();
    expenses.forEach((expense) => {
      const date = new Date(expense.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;

      if (!monthMap.has(key)) {
        monthMap.set(key, []);
      }
      monthMap.get(key)!.push(expense);
    });

    // Convert to array and sort (oldest first, so newest appears at bottom)
    const months: MonthData[] = Array.from(monthMap.entries())
      .map(([key, monthExpenses]) => {
        const [year, month] = key.split('-').map(Number);
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysInMonth = lastDay.getDate();

        // Group expenses by day
        const dayMap = new Map<number, Expense[]>();
        monthExpenses.forEach((expense) => {
          const day = new Date(expense.createdAt).getDate();
          if (!dayMap.has(day)) {
            dayMap.set(day, []);
          }
          dayMap.get(day)!.push(expense);
        });

        // Create days array
        const days: (DayData | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startDayOfWeek; i++) {
          days.push(null);
        }

        // Add days with data
        for (let day = 1; day <= daysInMonth; day++) {
          const dayExpenses = dayMap.get(day) || [];
          const totalAmount = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
          const latestExpense = dayExpenses.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          )[0];

          days.push({
            date: day,
            totalAmount,
            latestImageUrl: latestExpense?.imageUrl || null,
            hasExpense: dayExpenses.length > 0,
          });
        }

        // Calculate month total
        const totalAmount = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

        // Month name in Vietnamese
        const monthNames = [
          'tháng 1',
          'tháng 2',
          'tháng 3',
          'tháng 4',
          'tháng 5',
          'tháng 6',
          'tháng 7',
          'tháng 8',
          'tháng 9',
          'tháng 10',
          'tháng 11',
          'tháng 12',
        ];

        return {
          year,
          month,
          monthName: `${monthNames[month]} ${year}`,
          days,
          totalAmount,
        };
      })
      .sort((a, b) => {
        // Sort by year and month (oldest first, so newest appears at bottom)
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

    return months;
  }, [expenses]);

  const getDayOfWeekLabels = () => {
    return ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];
  };

  return (
    <RNView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {monthsData.length === 0 ? (
          <RNView style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#444" />
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubText}>Take a photo to add an expense!</Text>
          </RNView>
        ) : (
          monthsData.map((monthData) => (
            <RNView key={`${monthData.year}-${monthData.month}`} style={styles.monthContainer}>
              {/* Month Header */}
              <Text style={styles.monthTitle}>{monthData.monthName}</Text>

              {/* Day of Week Labels */}
              <RNView style={styles.dayLabelsContainer}>
                {getDayOfWeekLabels().map((label, index) => (
                  <RNView key={index} style={styles.dayLabel}>
                    <Text style={styles.dayLabelText}>{label}</Text>
                  </RNView>
                ))}
              </RNView>

              {/* Calendar Grid */}
              <RNView style={styles.calendarGrid}>
                {monthData.days.map((day, index) => {
                  if (day === null) {
                    return <RNView key={`empty-${index}`} style={styles.dayCell} />;
                  }

                  return (
                    <RNView
                      key={`${monthData.year}-${monthData.month}-${day.date}`}
                      style={styles.dayCell}
                    >
                      <RNView style={styles.dayContent}>
                        {day.latestImageUrl ? (
                          <Image
                            source={{ uri: day.latestImageUrl }}
                            style={styles.dayImage}
                          />
                        ) : (
                          <Text style={styles.dayNumber}>{day.date}</Text>
                        )}
                      </RNView>
                      {day.hasExpense && (
                        <Text style={styles.dayAmount} numberOfLines={1}>
                          {formatAmount(day.totalAmount)}
                        </Text>
                      )}
                    </RNView>
                  );
                })}
              </RNView>

              {/* Month Total */}
              <RNView style={styles.monthTotalContainer}>
                <Text style={styles.monthTotalLabel}>Total</Text>
                <Text style={styles.monthTotalAmount}>
                  {formatAmount(monthData.totalAmount)}
                </Text>
              </RNView>
            </RNView>
          ))
        )}
      </ScrollView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  monthContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    marginBottom: 40,
  },
  monthTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  dayLabelsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayLabel: {
    width: DAY_SIZE,
    alignItems: 'center',
  },
  dayLabelText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE + 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  dayContent: {
    width: DAY_SIZE - 8,
    height: DAY_SIZE - 8,
    borderRadius: (DAY_SIZE - 8) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  dayImage: {
    width: '100%',
    height: '100%',
    borderRadius: (DAY_SIZE - 8) / 2,
  },
  dayNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dayAmount: {
    color: PRIMARY_COLOR,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    width: DAY_SIZE - 4,
  },
  monthTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  monthTotalLabel: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  monthTotalAmount: {
    color: PRIMARY_COLOR,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 150,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    marginTop: 16,
  },
  emptySubText: {
    color: '#444',
    fontSize: 14,
    marginTop: 8,
  },
});
