export type Range = 'day' | 'week' | 'month' | 'year' | 'all';
export type ChartType = 'income' | 'spent' | 'all';

export interface OverviewProps {
  startDate: Date;
  endDate: Date;
  range: Range;
  userId?: string;
}

export interface AggregatedBucket {
  label: string;
  income: number;
  spent: number;
}
