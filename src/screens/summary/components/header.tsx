import { Text } from '@/components/Themed';
import DateRangePickerModal from '@/screens/summary/components/DateRangePickerModal';
import { RangeType, getDateRange } from '@/utils/getDateRange';
import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  isSameMonth,
  isSameYear,
  subDays,
} from 'date-fns';
import { useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  range: RangeType;
  setRange: (r: RangeType) => void;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
}

export default function HeaderSummary({
  range,
  setRange,
  currentDate,
  setCurrentDate,
}: HeaderProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { start, end } = getDateRange(range, currentDate);
  const today = new Date();

  // Check if the current date range includes today
  const includesToday = useMemo(() => {
    if (range === 'all') return true; // 'all' always includes today
    
    if (!start || !end) return false;
    
    // For day: check if currentDate is today
    if (range === 'day') {
      return isSameDay(currentDate, today);
    }
    
    // For week, month, year: check if today is within the date range
    // Today should be >= start and <= end
    const todayStartOfDay = new Date(today);
    todayStartOfDay.setHours(0, 0, 0, 0);
    
    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);
    
    return todayStartOfDay >= startOfDay && todayStartOfDay <= endOfDay;
  }, [range, currentDate, start, end]);

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
          onPress={() => setModalVisible(true)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
        >
          <Text className="text-gray-800 dark:text-gray-200 text-center">
            {getRangeText()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          disabled={range === 'all' || includesToday}
          className={`px-4 py-2 ${range === 'all' || includesToday ? 'opacity-30' : ''}`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-lg">▶</Text>
        </TouchableOpacity>
      </View>

      <DateRangePickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApply={(newRange, newDate) => {
          setRange(newRange);
          setCurrentDate(newDate);
        }}
        currentRange={range}
        currentDate={currentDate}
      />
    </View>
  );
}
