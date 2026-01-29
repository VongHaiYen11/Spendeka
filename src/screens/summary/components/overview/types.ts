export type Range = 'day' | 'week' | 'month' | 'year' | 'all';
export type ChartType = 'income' | 'spent' | 'all';

export interface ThemeColors {
  bg: string;
  text: string;
  border: string;
  pickerBg: string;
  chartText: string;
  chartLine: string;
  chartAxis: string;
}

export interface OverviewProps {
  startDate: Date;
  endDate: Date;
  range: Range;
}

export interface AggregatedBucket {
  label: string;
  income: number;
  spent: number;
}
