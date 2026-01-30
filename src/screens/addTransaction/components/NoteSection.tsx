import { Text, useThemeColor } from "@/components/Themed";
import { PRIMARY_COLOR } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface NoteSectionProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function NoteSection({ value, onChangeText }: NoteSectionProps) {
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const placeholderColor = useThemeColor({}, "placeholder");

  return (
    <View style={[styles.noteSection, { backgroundColor: cardColor }]}>
      <View style={styles.noteLabelRow}>
        <Ionicons
          name="document-text-outline"
          size={22}
          color={PRIMARY_COLOR}
        />
        <Text style={[styles.rowLabel, { color: textColor }]}>Note</Text>
      </View>
      <TextInput
        style={[styles.noteInputArea, { color: textColor }]}
        placeholder="Add a note..."
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChangeText}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  noteSection: {
    marginTop: 14,
    width: "100%",
    borderRadius: 12,
    padding: 14,
  },
  noteLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  noteInputArea: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 72,
    textAlignVertical: "top",
  },
});
