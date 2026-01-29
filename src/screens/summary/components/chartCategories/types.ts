export type Range = "day" | "week" | "month" | "year" | "all";
export type CategoryType = "income" | "spent";

export interface ChartCategoriesProps {
  startDate: Date;
  endDate: Date;
  range: Range;
  userId?: string;
}

export interface ChartDataItem {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export interface ThemeColors {
  bg: string;
  text: string;
  chartText: string;
  chartAxis: string;
  border: string;
  pickerBg: string;
}
