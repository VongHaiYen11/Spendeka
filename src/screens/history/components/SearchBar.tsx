import Colors from '@/constants/Colors';
import { useThemeColor } from '@/components/Themed';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const isDark = backgroundColor === Colors.dark.background;

  return (
    <View style={[styles.searchBar, { backgroundColor: isDark ? '#1f2937' : Colors.general.gray100 }]}>
      <Search size={16} color={isDark ? '#9ca3af' : Colors.general.gray600} style={styles.searchIcon} />
      <TextInput
        style={[styles.searchInput, { color: textColor }]}
        placeholder="Search"
        placeholderTextColor={isDark ? '#9ca3af' : Colors.general.gray600}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
});

export default SearchBar;
