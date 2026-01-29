import { useThemeColor } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useTransactions } from "@/contexts/TransactionContext";
import { filterTransactionsByDateRange } from "@/utils/transactionHelpers";
import { useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import { TYPE_OPTIONS } from "../constants";
import { ChartType, OverviewProps, ThemeColors } from "../types";
import { aggregateTransactions, buildChartData } from "../utils/chartDataUtils";

export interface UseOverviewReturn {
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  items: typeof TYPE_OPTIONS;
  setItems: React.Dispatch<React.SetStateAction<typeof TYPE_OPTIONS>>;
  themeColors: ThemeColors;
  chartData: ReturnType<typeof buildChartData>;
  chartWidth: number;
  chartHeight: number;
  chartConfig: {
    backgroundGradientFrom: string;
    backgroundGradientTo: string;
    decimalPlaces: number;
    color: () => string;
    labelColor: () => string;
    propsForBackgroundLines: { stroke: string };
    barPercentage: number;
    propsForLabels: { fontSize: number };
    formatYLabel: (value: string) => string;
  };
  hasData: boolean;
  isLineChart: boolean;
  barChartProps: any;
  lineChartProps: any;
}

export const useOverview = ({
  startDate,
  endDate,
  range,
}: Pick<
  OverviewProps,
  "startDate" | "endDate" | "range"
>): UseOverviewReturn => {
  const { width } = useWindowDimensions();
  const [chartType, setChartType] = useState<ChartType>("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [items, setItems] = useState(TYPE_OPTIONS);

  // Theme resolution
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const isDark = backgroundColor === Colors.dark.background;

  const themeColors: ThemeColors = {
    bg: isDark ? "#111827" : Colors.general.white,
    text: textColor,
    border: isDark ? "#374151" : Colors.general.gray200,
    pickerBg: isDark ? "#1f2937" : Colors.general.gray100,
    chartText: isDark ? "#9ca3af" : Colors.general.gray600,
    chartLine: isDark ? "#374151" : Colors.general.gray200,
    chartAxis: isDark ? "#d1d5db" : Colors.general.gray700,
  };

  // Get transactions from global state and filter by date range
  const { transactions: allTransactions } = useTransactions();

  const rawTransactions = useMemo(
    () => filterTransactionsByDateRange(allTransactions, startDate, endDate),
    [allTransactions, startDate, endDate],
  );

  // Keep useMemo for expensive aggregation computation
  const buckets = useMemo(
    () => aggregateTransactions(rawTransactions, range, startDate, endDate),
    [rawTransactions, range, startDate, endDate],
  );

  // Keep useMemo for expensive chart data computation
  const chartData = useMemo(
    () => buildChartData(buckets, chartType, range),
    [buckets, chartType, range],
  );

  const barPercentage = useMemo(() => {
    const count = buckets.length;
    if (count <= 6) return 0.6;
    if (count <= 8) return 0.5;
    if (count <= 12) return 0.4;
    return 0.3;
  }, [buckets.length]);

  const hasData = useMemo(
    () => buckets.some((b) => b.income > 0 || b.spent > 0),
    [buckets],
  );

  const baseWidth = width - 32;
  const chartWidth = useMemo(() => {
    // Line chart for "all" range fits screen width, no scrolling needed
    return baseWidth;
  }, [baseWidth]);

  // Responsive chart height: account for rotated labels and legend
  // Line charts need extra height for vertical labels and legend space
  const chartHeight = useMemo(() => {
    if (chartType === "all") {
      // Line chart: extra height for rotated labels (90°) and legend
      // Base chart area + rotated label space (~40px) + legend space (~30px)
      const responsiveHeight = Math.round(baseWidth * 0.65);
      return Math.max(280, Math.min(responsiveHeight, 380));
    }
    // Bar chart: standard height
    const responsiveHeight = Math.round(baseWidth * 0.6);
    return Math.max(220, Math.min(responsiveHeight, 320));
  }, [baseWidth, chartType]);

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
    yAxisLabel: "",
    yAxisSuffix: "",
    fromZero: true,
    withInnerLines: true,
    segments: 5, // Divide Y-axis into 5 equal segments (6 tick values including 0)
    chartConfig,
    style: { borderRadius: 16, alignSelf: "center" },
  };

  // Bar chart specific props
  const barChartProps = {
    ...commonChartProps,
    showValuesOnTopOfBars: false,
    verticalLabelRotation: 0,
    horizontalLabelRotation: 0,
  };

  // Line chart specific props (for "all" chart type)
  const lineChartProps = {
    ...commonChartProps,
    verticalLabelRotation: range === "all" ? 90 : 0, // Rotate labels only for 'all' range (many data points)
    withDots: true,
    withShadow: false,
    bezier: false, // Straight lines for clearer comparison
  };

  // Use line chart for "all" chart type (showing both income and spent), bar chart for others
  const isLineChart = chartType === "all";

  return {
    chartType,
    setChartType,
    dropdownOpen,
    setDropdownOpen,
    items,
    setItems,
    themeColors,
    chartData,
    chartWidth,
    chartHeight,
    chartConfig,
    hasData,
    isLineChart,
    barChartProps,
    lineChartProps,
  };
};
