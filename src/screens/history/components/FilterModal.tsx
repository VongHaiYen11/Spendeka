import { Text, useThemeColor } from "@/components/Themed";
import Colors, { PRIMARY_COLOR } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, isToday } from "date-fns";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

export interface CategoryOption {
  value: string;
  label: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: FilterState) => void;
  /** Current filters to show when modal opens (syncs modal state when visible) */
  initialFilters?: FilterState | null;
  /** Expense category options (shown when type is "spent") */
  expenseCategoryOptions?: CategoryOption[];
  /** Income category options (shown when type is "income") */
  incomeCategoryOptions?: CategoryOption[];
}

const TRANSACTION_TYPE_OPTIONS: Array<{
  value: TransactionType;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "spent", label: "Spent" },
];

const DEFAULT_EXPENSE_OPTIONS: CategoryOption[] = [
  { value: "food", label: "Food" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other" },
];

const DEFAULT_INCOME_OPTIONS: CategoryOption[] = [
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "other_income", label: "Other" },
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
  initialFilters = null,
  expenseCategoryOptions = DEFAULT_EXPENSE_OPTIONS,
  incomeCategoryOptions = DEFAULT_INCOME_OPTIONS,
}) => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const isDark = backgroundColor === Colors.dark.background;
  const colorScheme = useColorScheme();
  const themeVariant = colorScheme === "dark" ? "dark" : "light";

  const [transactionType, setTransactionType] =
    useState<TransactionType>("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const prevVisibleRef = useRef(false);
  useEffect(() => {
    const justOpened = visible && !prevVisibleRef.current;
    prevVisibleRef.current = visible;
    if (justOpened && initialFilters) {
      setTransactionType(initialFilters.transactionType);
      setSelectedCategories(initialFilters.categories ?? []);
      setMinAmount(initialFilters.minAmount ?? "");
      setMaxAmount(initialFilters.maxAmount ?? "");
      setStartDate(initialFilters.startDate ?? null);
      setEndDate(initialFilters.endDate ?? null);
      setGroupBy(initialFilters.groupBy ?? "month");
    }
  }, [visible, initialFilters]);

  // Categories to show based on selected transaction type
  const displayedCategories = useMemo(() => {
    if (transactionType === "spent") return expenseCategoryOptions;
    if (transactionType === "income") return incomeCategoryOptions;
    return [...expenseCategoryOptions, ...incomeCategoryOptions];
  }, [transactionType, expenseCategoryOptions, incomeCategoryOptions]);

  // When transaction type changes, keep only selected categories that are in the new list
  const handleTransactionTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    setSelectedCategories((prev) => {
      const nextList =
        type === "spent"
          ? expenseCategoryOptions
          : type === "income"
            ? incomeCategoryOptions
            : [...expenseCategoryOptions, ...incomeCategoryOptions];
      const values = new Set(nextList.map((o) => o.value));
      return prev.filter((c) => values.has(c));
    });
  };

  const handleCategoryToggle = (value: string) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(value);
      return isSelected
        ? prev.filter((c) => c !== value)
        : [...prev, value];
    });
  };

  const handleMinAmountChange = (value: string) => {
    setMinAmount(value);
  };

  const handleMaxAmountChange = (value: string) => {
    setMaxAmount(value);
  };

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
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
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
            bounces={true}
            keyboardShouldPersistTaps="handled"
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
                {displayedCategories.map((opt) => {
                  const isSelected = selectedCategories.includes(opt.value);
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => handleCategoryToggle(opt.value)}
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
                        {opt.label}
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
                    onPress={() => setShowStartDatePicker(true)}
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
                        ? isToday(startDate)
                          ? "Today"
                          : format(startDate, "MMM d, yyyy")
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
                  {showStartDatePicker && (
                    <View style={styles.inlineDatePickerWrap}>
                      <DateTimePicker
                        value={startDate || new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(_, date) => {
                          if (date) {
                            handleStartDateChange(date);
                            if (Platform.OS === "android") setShowStartDatePicker(false);
                          }
                        }}
                        maximumDate={new Date()}
                        themeVariant={themeVariant}
                        style={Platform.OS === "android" ? styles.androidDatePicker : undefined}
                      />
                      {Platform.OS === "ios" && (
                        <TouchableOpacity
                          onPress={() => setShowStartDatePicker(false)}
                          style={styles.inlineDatePickerDone}
                        >
                          <Text style={[styles.inlineDatePickerDoneText, { color: PRIMARY_COLOR }]}>
                            Done
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.dateInputWrapper}>
                  <Text style={[styles.dateLabel, { color: themeColors.text }]}>
                    End Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(true)}
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
                        ? isToday(endDate)
                          ? "Today"
                          : format(endDate, "MMM d, yyyy")
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
                  {showEndDatePicker && (
                    <View style={styles.inlineDatePickerWrap}>
                      <DateTimePicker
                        value={endDate || new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(_, date) => {
                          if (date) {
                            handleEndDateChange(date);
                            if (Platform.OS === "android") setShowEndDatePicker(false);
                          }
                        }}
                        maximumDate={new Date()}
                        themeVariant={themeVariant}
                        style={Platform.OS === "android" ? styles.androidDatePicker : undefined}
                      />
                      {Platform.OS === "ios" && (
                        <TouchableOpacity
                          onPress={() => setShowEndDatePicker(false)}
                          style={styles.inlineDatePickerDone}
                        >
                          <Text style={[styles.inlineDatePickerDoneText, { color: PRIMARY_COLOR }]}>
                            Done
                          </Text>
                        </TouchableOpacity>
                      )}
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
    width: "100%",
    height: "90%",
    maxHeight: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "column",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
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
  inlineDatePickerWrap: {
    marginTop: 8,
    alignItems: "center",
  },
  androidDatePicker: {
    alignSelf: "center",
  },
  inlineDatePickerDone: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: "flex-end",
  },
  inlineDatePickerDoneText: {
    fontSize: 16,
    fontWeight: "600",
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
