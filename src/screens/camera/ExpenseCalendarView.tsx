import { Text } from "@/components/Themed";
import { usePrimaryColor } from "@/contexts/ThemeContext";
import { Expense, formatAmount } from "@/models/Expense";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    View as RNView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

const { width } = Dimensions.get("window");
const IMAGE_THUMB_SIZE = (width - 40 - 2 * 10) / 3; // paddingHorizontal 20*2 + gap 10*2

interface DayGroup {
  date: Date;
  totalAmount: number;
  expenses: Expense[];
}

interface ExpenseCalendarViewProps {
  expenses: Expense[];
  onSelectExpense: (expense: Expense) => void;
}

export default function ExpenseCalendarView({
  expenses,
  onSelectExpense,
}: ExpenseCalendarViewProps) {
  const primaryColor = usePrimaryColor();
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<
    "spent" | "income"
  >("spent");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all"); // 0-11
  const [selectedDay, setSelectedDay] = useState<number | "all">("all");
  const [activeFilterField, setActiveFilterField] = useState<
    "year" | "month" | "day" | null
  >(null);

  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    expenses.forEach((expense) => {
      const date = new Date(expense.createdAt);
      years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a); // newest year first
  }, [expenses]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayGroups: DayGroup[] = useMemo(() => {
    if (expenses.length === 0) return [];

    const typeFiltered = expenses.filter((expense) => {
      const type = expense.type ?? "spent";
      return type === transactionTypeFilter;
    });

    const filteredExpenses =
      selectedYear === "all" && selectedMonth === "all" && selectedDay === "all"
        ? typeFiltered
        : typeFiltered.filter((expense) => {
            const date = new Date(expense.createdAt);
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();

            if (selectedYear !== "all" && year !== selectedYear) return false;
            if (selectedMonth !== "all" && month !== selectedMonth)
              return false;
            if (selectedDay !== "all" && day !== selectedDay) return false;
            return true;
          });

    if (filteredExpenses.length === 0) return [];

    const dayMap = new Map<string, { date: Date; expenses: Expense[] }>();

    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const key = `${year}-${month}-${day}`;

      if (!dayMap.has(key)) {
        dayMap.set(key, { date, expenses: [] });
      }
      dayMap.get(key)!.expenses.push(expense);
    });

    const groups: DayGroup[] = Array.from(dayMap.values()).map(
      ({ date, expenses: dayExpenses }) => {
        // Only sum expenses with type "spent"
        const totalAmount = dayExpenses.reduce(
          (sum, e) => sum + e.amount,
          0,
        );

        // Sort expenses so newest of the day comes first
        const sortedExpenses = [...dayExpenses].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );

        return {
          date,
          totalAmount,
          expenses: sortedExpenses,
        };
      },
    );

    // Newest day first
    groups.sort((a, b) => b.date.getTime() - a.date.getTime());

    return groups;
  }, [expenses, selectedYear, selectedMonth, selectedDay, transactionTypeFilter]);

  const formatDateLabel = (date: Date) => {
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const hasExpenses = expenses.length > 0;
  const hasDayGroups = dayGroups.length > 0;
  const isAllTime =
    selectedYear === "all" && selectedMonth === "all" && selectedDay === "all";
  const hasFilter = !isAllTime;

  const filterLabelText = (() => {
    if (isAllTime) return "Filter: All time";

    const parts: string[] = [];

    if (selectedDay !== "all") {
      parts.push(String(selectedDay));
    }

    if (selectedMonth !== "all") {
      parts.push(monthNames[selectedMonth]);
    }

    if (selectedYear !== "all") {
      parts.push(String(selectedYear));
    }

    if (parts.length === 0) {
      return "Filter: Custom";
    }

    return `Filter: ${parts.join(" ")}`;
  })();

  return (
    <RNView style={styles.container}>
      {/* Filter Bar */}
      {hasExpenses && (
        <RNView style={styles.filterBar}>
          <RNView style={styles.filterHeaderRow}>
            <Text style={styles.filterLabel}>{filterLabelText}</Text>
            <TouchableOpacity
              style={[
                styles.resetButton,
                isAllTime && styles.resetButtonDisabled,
              ]}
              onPress={() => {
                setSelectedYear("all");
                setSelectedMonth("all");
                setSelectedDay("all");
              }}
              disabled={isAllTime}
            >
              <Ionicons
                name="refresh"
                size={14}
                color={isAllTime ? "#666" : "#ccc"}
              />
              <Text
                style={[
                  styles.resetButtonText,
                  isAllTime && styles.resetButtonTextDisabled,
                ]}
              >
                Reset
              </Text>
            </TouchableOpacity>
          </RNView>

          <RNView style={styles.filterRow}>
            {/* Year selector */}
            <TouchableOpacity
              style={styles.filterField}
              onPress={() => setActiveFilterField("year")}
            >
              <Text style={styles.filterFieldLabel}>Year</Text>
              <RNView style={styles.filterFieldValueRow}>
                <Text style={styles.filterFieldValueText}>
                  {selectedYear === "all" ? "All" : selectedYear}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#aaa" />
              </RNView>
            </TouchableOpacity>

            {/* Month selector */}
            <TouchableOpacity
              style={styles.filterField}
              onPress={() => setActiveFilterField("month")}
            >
              <Text style={styles.filterFieldLabel}>Month</Text>
              <RNView style={styles.filterFieldValueRow}>
                <Text style={styles.filterFieldValueText}>
                  {selectedMonth === "all" ? "All" : monthNames[selectedMonth]}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#aaa" />
              </RNView>
            </TouchableOpacity>

            {/* Day selector */}
            <TouchableOpacity
              style={styles.filterField}
              onPress={() => setActiveFilterField("day")}
            >
              <Text style={styles.filterFieldLabel}>Day</Text>
              <RNView style={styles.filterFieldValueRow}>
                <Text style={styles.filterFieldValueText}>
                  {selectedDay === "all" ? "All" : selectedDay}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#aaa" />
              </RNView>
            </TouchableOpacity>
          </RNView>

          {/* Type selector */}
          <RNView style={styles.typeFilterRow}>
            <TouchableOpacity
              style={[
                styles.typeFilterChip,
                transactionTypeFilter === "spent" && styles.typeFilterChipActive,
              ]}
              onPress={() => setTransactionTypeFilter("spent")}
            >
              <Text
                style={[
                  styles.typeFilterChipText,
                  transactionTypeFilter === "spent" &&
                    styles.typeFilterChipTextActive,
                ]}
              >
                Spent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeFilterChip,
                transactionTypeFilter === "income" &&
                  styles.typeFilterChipActive,
              ]}
              onPress={() => setTransactionTypeFilter("income")}
            >
              <Text
                style={[
                  styles.typeFilterChipText,
                  transactionTypeFilter === "income" &&
                    styles.typeFilterChipTextActive,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </RNView>
        </RNView>
      )}

      <ScrollView
        style={styles.listScrollView}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {!hasExpenses ? (
          <RNView style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#444" />
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubText}>
              Take a photo to add an expense!
            </Text>
          </RNView>
        ) : !hasDayGroups ? (
          <RNView style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#444" />
            <Text style={styles.emptyText}>No expenses in this month</Text>
            <Text style={styles.emptySubText}>Try selecting another month</Text>
          </RNView>
        ) : (
          dayGroups.map((group) => (
            <RNView key={group.date.toISOString()} style={styles.daySection}>
              {/* Date and total */}
              <RNView style={styles.dayHeader}>
                <Text style={styles.dayDate}>
                  {formatDateLabel(group.date)}
                </Text>
                <Text style={[styles.dayTotal, { color: primaryColor }]}>
                  {`${transactionTypeFilter === "income" ? "+" : "-"}${formatAmount(
                    group.totalAmount,
                  )}`}
                </Text>
              </RNView>

              {/* Images for this day */}
              <RNView style={styles.imagesRow}>
                {group.expenses.map((expense) => (
                  <TouchableOpacity
                    key={expense.id}
                    onPress={() => onSelectExpense(expense)}
                    activeOpacity={0.8}
                    style={styles.imageWrapper}
                  >
                    <Image
                      source={{ uri: expense.imageUrl }}
                      style={styles.expenseImage}
                    />
                  </TouchableOpacity>
                ))}
              </RNView>
            </RNView>
          ))
        )}
      </ScrollView>

      {/* Filter picker modal */}
      <Modal
        visible={activeFilterField !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveFilterField(null)}
      >
        <RNView style={styles.modalOverlay}>
          <RNView style={styles.modalContent}>
            <RNView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeFilterField === "year"
                  ? "Select year"
                  : activeFilterField === "month"
                    ? "Select month"
                    : "Select day"}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveFilterField(null)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </RNView>

            <ScrollView
              style={styles.modalList}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  if (activeFilterField === "year") setSelectedYear("all");
                  if (activeFilterField === "month") setSelectedMonth("all");
                  if (activeFilterField === "day") setSelectedDay("all");
                  setActiveFilterField(null);
                }}
              >
                <Text style={styles.modalItemText}>All</Text>
              </TouchableOpacity>

              {activeFilterField === "year" &&
                yearOptions.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedYear(year);
                      setActiveFilterField(null);
                    }}
                  >
                    <Text style={styles.modalItemText}>{year}</Text>
                  </TouchableOpacity>
                ))}

              {activeFilterField === "month" &&
                monthNames.map((name, index) => (
                  <TouchableOpacity
                    key={name}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedMonth(index);
                      setActiveFilterField(null);
                    }}
                  >
                    <Text style={styles.modalItemText}>{name}</Text>
                  </TouchableOpacity>
                ))}

              {activeFilterField === "day" &&
                (() => {
                  let maxDay = 31;

                  if (selectedMonth !== "all") {
                    if (selectedMonth === 1) {
                      // February
                      if (selectedYear === "all") {
                        // No specific year -> allow up to 29
                        maxDay = 29;
                      } else {
                        // Specific year -> real leap year handling
                        maxDay = new Date(
                          selectedYear,
                          selectedMonth + 1,
                          0,
                        ).getDate();
                      }
                    } else {
                      const yearForCalc =
                        selectedYear === "all"
                          ? new Date().getFullYear()
                          : selectedYear;
                      maxDay = new Date(
                        yearForCalc,
                        selectedMonth + 1,
                        0,
                      ).getDate();
                    }
                  }

                  return Array.from({ length: maxDay }).map((_, index) => {
                    const day = index + 1;
                    return (
                      <TouchableOpacity
                        key={day}
                        style={styles.modalItem}
                        onPress={() => {
                          setSelectedDay(day);
                          setActiveFilterField(null);
                        }}
                      >
                        <Text style={styles.modalItemText}>{day}</Text>
                      </TouchableOpacity>
                    );
                  });
                })()}
            </ScrollView>
          </RNView>
        </RNView>
      </Modal>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Filter bar
  filterBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  filterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filterLabel: {
    color: "#999",
    fontSize: 12,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  typeFilterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 10,
  },
  filterField: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterFieldLabel: {
    color: "#777",
    fontSize: 10,
    marginBottom: 4,
  },
  filterFieldValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterFieldValueText: {
    color: "#fff",
    fontSize: 12,
  },
  typeFilterChip: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  typeFilterChipActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.5)",
  },
  typeFilterChipText: {
    color: "#ccc",
    fontSize: 12,
    fontWeight: "500",
  },
  typeFilterChipTextActive: {
    color: "#fff",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  resetButtonDisabled: {
    opacity: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  resetButtonText: {
    color: "#ccc",
    fontSize: 11,
  },
  resetButtonTextDisabled: {
    color: "#666",
  },

  // List
  listScrollView: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  daySection: {
    marginBottom: 32,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dayDate: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  dayTotal: {
    fontSize: 14,
    fontWeight: "700",
  },
  imagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageWrapper: {
    width: IMAGE_THUMB_SIZE,
    height: IMAGE_THUMB_SIZE,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  expenseImage: {
    width: "100%",
    height: "100%",
  },

  // Empty states
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 150,
  },
  emptyText: {
    color: "#666",
    fontSize: 18,
    marginTop: 16,
  },
  emptySubText: {
    color: "#444",
    fontSize: 14,
    marginTop: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalList: {
    maxHeight: "80%",
  },
  modalListContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  modalItemText: {
    color: "#fff",
    fontSize: 14,
  },
});
