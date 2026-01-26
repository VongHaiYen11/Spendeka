import { Text, useThemeColor, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { getRawSummaryData, Transaction } from '@/server/fakeDBGetData';
import { differenceInDays, eachDayOfInterval, format } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Text as RNText, StyleSheet, useWindowDimensions } from 'react-native';
import { BarChart as ChartKitBarChart, LineChart as ChartKitLineChart } from 'react-native-chart-kit';
import DropDownPicker from 'react-native-dropdown-picker';

type Range = 'day' | 'week' | 'month' | 'year' | 'all';
type ChartType = 'income' | 'spent' | 'all';

interface OverviewProps {
  startDate: Date;
  endDate: Date;
  range: Range;
  userId?: string;
}

interface AggregatedBucket {
  label: string;
  income: number;
  spent: number;
}

const INCOME_COLOR = Colors.general.income;
const SPENT_COLOR = Colors.general.spent;
const MONTH_ABBREVIATIONS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const TYPE_OPTIONS: Array<{ label: string; value: ChartType }> = [
  { label: 'All', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Spent', value: 'spent' },
];

const splitAmount = (amount: number) => {
  if (amount < 0) {
    return { income: Math.abs(amount), spent: 0 };
  }
  return { income: 0, spent: amount };
};

// Create buckets with strict limits for visual clarity
const createBuckets = (range: Range, startDate: Date, endDate: Date): AggregatedBucket[] => {
  switch (range) {
    case 'day': {
      // 8 bars: 3-hour intervals
      return [
        { label: '12 AM', income: 0, spent: 0 },
        { label: '3 AM', income: 0, spent: 0 },
        { label: '6 AM', income: 0, spent: 0 },
        { label: '9 AM', income: 0, spent: 0 },
        { label: '12 PM', income: 0, spent: 0 },
        { label: '3 PM', income: 0, spent: 0 },
        { label: '6 PM', income: 0, spent: 0 },
        { label: '9 PM', income: 0, spent: 0 },
      ];
    }
    case 'week': {
      // 7 bars: one per day
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      return days.slice(0, 7).map(day => ({
        label: format(day, 'EEE'),
        income: 0,
        spent: 0,
      }));
    }
    case 'month': {
      // 6 bars: ~5-day intervals
      return [
        { label: '1-4', income: 0, spent: 0 },
        { label: '5-9', income: 0, spent: 0 },
        { label: '10-14', income: 0, spent: 0 },
        { label: '15-19', income: 0, spent: 0 },
        { label: '20-24', income: 0, spent: 0 },
        { label: '25-31', income: 0, spent: 0 },
      ];
    }
    case 'year': {
      // 12 bars: one per month
      return MONTH_ABBREVIATIONS.map(letter => ({
        label: letter,
        income: 0,
        spent: 0,
      }));
    }
    case 'all': {
      // One data point per year for line chart
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const totalYears = endYear - startYear + 1;
      
      return Array.from({ length: totalYears }, (_, i) => {
        const year = startYear + i;
        return {
          label: year.toString(),
          income: 0,
          spent: 0,
        };
      });
    }
    default:
      return [];
  }
};

const getBucketIndex = (
  range: Range,
  date: Date,
  startDate: Date,
  endDate: Date,
  buckets: AggregatedBucket[]
): number => {
  if (!buckets || buckets.length === 0) return 0;
  
  switch (range) {
    case 'day': {
      const hour = date.getHours();
      return Math.floor(hour / 3);
    }
    case 'week': {
      const daysDiff = differenceInDays(date, startDate);
      return Math.max(0, Math.min(daysDiff, 6));
    }
    case 'month': {
      const day = date.getDate();
      if (day >= 25) return 5;
      if (day >= 20) return 4;
      if (day >= 15) return 3;
      if (day >= 10) return 2;
      if (day >= 5) return 1;
      return 0;
    }
    case 'year': {
      return Math.max(0, Math.min(date.getMonth(), 11));
    }
    case 'all': {
      // Map transaction year to its corresponding yearly bucket
      const year = date.getFullYear();
      const startYear = startDate.getFullYear();
      const yearIndex = year - startYear;
      
      // Ensure index is within bounds
      return Math.max(0, Math.min(yearIndex, buckets.length - 1));
    }
    default:
      return 0;
  }
};

const aggregateTransactions = (
  transactions: Transaction[],
  range: Range,
  startDate: Date,
  endDate: Date
) => {
  const buckets = createBuckets(range, startDate, endDate);
  if (!buckets || buckets.length === 0) return [];
  
  transactions.forEach(tx => {
    const date = new Date(tx.date);
    const index = getBucketIndex(range, date, startDate, endDate, buckets);
    if (index >= 0 && index < buckets.length) {
      const { income, spent } = splitAmount(tx.amount);
      buckets[index].income += income;
      buckets[index].spent += spent;
    }
  });
  
  return buckets;
};

// Calculate a nice, human-friendly max value for Y-axis
// Always rounds UP to clean values (50, 100, 150, 200, 300, 500, 1000, 1500, 2000, etc.)
const calculateNiceMax = (value: number): number => {
  if (value === 0) return 10; // Minimum scale for empty charts
  
  // Determine magnitude (power of 10)
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude; // Normalize to 1-10 range
  
  // Round up to next nice number
  let niceNormalized: number;
  if (normalized <= 1.5) niceNormalized = 1.5;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 3) niceNormalized = 3;
  else if (normalized <= 5) niceNormalized = 5;
  else if (normalized <= 7) niceNormalized = 7;
  else niceNormalized = 10;
  
  return niceNormalized * magnitude;
};

