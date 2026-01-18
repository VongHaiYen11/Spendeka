import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface MonthYearPickerProps {
  type: 'month' | 'year' | 'combined';
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

const ITEM_HEIGHT = 50;
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Memoized picker item component for better performance
interface PickerItemProps {
  item: string;
  index: number;
  selectedIndex: number;
  isDark: boolean;
}

const PickerItem = React.memo<PickerItemProps>(
  ({ item, index, selectedIndex, isDark }) => {
    const isSelected = index === selectedIndex;
    const distance = Math.abs(index - selectedIndex);
    const opacity = Math.max(0.4, 1 - distance * 0.15);
    const scale = Math.max(0.9, 1 - distance * 0.05);

    return (
      <View style={[styles.item, { height: ITEM_HEIGHT }]}>
        <Text
          style={[
            styles.itemText,
            {
              color: isDark ? '#f3f4f6' : '#111827',
              opacity,
              fontSize: isSelected ? 20 : 16,
              fontWeight: isSelected ? '700' : '400',
              transform: [{ scale }],
            },
          ]}
        >
          {item}
        </Text>
      </View>
    );
  }
);

PickerItem.displayName = 'PickerItem';

export default function MonthYearPicker({
  type,
  selectedDate,
  onSelect,
}: MonthYearPickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const monthScrollRef = useRef<ScrollView | null>(null);
  const yearScrollRef = useRef<ScrollView | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize years array to avoid recalculation
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 41 }, (_, i) => currentYear - 20 + i);
  }, []);

  const selectedMonthIndex = selectedDate.getMonth();
  const selectedYearIndex = useMemo(
    () => years.indexOf(selectedDate.getFullYear()),
    [years, selectedDate]
  );

  const scrollToIndex = useCallback(
    (scrollRef: React.RefObject<ScrollView | null>, index: number) => {
      if (scrollRef.current && containerHeight > 0) {
        const offset = index * ITEM_HEIGHT;
        scrollRef.current.scrollTo({ y: offset, animated: false });
      }
    },
    [containerHeight]
  );

  useEffect(() => {
    if (containerHeight > 0 && !isScrolling) {
      scrollToIndex(monthScrollRef, selectedMonthIndex);
      if (type === 'combined' || type === 'year') {
        scrollToIndex(yearScrollRef, selectedYearIndex);
      }
    }
  }, [selectedMonthIndex, selectedYearIndex, containerHeight, isScrolling, type, scrollToIndex]);

  const handleScroll = useCallback(
    (
      event: NativeSyntheticEvent<NativeScrollEvent>,
      scrollType: 'month' | 'year'
    ) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Only update after scroll ends (debounced)
      scrollTimeoutRef.current = setTimeout(() => {
        const newDate = new Date(selectedDate);
        
        if (scrollType === 'month' && index >= 0 && index < MONTHS.length) {
          newDate.setMonth(index);
          onSelect(newDate);
        } else if (scrollType === 'year' && index >= 0 && index < years.length) {
          newDate.setFullYear(years[index]);
          onSelect(newDate);
        }
        
        setIsScrolling(false);
      }, 150); // Wait 150ms after scroll stops
    },
    [selectedDate, onSelect, years]
  );

  const handleMomentumScrollEnd = useCallback(
    (
      event: NativeSyntheticEvent<NativeScrollEvent>,
      scrollType: 'month' | 'year'
    ) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      
      // Snap to nearest item
      const scrollRef = scrollType === 'month' ? monthScrollRef : yearScrollRef;
      if (scrollRef.current) {
        const targetOffset = index * ITEM_HEIGHT;
        scrollRef.current.scrollTo({ y: targetOffset, animated: true });
      }

      // Update immediately on momentum end
      const newDate = new Date(selectedDate);
      if (scrollType === 'month' && index >= 0 && index < MONTHS.length) {
        newDate.setMonth(index);
        onSelect(newDate);
      } else if (scrollType === 'year' && index >= 0 && index < years.length) {
        newDate.setFullYear(years[index]);
        onSelect(newDate);
      }
      
      setIsScrolling(false);
    },
    [selectedDate, onSelect, years]
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setContainerHeight(height);
    }
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  const renderPicker = useCallback(
    (
      items: string[],
      selectedIndex: number,
      scrollRef: React.RefObject<ScrollView | null>,
      scrollType: 'month' | 'year'
    ) => {
      const paddingVertical = (containerHeight - ITEM_HEIGHT) / 2;
      
      return (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="center"
          decelerationRate="fast"
          onScroll={(e) => handleScroll(e, scrollType)}
          onScrollBeginDrag={handleScrollBeginDrag}
          onMomentumScrollEnd={(e) => handleMomentumScrollEnd(e, scrollType)}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingVertical,
          }}
          style={{ flex: 1 }}
          removeClippedSubviews={true}
        >
          {items.map((item, index) => (
            <PickerItem
              key={index}
              item={item}
              index={index}
              selectedIndex={selectedIndex}
              isDark={isDark}
            />
          ))}
        </ScrollView>
      );
    },
    [containerHeight, handleScroll, handleScrollBeginDrag, handleMomentumScrollEnd, isDark]
  );

  // Memoize years as strings to avoid recalculation
  const yearsAsStrings = useMemo(() => years.map(String), [years]);

  // Memoize overlay styles
  const overlayTop = useMemo(
    () => (containerHeight - ITEM_HEIGHT) / 2,
    [containerHeight]
  );

  const overlayStyle = useMemo(
    () => ({
      top: overlayTop,
      backgroundColor: isDark
        ? 'rgba(59, 130, 246, 0.1)'
        : 'rgba(37, 99, 235, 0.1)',
      borderTopColor: isDark ? '#3b82f6' : '#2563eb',
      borderBottomColor: isDark ? '#3b82f6' : '#2563eb',
    }),
    [overlayTop, isDark]
  );

  if (type === 'combined') {
    return (
      <View style={styles.combinedContainer} onLayout={handleLayout}>
        {/* Selection indicator overlay */}
        <View
          style={[styles.selectionOverlay, overlayStyle]}
          pointerEvents="none"
        />

        {/* Month Picker */}
        <View style={styles.pickerColumn}>
          {renderPicker(MONTHS, selectedMonthIndex, monthScrollRef, 'month')}
        </View>

        {/* Year Picker */}
        <View style={styles.pickerColumn}>
          {renderPicker(yearsAsStrings, selectedYearIndex, yearScrollRef, 'year')}
        </View>
      </View>
    );
  }

  const items = useMemo(
    () => (type === 'month' ? MONTHS : yearsAsStrings),
    [type, yearsAsStrings]
  );
  const selectedIndex = type === 'month' ? selectedMonthIndex : selectedYearIndex;
  const scrollRef = type === 'month' ? monthScrollRef : yearScrollRef;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Selection indicator overlay */}
      <View
        style={[styles.selectionOverlay, overlayStyle]}
        pointerEvents="none"
      />

      {renderPicker(items, selectedIndex, scrollRef, type)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    position: 'relative',
    overflow: 'hidden',
  },
  combinedContainer: {
    height: 250,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  pickerColumn: {
    flex: 1,
    position: 'relative',
  },
  selectionOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 1,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
});
