import { Text, useThemeColor } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { format } from "date-fns";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";

export type TransactionType = "all" | "income" | "spent";
export type GroupBy = "none" | "month" | "year";

export interface FilterState {
  transactionType: TransactionType;
  categories: string[];
  minAmount: string;
  maxAmount: string;
  startDate: Date | null;
  endDate: Date | null;
  groupBy: GroupBy;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: FilterState) => void;
  availableCategories?: string[];
}

const TRANSACTION_TYPE_OPTIONS: Array<{
  value: TransactionType;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "spent", label: "Spent" },
];

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Rent",
  "Salary",
  "Bonus",
  "Freelance",
];

const GROUP_BY_OPTIONS: Array<{ value: GroupBy; label: string }> = [
  { value: "none", label: "None" },
  { value: "month", label: "By Month" },
  { value: "year", label: "By Year" },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  availableCategories = DEFAULT_CATEGORIES,
}) => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const isDark = backgroundColor === Colors.dark.background;

  // UI-only state - no data logic
  const [transactionType, setTransactionType] =
    useState<TransactionType>("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // UI-only handlers - no data processing
  const handleTransactionTypeChange = (type: TransactionType) => {
    setTransactionType(type);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(category);
      return isSelected
        ? prev.filter((c) => c !== category)
        : [...prev, category];
    });
  };

  const handleMinAmountChange = (value: string) => {
    setMinAmount(value);
  };

  const handleMaxAmountChange = (value: string) => {
    setMaxAmount(value);
  };

  const handleStartDateSelect = (day: DateData) => {
    setStartDate(new Date(day.timestamp));
    setShowStartCalendar(false);
  };

  const handleEndDateSelect = (day: DateData) => {
    setEndDate(new Date(day.timestamp));
    setShowEndCalendar(false);
  };

  const handleGroupByChange = (value: GroupBy) => {
    setGroupBy(value);
  };

  const handleClearStartDate = () => {
    setStartDate(null);
  };

  const handleClearEndDate = () => {
    setEndDate(null);
  };

  const handleApply = () => {
    if (onApply) {
      onApply({
        transactionType,
        categories: selectedCategories,
        minAmount,
        maxAmount,
        startDate,
        endDate,
        groupBy,
      });
    }
    onClose();
  };

  const handleReset = () => {
    setTransactionType("all");
    setSelectedCategories([]);
    setMinAmount("");
    setMaxAmount("");
    setStartDate(null);
    setEndDate(null);
    setGroupBy("month");
  };

  const handleCancel = () => {
    onClose();
  };

  const themeColors = {
    bg: isDark ? "#1f2937" : "#ffffff",
    text: textColor,
    border: isDark ? "#374151" : Colors.general.gray200,
    pickerBg: isDark ? "#111827" : Colors.general.gray100,
    activeBg: isDark ? "#3b82f6" : "#2563eb",
    inactiveBg: isDark ? "#374151" : Colors.general.gray100,
    categorySelected: isDark ? "#3b82f6" : "#2563eb",
    categoryUnselected: isDark ? "#374151" : Colors.general.gray200,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable
          style={[styles.modalContainer, { backgroundColor: themeColors.bg }]}
          onPress={() => {}}
        >
          {/* Header */}
          <View
            style={[styles.header, { borderBottomColor: themeColors.border }]}
          >
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>
              Filter Transactions
            </Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Text
                style={[styles.closeButtonText, { color: themeColors.text }]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Transaction Type Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Transaction Type
              </Text>
              <View style={styles.typeContainer}>
                {TRANSACTION_TYPE_OPTIONS.map((option) => {
                  const isActive = transactionType === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleTransactionTypeChange(option.value)}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor: isActive
                            ? themeColors.activeBg
                            : themeColors.inactiveBg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          {
                            color: isActive ? "#ffffff" : themeColors.text,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Categories Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Categories
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: themeColors.text, opacity: 0.6 },
                ]}
              >
                Select one or more categories
              </Text>
              <View style={styles.categoriesContainer}>
                {availableCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <TouchableOpacity
                      key={category}
                      onPress={() => handleCategoryToggle(category)}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected
                            ? themeColors.categorySelected
                            : themeColors.categoryUnselected,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          {
                            color: isSelected ? "#ffffff" : themeColors.text,
                          },
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Amount Range Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Amount Range
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: themeColors.text, opacity: 0.6 },
                ]}
              >
                Optional: Set minimum and maximum amounts
              </Text>
              <View style={styles.amountContainer}>
                <View style={styles.amountInputWrapper}>
                  <Text
                    style={[styles.amountLabel, { color: themeColors.text }]}
                  >
                    Min
                  </Text>
                  <TextInput
                    style={[
                      styles.amountInput,
                      {
                        backgroundColor: themeColors.pickerBg,
                        borderColor: themeColors.border,
                        color: themeColors.text,
                      },
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    value={minAmount}
                    onChangeText={handleMinAmountChange}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.amountInputWrapper}>
                  <Text
                    style={[styles.amountLabel, { color: themeColors.text }]}
                  >
                    Max
                  </Text>
                  <TextInput
                    style={[
                      styles.amountInput,
                      {
                        backgroundColor: themeColors.pickerBg,
                        borderColor: themeColors.border,
                        color: themeColors.text,
                      },
                    ]}
                    placeholder="No limit"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    value={maxAmount}
                    onChangeText={handleMaxAmountChange}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Date Range Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Date Range
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: themeColors.text, opacity: 0.6 },
                ]}
              >
                Optional: Filter by date range
              </Text>
              <View style={styles.dateContainer}>
                <View style={styles.dateInputWrapper}>
                  <Text style={[styles.dateLabel, { color: themeColors.text }]}>
                    Start Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowEndCalendar(false);
                      setShowStartCalendar(!showStartCalendar);
                    }}
                    style={[
                      styles.dateButton,
                      {
                        backgroundColor: themeColors.pickerBg,
                        borderColor: themeColors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateButtonText,
                        {
                          color: startDate
                            ? themeColors.text
                            : isDark
                              ? "#6b7280"
                              : "#9ca3af",
                        },
                      ]}
                    >
                      {startDate
                        ? format(startDate, "MMM dd, yyyy")
                        : "Select start date"}
                    </Text>
                    {startDate && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleClearStartDate();
                        }}
                        style={styles.clearButton}
                      >
                        <Text
                          style={[
                            styles.clearButtonText,
                            { color: themeColors.text },
                          ]}
                        >
                          ✕
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                  {showStartCalendar && (
                    <View style={styles.calendarContainer}>
                      <Calendar
                        current={
                          startDate?.toISOString().split("T")[0] ||
                          new Date().toISOString().split("T")[0]
                        }
                        onDayPress={handleStartDateSelect}
                        markedDates={
                          startDate
                            ? {
                                [startDate.toISOString().split("T")[0]]: {
                                  selected: true,
                                  selectedColor: themeColors.activeBg,
                                },
                              }
                            : {}
                        }
                        theme={{
                          backgroundColor: themeColors.bg,
                          calendarBackground: themeColors.bg,
                          textSectionTitleColor: isDark ? "#9ca3af" : "#6b7280",
                          dayTextColor: themeColors.text,
                          todayTextColor: themeColors.activeBg,
                          selectedDayTextColor: "#ffffff",
                          monthTextColor: themeColors.text,
                          arrowColor: themeColors.text,
                          textDisabledColor: isDark ? "#4b5563" : "#d1d5db",
                        }}
                        style={styles.calendar}
                      />
                    </View>
                  )}
                </View>
                <View style={styles.dateInputWrapper}>
                  <Text style={[styles.dateLabel, { color: themeColors.text }]}>
                    End Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowStartCalendar(false);
                      setShowEndCalendar(!showEndCalendar);
                    }}
                    style={[
                      styles.dateButton,
                      {
                        backgroundColor: themeColors.pickerBg,
                        borderColor: themeColors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateButtonText,
                        {
                          color: endDate
                            ? themeColors.text
                            : isDark
                              ? "#6b7280"
                              : "#9ca3af",
                        },
                      ]}
                    >
                      {endDate
                        ? format(endDate, "MMM dd, yyyy")
                        : "Select end date"}
                    </Text>
                    {endDate && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleClearEndDate();
                        }}
                        style={styles.clearButton}
                      >
                        <Text
                          style={[
                            styles.clearButtonText,
                            { color: themeColors.text },
                          ]}
                        >
                          ✕
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                  {showEndCalendar && (
                    <View style={styles.calendarContainer}>
                      <Calendar
                        current={
                          endDate?.toISOString().split("T")[0] ||
                          new Date().toISOString().split("T")[0]
                        }
                        onDayPress={handleEndDateSelect}
                        markedDates={
                          endDate
                            ? {
                                [endDate.toISOString().split("T")[0]]: {
                                  selected: true,
                                  selectedColor: themeColors.activeBg,
                                },
                              }
                            : {}
                        }
                        theme={{
                          backgroundColor: themeColors.bg,
                          calendarBackground: themeColors.bg,
                          textSectionTitleColor: isDark ? "#9ca3af" : "#6b7280",
                          dayTextColor: themeColors.text,
                          todayTextColor: themeColors.activeBg,
                          selectedDayTextColor: "#ffffff",
                          monthTextColor: themeColors.text,
                          arrowColor: themeColors.text,
                          textDisabledColor: isDark ? "#4b5563" : "#d1d5db",
                        }}
                        style={styles.calendar}
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Group By Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Group By
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: themeColors.text, opacity: 0.6 },
                ]}
              >
                How to organize transactions
              </Text>
              <View style={styles.typeContainer}>
                {GROUP_BY_OPTIONS.map((option) => {
                  const isActive = groupBy === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleGroupByChange(option.value)}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor: isActive
                            ? themeColors.activeBg
                            : themeColors.inactiveBg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          {
                            color: isActive ? "#ffffff" : themeColors.text,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={[
              styles.footer,
              { borderTopColor: themeColors.border, paddingBottom: 20 },
            ]}
          >
            <TouchableOpacity
              onPress={handleReset}
              style={[
                styles.resetButton,
                { backgroundColor: themeColors.inactiveBg },
              ]}
            >
              <Text
                style={[styles.resetButtonText, { color: themeColors.text }]}
              >
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={[
                styles.cancelButton,
                { backgroundColor: themeColors.inactiveBg },
              ]}
            >
              <Text
                style={[styles.cancelButtonText, { color: themeColors.text }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={[
                styles.applyButton,
                { backgroundColor: themeColors.activeBg },
              ]}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    flexDirection: "column",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "300",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  amountContainer: {
    flexDirection: "row",
    gap: 12,
  },
  amountInputWrapper: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  amountInput: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
  },
  dateContainer: {
    gap: 12,
  },
  dateInputWrapper: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateButtonText: {
    fontSize: 15,
    flex: 1,
  },
  clearButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "300",
  },
  calendarContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  calendar: {
    borderRadius: 8,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export default FilterModal;
