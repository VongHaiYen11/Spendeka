import { useThemeColor } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useTransactions } from "@/contexts/TransactionContext";
import { useI18n } from "@/i18n";
import { filterTransactionsByDateRange } from "@/utils/transactionHelpers";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import { ChartType, OverviewProps, ThemeColors } from "../types";
import { aggregateTransactions, buildChartData } from "../utils/chartDataUtils";

export interface AllTimeDateRange {
  start: Date | null;
  end: Date | null;
}

export interface UseOverviewReturn {
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  items: Array<{ label: string; value: ChartType }>;
  setItems: React.Dispatch<
    React.SetStateAction<Array<{ label: string; value: ChartType }>>
  >;
  themeColors: ThemeColors;
  allTimeDateRange: AllTimeDateRange;
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
  const { t, languageKey } = useI18n();
  const { width } = useWindowDimensions();
  const [chartType, setChartType] = useState<ChartType>("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const itemsMemo = useMemo(
    () => [
      { label: t("summary.chart.all"), value: "all" as ChartType },
      { label: t("summary.chart.income"), value: "income" as ChartType },
      { label: t("summary.chart.spent"), value: "spent" as ChartType },
    ],
    [t, languageKey],
  );

  const [items, setItems] = useState(itemsMemo);
  const prevLanguageKeyRef = useRef(languageKey);

  // Only update items when language actually changes (using ref to prevent loops)
  useEffect(() => {
    if (prevLanguageKeyRef.current !== languageKey) {
      prevLanguageKeyRef.current = languageKey;
      setItems([
        { label: t("summary.chart.all"), value: "all" as ChartType },
        { label: t("summary.chart.income"), value: "income" as ChartType },
        { label: t("summary.chart.spent"), value: "spent" as ChartType },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageKey]);

  // Theme resolution
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const isDark = backgroundColor === Colors.dark.background;

  const themeColors: ThemeColors = {
    bg: cardColor,
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
    () =>
      aggregateTransactions(
        rawTransactions,
        range,
        startDate,
        endDate,
        t,
        languageKey,
      ),
    [rawTransactions, range, startDate, endDate, t, languageKey],
  );

  // Keep useMemo for expensive chart data computation
  const chartData = useMemo(
    () => buildChartData(buckets, chartType, range, t),
    [buckets, chartType, range, t],
  );

  // For "all time" range: date range of data filtered by chart type (income / spent / all)
  const allTimeDateRange = useMemo((): AllTimeDateRange => {
    if (range !== "all" || rawTransactions.length === 0) {
      return { start: null, end: null };
    }
    const filtered =
      chartType === "income"
        ? rawTransactions.filter((tx) => tx.type === "income")
        : chartType === "spent"
          ? rawTransactions.filter((tx) => tx.type === "spent")
          : rawTransactions;
    if (filtered.length === 0) return { start: null, end: null };
    const dates = filtered.map((tx) => new Date(tx.createdAt).getTime());
    return {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates)),
    };
  }, [range, chartType, rawTransactions]);

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
    allTimeDateRange,
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
