import { Text, useThemeColor } from "@/components/Themed";
import { PRIMARY_COLOR } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateButtonFooterProps {
  onPress: () => void;
  isLoading: boolean;
  /** Default "Create Transaction". Use "Update" for edit mode. */
  label?: string;
  /** Icon name. Default "add" for create, use "checkmark" for update. */
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function CreateButtonFooter({
  onPress,
  isLoading,
  label = "Create Transaction",
  icon = "add",
}: CreateButtonFooterProps) {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <View style={[styles.createButtonFooter, { backgroundColor }]}>
      <TouchableOpacity
        style={[styles.createButton, isLoading && styles.createButtonDisabled]}
        onPress={onPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <>
            <Text style={[styles.createButtonText, { color: "#000" }]}>
              {label}
            </Text>
            <Ionicons name={icon} size={24} color="#000" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  createButtonFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: "700",
  },
});
