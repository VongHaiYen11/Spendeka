import { Text, useThemeColor } from "@/components/Themed";
import {
    ACCENT_OPTIONS,
    getAccentPrimary,
    type AccentKey,
} from "@/constants/AccentColors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useI18n } from "@/i18n";
import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface AccentColorPickerModalProps {
  visible: boolean;
  currentAccentKey: AccentKey;
  onClose: () => void;
  onSelect: (key: AccentKey) => void;
}

export default function AccentColorPickerModal({
  visible,
  currentAccentKey,
  onClose,
  onSelect,
}: AccentColorPickerModalProps) {
  const { t } = useI18n();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const colorScheme = useColorScheme();

  // Map accent keys to translation keys
  const getColorName = (key: AccentKey): string => {
    const colorMap: Record<AccentKey, string> = {
      yellow: t("settings.accentColor.yellow"),
      green: t("settings.accentColor.green"),
      pink: t("settings.accentColor.pink"),
      blue: t("settings.accentColor.blue"),
      red: t("settings.accentColor.red"),
      orange: t("settings.accentColor.orange"),
      neutral: t("settings.accentColor.blue"), // fallback
    };
    return colorMap[key] || key;
  };

  const handleSelect = (key: AccentKey) => {
    onSelect(key);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.content, { backgroundColor }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              {t("settings.accentColor.title")}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.doneButton}>
              <Text style={[styles.doneText, { color: textColor }]}>
                {t("settings.accentColor.done")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {ACCENT_OPTIONS.map((option) => {
              const primary = getAccentPrimary(option.id, colorScheme);
              const isSelected = currentAccentKey === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                    isSelected && { borderColor: primary },
                  ]}
                  onPress={() => handleSelect(option.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.colorCircle, { backgroundColor: primary }]}
                  />
                  <Text style={[styles.optionName, { color: textColor }]}>
                    {getColorName(option.id)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  doneText: {
    fontSize: 16,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  option: {
    width: "30%",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: {
    borderWidth: 2,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  optionName: {
    fontSize: 14,
    fontWeight: "500",
  },
});
