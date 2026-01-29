import { COLOR_SHADES_COUNT, MAX_CATEGORIES } from "../constants";
import { ChartDataItem, ThemeColors } from "../types";
import { generateColorShades } from "./colorUtils";

/**
 * Generates chart data for pie chart from category data
 * Takes top 9 categories and groups the rest as "Others"
 */
export const generateChartData = (
  categoryData: Record<string, number>,
  themeColors: ThemeColors,
  tintColor: string,
  isDark: boolean,
): ChartDataItem[] => {
  const entries = Object.entries(categoryData).filter(
    ([_, value]) => value > 0,
  );
  const total = entries.reduce((sum, [_, value]) => sum + value, 0);

  if (total === 0) return [];

  // Sort by amount descending
  const sortedEntries = entries.sort((a, b) => b[1] - a[1]);

  // Generate color shades for smooth distribution
  const colorShades = generateColorShades(
    tintColor,
    COLOR_SHADES_COUNT,
    isDark,
  );

  // Take top categories
  const topCategories = sortedEntries.slice(0, MAX_CATEGORIES);
  const otherCategories = sortedEntries.slice(MAX_CATEGORIES);

  // Map top categories with colors (use first N shades)
  const chartData: ChartDataItem[] = topCategories.map(
    ([category, value], index) => ({
      name: category,
      amount: value,
      color: colorShades[index],
      legendFontColor: themeColors.chartText,
      legendFontSize: 12,
    }),
  );

  // Add "others" category if there are more than MAX_CATEGORIES
  if (otherCategories.length > 0) {
    const othersTotal = otherCategories.reduce(
      (sum, [_, value]) => sum + value,
      0,
    );
    chartData.push({
      name: "Others",
      amount: othersTotal,
      color: colorShades[MAX_CATEGORIES], // Use the last shade for "others"
      legendFontColor: themeColors.chartText,
      legendFontSize: 12,
    });
  }

  return chartData;
};