// Sparsify labels for line charts when there are too many data points
const sparsifyLabels = (labels: string[]): string[] => {
  const totalLabels = labels.length;
  
  // If 10 or fewer, show all labels
  if (totalLabels <= 10) {
    return labels;
  }
  
  // If 11-20, show every 2nd label
  if (totalLabels <= 20) {
    return labels.map((label, i) => i % 2 === 0 ? label : '');
  }
  
  // If 21-30, show every 3rd label
  if (totalLabels <= 30) {
    return labels.map((label, i) => i % 3 === 0 ? label : '');
  }
  
  // If more than 30, show every 5th label
  return labels.map((label, i) => i % 5 === 0 ? label : '');
};

const buildChartData = (buckets: AggregatedBucket[], chartType: ChartType, range: Range) => {
  let labels = buckets.map(b => b.label);
  
  // Sparsify labels for "all" range line chart to prevent overlap
  if (range === 'all') {
    labels = sparsifyLabels(labels);
  }

  if (chartType === 'income') {
    return {
      labels,
      datasets: [{ data: buckets.map(b => b.income), color: () => INCOME_COLOR }],
    };
  }

  if (chartType === 'spent') {
    return {
      labels,
      datasets: [{ data: buckets.map(b => b.spent), color: () => SPENT_COLOR }],
    };
  }

  return {
    labels,
    legend: ['Income', 'Spent'],
    datasets: [
      { data: buckets.map(b => b.income), color: () => INCOME_COLOR },
      { data: buckets.map(b => b.spent), color: () => SPENT_COLOR },
    ],
  };
};

