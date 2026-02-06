import { Text } from "@/components/Themed";
import { usePrimaryColor } from "@/contexts/ThemeContext";
import { SlidersHorizontal } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface FilterButtonProps {
  onPress?: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onPress }) => {
  const primaryColor = usePrimaryColor();

  return (
    <TouchableOpacity
      style={[styles.filterButton, { backgroundColor: primaryColor }]}
      onPress={onPress}
    >
      <SlidersHorizontal size={16} color="#fff" />
      <Text style={[styles.filterText, { color: "#fff" }]}>Filter</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default FilterButton;
