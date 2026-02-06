import { Text, useThemeColor } from "@/components/Themed";
import { usePrimaryColor } from "@/contexts/ThemeContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import DateTimePicker, {
    AndroidNativeProps,
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import React, { useEffect } from "react";
import {
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onChange: (date: Date) => void;
}

export default function DatePickerModal({
  visible,
  value,
  onClose,
  onChange,
}: DatePickerModalProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = usePrimaryColor();
  const colorScheme = useColorScheme();
  const themeVariant = colorScheme === "dark" ? "dark" : "light";

  // On Android, use the native dialog API instead of our custom Modal.
  // This avoids the bug where users have to tap the OK button many times
  // for the selected date to be applied.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (!visible) return;

    DateTimePickerAndroid.open({
      value,
      mode: "date",
      display: "default",
      maximumDate: new Date(),
      themeVariant,
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          onChange(selectedDate);
        }
        // Close the wrapper modal state regardless of confirm/cancel
        onClose();
      },
    } as AndroidNativeProps);
  }, [visible, value, onChange, onClose, themeVariant]);

  // Android dialog is handled via DateTimePickerAndroid above
  if (Platform.OS === "android") {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.dateModalContent, { backgroundColor }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.dateModalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Select Date
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.dateModalDoneButton}
            >
              <Text style={[styles.modalCloseText, { color: primaryColor }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={value}
            mode="date"
            display="spinner"
            onChange={(_, date) => {
              if (date) onChange(date);
            }}
            maximumDate={new Date()}
            themeVariant={themeVariant}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  dateModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateModalDoneButton: {
    padding: 8,
  },
  datePickerAndroid: {
    alignSelf: "center",
  },
});
