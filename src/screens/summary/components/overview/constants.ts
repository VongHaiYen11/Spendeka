import Colors from '@/constants/Colors';
import { ChartType } from './types';

export const INCOME_COLOR = Colors.general.income;
export const SPENT_COLOR = Colors.general.spent;
export const MONTH_ABBREVIATIONS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export const TYPE_OPTIONS: Array<{ label: string; value: ChartType }> = [
  { label: 'All', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Spent', value: 'spent' },
];
