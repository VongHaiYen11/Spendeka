import {
    EXPENSE_CATEGORIES,
    EXPENSE_CATEGORIES_EN,
    INCOME_CATEGORIES_EN,
    INCOME_CATEGORIES_VI
} from "@/models/Expense";
import type { TransactionCategory } from "@/types/transaction";
import { MAX_CATEGORIES } from "../constants";
import { CategoryType, ChartDataItem, ThemeColors } from "../types";

/**
 * Generates chart data for pie chart from category data.
 * Takes top 9 categories and groups the rest as "Others".
 * Uses each category's color from the Expense model (same in light and dark mode).
 */
export const generateChartData = (
  categoryData: Record<string, number>,
  themeColors: ThemeColors,
  categoryType: CategoryType,
  t: (key: string) => string,
  languageKey: "vie" | "eng" = "eng",
): ChartDataItem[] => {
  const entries = Object.entries(categoryData).filter(
    ([_, value]) => value > 0,
  );
  const total = entries.reduce((sum, [_, value]) => sum + value, 0);

  if (total === 0) return [];

  // Get language-aware category arrays
  const expenseCategories =
    languageKey === "vie" ? EXPENSE_CATEGORIES : EXPENSE_CATEGORIES_EN;
  const incomeCategories =
    languageKey === "vie" ? INCOME_CATEGORIES_VI : INCOME_CATEGORIES_EN;
  const categories =
    categoryType === "income" ? incomeCategories : expenseCategories;

  // Helper to get category info with language support
  const getCategoryInfo = (category: TransactionCategory) => {
    const found =
      categories.find((c) => c.value === category) ||
      (categoryType === "income"
        ? incomeCategories[incomeCategories.length - 1]
        : expenseCategories[expenseCategories.length - 1]);
    return found;
  };

  // Sort by amount descending
  const sortedEntries = entries.sort((a, b) => b[1] - a[1]);

  // Take top categories
  const topCategories = sortedEntries.slice(0, MAX_CATEGORIES);
  const otherCategories = sortedEntries.slice(MAX_CATEGORIES);

  const chartData: ChartDataItem[] = topCategories.map(([category, value]) => {
    const info = getCategoryInfo(category as TransactionCategory);
    return {
      name: info.label,
      amount: value,
      color: info.color,
      legendFontColor: themeColors.chartText,
      legendFontSize: 12,
    };
  });

  if (otherCategories.length > 0) {
    const othersTotal = otherCategories.reduce(
      (sum, [_, value]) => sum + value,
      0,
    );
    const otherKey: TransactionCategory =
      categoryType === "income" ? "other_income" : "other";
    const otherInfo = getCategoryInfo(otherKey);
    chartData.push({
      name: t("summary.chart.others"),
      amount: othersTotal,
      color: otherInfo.color,
      legendFontColor: themeColors.chartText,
      legendFontSize: 12,
    });
  }

  return chartData;
};
