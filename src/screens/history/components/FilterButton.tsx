import { Text, useThemeColor } from '@/components/Themed';
import Colors from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';

interface FilterButtonProps {
  onPress?: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onPress }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const isDark = backgroundColor === Colors.dark.background;

  // Determine text color based on tint color brightness
  // Light mode: tint is blue (#2f95dc) - use white text
  // Dark mode: tint is white (#fff) - use dark text
  const textColor = isDark ? Colors.general.gray900 : '#FFFFFF';

  return (
    <TouchableOpacity
      style={[styles.filterButton, { backgroundColor: tintColor }]}
      onPress={onPress}
    >
      <SlidersHorizontal size={16} color={textColor} />
      <Text style={[styles.filterText, { color: textColor }]}>Filter</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FilterButton;
