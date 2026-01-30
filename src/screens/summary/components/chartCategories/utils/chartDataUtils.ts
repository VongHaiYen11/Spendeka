import { getCategoryDisplayInfo } from "@/models/Expense";
import type { TransactionCategory } from "@/types/transaction";
import { MAX_CATEGORIES } from "../constants";
import { ChartDataItem, CategoryType, ThemeColors } from "../types";

/**
 * Generates chart data for pie chart from category data.
 * Takes top 9 categories and groups the rest as "Others".
 * Uses each category's color from the Expense model (same in light and dark mode).
 */
export const generateChartData = (
  categoryData: Record<string, number>,
  themeColors: ThemeColors,
  categoryType: CategoryType,
): ChartDataItem[] => {
  const entries = Object.entries(categoryData).filter(
    ([_, value]) => value > 0,
  );
  const total = entries.reduce((sum, [_, value]) => sum + value, 0);

  if (total === 0) return [];

  // Sort by amount descending
  const sortedEntries = entries.sort((a, b) => b[1] - a[1]);

  // Take top categories
  const topCategories = sortedEntries.slice(0, MAX_CATEGORIES);
  const otherCategories = sortedEntries.slice(MAX_CATEGORIES);

  const chartData: ChartDataItem[] = topCategories.map(
    ([category, value]) => {
      const info = getCategoryDisplayInfo(category as TransactionCategory);
      return {
        name: info.label,
        amount: value,
        color: info.color,
        legendFontColor: themeColors.chartText,
        legendFontSize: 12,
      };
    },
  );

  if (otherCategories.length > 0) {
    const othersTotal = otherCategories.reduce(
      (sum, [_, value]) => sum + value,
      0,
    );
    const otherKey: TransactionCategory =
      categoryType === "income" ? "other_income" : "other";
    const otherInfo = getCategoryDisplayInfo(otherKey);
    chartData.push({
      name: "Others",
      amount: othersTotal,
      color: otherInfo.color,
      legendFontColor: themeColors.chartText,
      legendFontSize: 12,
    });
  }

  return chartData;
};
