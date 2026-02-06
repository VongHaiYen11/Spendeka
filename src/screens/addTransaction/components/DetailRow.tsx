import { Text, useThemeColor } from "@/components/Themed";
import { usePrimaryColor } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
}

export default function DetailRow({
  icon,
  label,
  value,
  onPress,
}: DetailRowProps) {
  const primaryColor = usePrimaryColor();
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const placeholderColor = useThemeColor({}, "placeholder");

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: cardColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} color={primaryColor} />
        <Text style={[styles.rowLabel, { color: textColor }]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text
          style={[styles.rowValue, { color: textColor }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={placeholderColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 14,
    width: "100%",
    borderRadius: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "left",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  rowValue: {
    fontSize: 16,
    flex: 1,
    minWidth: 0,
    textAlign: "right",
  },
});
