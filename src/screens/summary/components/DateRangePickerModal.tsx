import MonthYearPicker from '@/screens/summary/components/MonthYearPicker';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RangeType } from '@/utils/getDateRange';
import {
  endOfWeek,
  startOfWeek
} from 'date-fns';
import { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface DateRangePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (range: RangeType, date: Date) => void;
  currentRange: RangeType;
  currentDate: Date;
}

const rangeOptions: { value: RangeType; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All' },
];

export default function DateRangePickerModal({
  visible,
  onClose,
  onApply,
  currentRange,
  currentDate,
}: DateRangePickerModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedRange, setSelectedRange] = useState<RangeType>(currentRange);
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [showQuickPicker, setShowQuickPicker] = useState<boolean>(false);


  // Initialize state when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedRange(currentRange);
      setSelectedDate(currentDate);
      updateMarkedDates(currentRange, currentDate);
      setShowQuickPicker(false);
    }
  }, [visible, currentRange, currentDate]);

  // Update marked dates when range or date changes
  useEffect(() => {
    updateMarkedDates(selectedRange, selectedDate);
  }, [selectedRange, selectedDate]);

  const updateMarkedDates = (range: RangeType, date: Date) => {
    if (range === 'all' || range === 'month' || range === 'year') {
      setMarkedDates({});
      return;
    }

    let start: Date;
    let end: Date;

    switch (range) {
      case 'day':
        start = date;
        end = date;
        break;
      case 'week':
        start = startOfWeek(date, { weekStartsOn: 1 });
        end = endOfWeek(date, { weekStartsOn: 1 });
        break;
      default:
        setMarkedDates({});
        return;
    }

    const marked: Record<string, any> = {};
    const current = new Date(start);

    while (current <= end) {
      const dateString = current.toISOString().split('T')[0];
      if (range === 'day') {
        marked[dateString] = {
          selected: true,
          selectedColor: isDark ? '#3b82f6' : '#2563eb',
        };
      } else {
        const isStart = current.getTime() === start.getTime();
        const isEnd = current.getTime() === end.getTime();
        marked[dateString] = {
          startingDay: isStart,
          endingDay: isEnd,
          color: isDark ? '#3b82f6' : '#2563eb',
          textColor: '#fff',
        };
      }
      current.setDate(current.getDate() + 1);
    }

    setMarkedDates(marked);
  };

  const handleDateSelect = (day: DateData) => {
    const newDate = new Date(day.timestamp);
    setSelectedDate(newDate);
  };

  const handleApply = () => {
    onApply(selectedRange, selectedDate);
    onClose();
  };

  const handleCancel = () => {
    // Reset to original values
    setSelectedRange(currentRange);
    setSelectedDate(currentDate);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleCancel}
      >
        <TouchableOpacity
          style={[
            styles.modalContainer,
            isDark ? styles.modalContainerDark : styles.modalContainerLight,
          ]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View
            className={`flex-row justify-between items-center pb-4 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <Text
              className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Select Date Range
            </Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Range Type Tabs */}
          <View className="flex-row mt-4 mb-4">
            {rangeOptions.map((option) => {
              const isActive = selectedRange === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSelectedRange(option.value)}
                  className={`flex-1 py-2 px-3 mx-1 rounded-lg ${
                    isActive
                      ? isDark
                        ? 'bg-blue-600'
                        : 'bg-blue-500'
                      : isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${
                      isActive
                        ? 'text-white'
                        : isDark
                        ? 'text-gray-300'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Calendar for day and week */}
          {(selectedRange === 'day' || selectedRange === 'week') && (
            <View className="mb-4">
              <Calendar
                current={selectedDate.toISOString().split('T')[0]}
                onDayPress={handleDateSelect}
                markedDates={markedDates}
                theme={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  calendarBackground: isDark ? '#1f2937' : '#ffffff',
              
                  textSectionTitleColor: isDark ? '#9ca3af' : '#6b7280',
                  dayTextColor: isDark ? '#e5e7eb' : '#111827',
                  todayTextColor: '#3b82f6',
                  selectedDayTextColor: '#ffffff',
              
                  monthTextColor: isDark ? '#ffffff' : '#111827',
                  arrowColor: isDark ? '#ffffff' : '#111827',
              
                  textDisabledColor: isDark ? '#4b5563' : '#d1d5db',
              
                  dotColor: '#3b82f6',
                  selectedDotColor: '#ffffff',
                }}
                markingType={selectedRange === 'week' ? 'period' : undefined}
                renderHeader={(date) => {
                  const d = new Date(date);
                  const month = d.toLocaleString('default', { month: 'long' });
                  const year = d.getFullYear();
              
                  return (
                    <TouchableOpacity
                      onPress={() => setShowQuickPicker(!showQuickPicker)}
                      className="flex-row justify-center items-center py-2"
                      activeOpacity={0.7}
                    >
                      <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {month} {year}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                style={styles.calendar}
              />
              {showQuickPicker && (
                <View className="mb-4 mt-2">
                  <MonthYearPicker
                    type="combined"
                    selectedDate={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                    }}
                  />
                </View>
              )}
            </View>
          )}

          {/* Month Picker */}
          {selectedRange === 'month' && (
            <View className="mb-4">
              <MonthYearPicker
                type="combined"
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
              />
            </View>
          )}

          {/* Year Picker */}
          {selectedRange === 'year' && (
            <View className="mb-4">
              <MonthYearPicker
                type="year"
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
              />
            </View>
          )}

          {/* All time message */}
          {selectedRange === 'all' && (
            <View className="mb-4 py-8 items-center">
              <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                All time range selected
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={handleCancel}
              className={`flex-1 py-3 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              className={`flex-1 py-3 rounded-lg ${
                isDark ? 'bg-blue-600' : 'bg-blue-500'
              }`}
            >
              <Text className="text-center font-medium text-white">Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainerLight: {
    backgroundColor: '#ffffff',
  },
  modalContainerDark: {
    backgroundColor: '#1f2937',
  },
  calendar: {
    borderRadius: 8,
    overflow: 'hidden',
  },
});
