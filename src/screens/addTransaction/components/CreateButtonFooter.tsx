import { Text, useThemeColor } from "@/components/Themed";
import { usePrimaryColor } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n";
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
  label,
  icon = "add",
}: CreateButtonFooterProps) {
  const backgroundColor = useThemeColor({}, "background");
  const primaryColor = usePrimaryColor();
  const { t } = useI18n();
  const resolvedLabel = label ?? t("add.button.create");

  return (
    <View style={[styles.createButtonFooter, { backgroundColor }]}>
      <TouchableOpacity
        style={[
          styles.createButton,
          { backgroundColor: primaryColor },
          isLoading && styles.createButtonDisabled,
        ]}
        onPress={onPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <>
            <Text style={[styles.createButtonText, { color: "#000" }]}>
              {resolvedLabel}
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
