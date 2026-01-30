import { Text, useThemeColor } from "@/components/Themed";
import { PRIMARY_COLOR } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
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
  const colorScheme = useColorScheme();
  const themeVariant = colorScheme === "dark" ? "dark" : "light";

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
              <Text style={[styles.modalCloseText, { color: PRIMARY_COLOR }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={value}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "calendar"}
            onChange={(_, date) => {
              if (date) onChange(date);
            }}
            maximumDate={new Date()}
            themeVariant={themeVariant}
            style={
              Platform.OS === "android" ? styles.datePickerAndroid : undefined
            }
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
