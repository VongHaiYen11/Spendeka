import { useThemeColor } from "@/components/Themed";
import { usePrimaryColor } from "@/contexts/ThemeContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useI18n } from "@/i18n";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface TimePickerModalProps {
  visible: boolean;
  hour: number; // Hour (0-23)
  minute: number; // Minute (0-59)
  onClose: () => void;
  onConfirm: (hour: number, minute: number) => void;
}

export default function TimePickerModal({
  visible,
  hour,
  minute,
  onClose,
  onConfirm,
}: TimePickerModalProps) {
  const { t } = useI18n();
  const primaryColor = usePrimaryColor();
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const previousVisibleRef = useRef(false);
  const previousHourRef = useRef(hour);
  const previousMinuteRef = useRef(minute);

  // Convert hour and minute to Date object
  const [selectedTime, setSelectedTime] = useState(() => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  });

  // Reset selectedTime when modal first opens or hour/minute props change
  useEffect(() => {
    const wasVisible = previousVisibleRef.current;
    const previousHour = previousHourRef.current;
    const previousMinute = previousMinuteRef.current;

    previousVisibleRef.current = visible;
    previousHourRef.current = hour;
    previousMinuteRef.current = minute;

    if (visible && !wasVisible) {
      // Modal just opened - reset to current value
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      setSelectedTime(date);
    } else if (
      visible &&
      (hour !== previousHour || minute !== previousMinute)
    ) {
      // Modal is open and hour/minute props changed - update
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      setSelectedTime(date);
    }
  }, [hour, minute, visible]);

  const handleConfirm = () => {
    const selectedHour = selectedTime.getHours();
    const selectedMinute = selectedTime.getMinutes();
    onConfirm(selectedHour, selectedMinute);
    onClose();
  };

  if (Platform.OS === "android") {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.androidOverlay}>
          <View style={[styles.androidContainer, { backgroundColor }]}>
            <Text style={[styles.androidTitle, { color: textColor }]}>
              {t("settings.reminder.selectTime")}
            </Text>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="clock"
              onChange={(event, date) => {
                if (event.type === "set" && date) {
                  setSelectedTime(date);
                  const selectedHour = date.getHours();
                  const selectedMinute = date.getMinutes();
                  onConfirm(selectedHour, selectedMinute);
                  onClose();
                } else {
                  onClose();
                }
              }}
              themeVariant={colorScheme === "dark" ? "dark" : "light"}
            />
          </View>
        </View>
      </Modal>
    );
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
          style={[styles.modalContent, { backgroundColor }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {t("settings.reminder.selectTime")}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={[styles.cancelButtonText, { color: textColor }]}>
                {t("settings.reminder.cancel")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="spinner"
              onChange={(event, date) => {
                if (date) {
                  setSelectedTime(new Date(date));
                }
              }}
              themeVariant={colorScheme === "dark" ? "dark" : "light"}
            />
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: primaryColor }]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>
              {t("settings.reminder.confirm")}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  pickerContainer: {
    marginVertical: 20,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  confirmButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },
  androidOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  androidContainer: {
    borderRadius: 12,
    padding: 20,
    minWidth: 300,
  },
  androidTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
});
