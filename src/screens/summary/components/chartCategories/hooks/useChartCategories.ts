import { useThemeColor } from "@/components/Themed";
import Colors from "@/constants/Colors";
import {
  getIncomeByCategory,
  getSpentByCategory,
} from "@/services/ExpenseService";
import { useEffect, useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import { CATEGORY_OPTIONS } from "../constants";
import {
  CategoryType,
  ChartCategoriesProps,
  ChartDataItem,
  ThemeColors,
} from "../types";
import { generateChartData } from "../utils/chartDataUtils";

export interface UseChartCategoriesReturn {
  categoryType: CategoryType;
  setCategoryType: (type: CategoryType) => void;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  items: typeof CATEGORY_OPTIONS;
  setItems: React.Dispatch<React.SetStateAction<typeof CATEGORY_OPTIONS>>;
  themeColors: ThemeColors;
  chartData: ChartDataItem[];
  chartWidth: number;
  chartHeight: number;
  chartConfig: {
    backgroundColor: string;
    backgroundGradientFrom: string;
    backgroundGradientTo: string;
    color: () => string;
    labelColor: () => string;
    decimalPlaces: number;
  };
  hasData: boolean;
}

export const useChartCategories = ({
  startDate,
  endDate,
}: Pick<
  ChartCategoriesProps,
  "startDate" | "endDate"
>): UseChartCategoriesReturn => {
  const { width } = useWindowDimensions();
  const [categoryType, setCategoryType] = useState<CategoryType>("income");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [items, setItems] = useState(CATEGORY_OPTIONS);

  // Theme resolution
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const isDark = backgroundColor === Colors.dark.background;

  const themeColors: ThemeColors = {
    bg: isDark ? "#111827" : Colors.general.white,
    text: textColor,
    chartText: isDark ? "#9ca3af" : Colors.general.gray600,
    chartAxis: isDark ? "#d1d5db" : Colors.general.gray700,
    border: isDark ? "#374151" : Colors.general.gray200,
    pickerBg: isDark ? "#1f2937" : Colors.general.gray100,
  };

  // Fetch category data asynchronously
  const [incomeByCategory, setIncomeByCategory] = useState<Record<string, number>>({});
  const [spentByCategory, setSpentByCategory] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadCategoryData = async () => {
      const income = await getIncomeByCategory(startDate, endDate);
      const spent = await getSpentByCategory(startDate, endDate);
      setIncomeByCategory(income);
      setSpentByCategory(spent);
    };
    loadCategoryData();
  }, [startDate, endDate]);

  // Keep useMemo for expensive computation (sorting, mapping, color generation) and stable reference for PieChart
  const chartData = useMemo(() => {
    // Fix: Swap data sources - incomeByCategory appears to contain spent data and vice versa
    const categoryData =
      categoryType === "income" ? spentByCategory : incomeByCategory;
    return generateChartData(categoryData, themeColors, tintColor, isDark);
  }, [
    categoryType,
    incomeByCategory,
    spentByCategory,
    themeColors,
    tintColor,
    isDark,
  ]);

  const chartWidth = width - 32;
  const chartHeight = 200;

  // Keep useMemo for chartConfig to provide stable reference for PieChart (third-party library)
  const chartConfig = useMemo(
    () => ({
      backgroundColor: "transparent" as const,
      backgroundGradientFrom: themeColors.bg,
      backgroundGradientTo: themeColors.bg,
      color: () => themeColors.chartAxis,
      labelColor: () => themeColors.chartText,
      decimalPlaces: 0,
    }),
    [themeColors],
  );

  const hasData = chartData.length > 0;

  return {
    categoryType,
    setCategoryType,
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
  };
};