const Overview: React.FC<OverviewProps> = ({
  startDate,
  endDate,
  range,
  userId = 'user1',
}) => {
  const { width } = useWindowDimensions();
  const [chartType, setChartType] = useState<ChartType>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [items, setItems] = useState(TYPE_OPTIONS);

  // Theme resolution via Themed hook
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const isDark = backgroundColor === Colors.dark.background;

  const themeColors = useMemo(
    () => ({
      bg: isDark ? '#111827' : Colors.general.white,
      text: textColor,
      border: isDark ? '#374151' : Colors.general.gray200,
      pickerBg: isDark ? '#1f2937' : Colors.general.gray100,
      chartText: isDark ? '#9ca3af' : Colors.general.gray600,
      chartLine: isDark ? '#374151' : Colors.general.gray200,
      chartAxis: isDark ? '#d1d5db' : Colors.general.gray700,
    }),
    [backgroundColor, textColor, isDark]
  );

  const rawTransactions = useMemo(
    () => getRawSummaryData(userId, startDate, endDate),
    [userId, startDate, endDate]
  );

  const buckets = useMemo(
    () => aggregateTransactions(rawTransactions, range, startDate, endDate),
    [rawTransactions, range, startDate, endDate]
  );

  const chartData = useMemo(
    () => buildChartData(buckets, chartType, range),
    [buckets, chartType, range]
  );

  const barPercentage = useMemo(() => {
    const count = buckets.length;
    if (count <= 6) return 0.6;
    if (count <= 8) return 0.5;
    if (count <= 12) return 0.4;
    return 0.3;
  }, [buckets.length]);

  const hasData = useMemo(
    () => buckets.some(b => b.income > 0 || b.spent > 0),
    [buckets]
  );

  const baseWidth = width - 32;
  const chartWidth = useMemo(() => {
    // Line chart for "all" range fits screen width, no scrolling needed
    return baseWidth;
  }, [baseWidth]);

  const needsScroll = false; // No scrolling for any range now
  
  // Responsive chart height: account for rotated labels and legend
  // Line charts need extra height for vertical labels and legend space
  const chartHeight = useMemo(() => {
    if (range === 'all') {
      // Line chart: extra height for rotated labels (90°) and legend
      // Base chart area + rotated label space (~40px) + legend space (~30px)
      const responsiveHeight = Math.round(baseWidth * 0.65);
      return Math.max(280, Math.min(responsiveHeight, 380));
    }
    // Bar chart: standard height
    const responsiveHeight = Math.round(baseWidth * 0.6);
    return Math.max(220, Math.min(responsiveHeight, 320));
  }, [baseWidth, range]);

  const chartConfig = {
    backgroundGradientFrom: themeColors.bg,
    backgroundGradientTo: themeColors.bg,
    decimalPlaces: 0,
    color: () => themeColors.chartAxis,
    labelColor: () => themeColors.chartText,
    propsForBackgroundLines: { stroke: themeColors.chartLine },
    barPercentage,
    propsForLabels: {
      fontSize: 11,
    },
    formatYLabel: (value: string) => {
      // Ensure Y-axis labels are clean integers
      const numValue = parseFloat(value);
      return Math.round(numValue).toString();
    },
  };

  // Common chart props
  const commonChartProps = {
    data: chartData,
    width: chartWidth,
    height: chartHeight,
    yAxisLabel: '',
    yAxisSuffix: '',
    fromZero: true,
    withInnerLines: true,
    segments: 5, // Divide Y-axis into 5 equal segments (6 tick values including 0)
    chartConfig,
    style: styles.chart,
  };

  // Bar chart specific props
  const barChartProps = {
    ...commonChartProps,
    showValuesOnTopOfBars: false,
    verticalLabelRotation: 0,
    horizontalLabelRotation: 0,
  };

  // Line chart specific props (for "all" range)
  const lineChartProps = {
    ...commonChartProps,
    verticalLabelRotation: 90, // Rotate labels vertically to save space
    withDots: true,
    withShadow: false,
    bezier: false, // Straight lines for clearer year-to-year comparison
  };

  // Use line chart for "all" range, bar chart for others
  const isLineChart = range === 'all';

  return (
    <View style={[
      styles.container
    ]}>
      <View style={styles.header}>
        <Text style={styles.title}>Trends</Text>
        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={dropdownOpen}
            value={chartType}
            items={items}
            setOpen={setDropdownOpen}
            setValue={setChartType as any}
            setItems={setItems}
            style={[styles.dropdown, { backgroundColor: themeColors.pickerBg, borderColor: themeColors.border }]}
            textStyle={{ color: themeColors.text, fontSize: 13, fontWeight: '500' }}
            dropDownContainerStyle={{
              backgroundColor: themeColors.pickerBg,
              borderColor: themeColors.border,
              borderRadius: 8,
              marginTop: 4,
            }}
            arrowIconStyle={{ tintColor: themeColors.text } as any}
            tickIconStyle={{ tintColor: themeColors.text } as any}
            listMode="SCROLLVIEW"
            zIndex={2000}
            zIndexInverse={1000}
            maxHeight={150}
          />
        </View>
      </View>
        
      {hasData ? (
        <View style={styles.chartContainer}>
          <View style={styles.chartArea}>
            <View style={[styles.chartWrapper, { backgroundColor: themeColors.bg }]}>
              {isLineChart ? (
                <ChartKitLineChart {...lineChartProps} />
              ) : (
                <ChartKitBarChart {...barChartProps} />
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <RNText style={[styles.emptyText, { color: themeColors.chartText }]}>No data</RNText>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 2000,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownWrapper: {
    width: 100,
  },
  dropdown: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 34,
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    backgroundColor: '#111827',
    paddingBottom: 20,
    borderRadius: 16,
  },
  chartArea: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 8, // Ensure content isn't clipped at edges during scroll
  },
  chart: {
    borderRadius: 16,
    alignSelf: 'center', // Explicitly center the chart horizontally
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Overview;
