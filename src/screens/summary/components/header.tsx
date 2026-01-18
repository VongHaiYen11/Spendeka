import { Text } from '@/components/Themed';
import { RangeType, getDateRange } from '@/utils/getDateRange';
import {
    addDays,
    differenceInCalendarDays,
    format,
    subDays,
} from 'date-fns';
import { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  range: RangeType;
  setRange: (r: RangeType) => void;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
}

const rangeLabelMap: Record<RangeType, string> = {
  day: 'Day',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  all: 'All Time',
};

export default function HeaderSummary({
  range,
  setRange,
  currentDate,
  setCurrentDate,
}: HeaderProps) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { start, end } = getDateRange(range, currentDate);

  const options: RangeType[] = ['day', 'week', 'month', 'year', 'all'];

  const onPrev = () => {
    if (range === 'all') return;

    switch (range) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subDays(currentDate, 7));
        break;
      case 'month':
        setCurrentDate(subDays(currentDate, 30));
        break;
      case 'year':
        setCurrentDate(subDays(currentDate, 365));
        break;
    }
  };

  const onNext = () => {
    if (range === 'all') return;

    switch (range) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addDays(currentDate, 7));
        break;
      case 'month':
        setCurrentDate(addDays(currentDate, 30));
        break;
      case 'year':
        setCurrentDate(addDays(currentDate, 365));
        break;
    }
  };

  const getRangeText = () => {
    const today = new Date();

    if (range === 'all') {
      return `All time`;
    }

    if (range === 'day') {
      const diff = differenceInCalendarDays(currentDate, today);
      if (diff === 0) return 'Today';
      if (diff === -1) return 'Yesterday';
      if (diff === 1) return 'Tomorrow';
      return format(currentDate, 'dd MMM yyyy');
    }

    if (range === 'week') {
      return `${format(start!, 'dd MMM')} – ${format(end!, 'dd MMM')}`;
    }

    if (range === 'month') {
      return format(currentDate, 'MMMM yyyy');
    }

    if (range === 'year') {
      return format(currentDate, 'yyyy');
    }
  };

  return (
    <View className="relative flex-col w-full p-4">
      <View className="flex-row justify-between items-center w-full mb-1">
        <TouchableOpacity
          onPress={onPrev}
          disabled={range === 'all'}
          className={`px-4 py-2 ${range === 'all' ? 'opacity-30' : ''}`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-lg">◀</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDropdownVisible(!dropdownVisible)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
        >
          <Text className="text-gray-800 dark:text-gray-200 text-center">
            {getRangeText()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          disabled={range === 'all'}
          className={`px-4 py-2 ${range === 'all' ? 'opacity-30' : ''}`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-lg">▶</Text>
        </TouchableOpacity>
      </View>

      {dropdownVisible && (
        <View className="absolute top-full mt-4 w-36 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg z-50 self-center shadow-sm">
          <ScrollView className="w-full">
            {options.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => {
                  setRange(r);
                  setCurrentDate(new Date());
                  setDropdownVisible(false);
                }}
                className="w-full px-4 py-2 items-center"
              >
                <Text className="text-gray-800 dark:text-gray-200 text-center">
                  {rangeLabelMap[r]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
