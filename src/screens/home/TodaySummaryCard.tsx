import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, View as RNView, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense } from '@/models/Expense';

interface TodaySummaryCardProps {
  colorScheme: 'light' | 'dark' | null;
  textColor: string;
  backgroundColor: string;
  todayExpenses: Expense[];
  totalIncomeToday: number;
  totalSpentToday: number;
  onOpenCamera: () => void;
  formatAmount: (value: number) => string;
}

export default function TodaySummaryCard({
  colorScheme,
  textColor,
  backgroundColor,
  todayExpenses,
  totalIncomeToday,
  totalSpentToday,
  onOpenCamera,
  formatAmount,
}: TodaySummaryCardProps) {
  return (
    <RNView style={styles.todayCardWrapper}>
      <Text style={styles.todayLabelText}>Today</Text>
      <RNView style={[styles.todayCard, { backgroundColor }]}>
        {/* Left: today's latest photo */}
        <TouchableOpacity
          style={styles.todayImagesContainer}
          activeOpacity={0.8}
          onPress={onOpenCamera}
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

        {/* Right: two boxes - Income (green) & Spent (red) like Summary Saved/Spent */}
        <RNView style={styles.todayInfo}>
          <LinearGradient
            colors={['#72E394', '#49B68D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.financeBox}
          >
            <Text style={styles.financeLabel}>Income</Text>
            <Text style={styles.financeAmount}>
              +{formatAmount(totalIncomeToday)}
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={['#E56B89', '#C84E6D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.financeBox, styles.financeBoxLast]}
          >
            <Text style={styles.financeLabel}>Spent</Text>
            <Text style={styles.financeAmount}>
              -{formatAmount(totalSpentToday)}
            </Text>
          </LinearGradient>
        </RNView>
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  todayCardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  todayLabelText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  todayCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  // Left image container: square, takes left half
  todayImagesContainer: {
    flex: 1, // chiếm nửa trái
    marginRight: 12,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1, // luôn hiển thị dạng hình vuông
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
    justifyContent: 'space-between',
  },
  financeBox: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    justifyContent: 'center',
    marginBottom: 8,
  },
  financeBoxLast: {
    marginBottom: 0,
  },
  financeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  financeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

