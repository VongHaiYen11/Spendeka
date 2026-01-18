import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

type RangeType = 'day' | 'week' | 'month' | 'year' | 'all';
export type { RangeType };
export function getDateRange(range: RangeType, currentDate: Date) {
  switch (range) {
    case 'day':
      return { start: currentDate, end: currentDate };

    case 'week':
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      };

    case 'month':
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      };

    case 'year':
      return {
        start: startOfYear(currentDate),
        end: endOfYear(currentDate),
      };

    case 'all':
      return {
        start: undefined,
        end: new Date(), // hôm nay
      };
  }
}
