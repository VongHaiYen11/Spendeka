import { Text, useThemeColor, View } from "@/components/Themed";
import { usePrimaryColor } from "@/contexts/ThemeContext";
import {
    Expense,
    formatAmount,
    getCategoryDisplayInfo,
} from "@/models/Expense";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    View as RNView,
    StatusBar,
    StyleSheet,
    TouchableOpacity
} from "react-native";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width - 40;
const HEADER_HEIGHT = 110;

interface ExpenseDetailScreenProps {
  expenses: Expense[];
  initialExpenseId: string;
  onClose: () => void;
  onDelete: (expenseId: string) => void;
}

export default function ExpenseDetailScreen({
  expenses,
  initialExpenseId,
  onClose,
  onDelete,
}: ExpenseDetailScreenProps) {
  const iconOnColorBg = useThemeColor({}, "background");
  const primaryColor = usePrimaryColor();
  const listRef = useRef<FlatList<Expense>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pageHeight, setPageHeight] = useState<number | null>(null);

  const sortedExpenses = useMemo(
    () =>
      [...expenses].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    [expenses],
  );

  const initialIndex = useMemo(() => {
    const index = sortedExpenses.findIndex((e) => e.id === initialExpenseId);
    return index >= 0 ? index : 0;
  }, [sortedExpenses, initialExpenseId]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle when expenses list changes (e.g., after deletion)
  useEffect(() => {
    const currentExpenseId = sortedExpenses[currentIndex]?.id;

    // If current expense was deleted, navigate to next/previous or close
    if (sortedExpenses.length === 0) {
      // No expenses left, close the screen
      onClose();
      return;
    }

    // If current expense doesn't exist anymore, navigate to closest available
    if (
      currentExpenseId &&
      !sortedExpenses.find((e) => e.id === currentExpenseId)
    ) {
      if (currentIndex >= sortedExpenses.length) {
        // Was viewing last item, go to previous
        const newIndex = Math.max(0, sortedExpenses.length - 1);
        setCurrentIndex(newIndex);
        if (listRef.current && pageHeight) {
          listRef.current.scrollToIndex({ index: newIndex, animated: true });
        }
      } else {
        // Go to next item (or stay at current index if valid)
        const newIndex = Math.min(currentIndex, sortedExpenses.length - 1);
        setCurrentIndex(newIndex);
        if (listRef.current && pageHeight) {
          listRef.current.scrollToIndex({ index: newIndex, animated: true });
        }
      }
    }
  }, [sortedExpenses, currentIndex, onClose, pageHeight]);

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (!pageHeight) return;
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / pageHeight);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: { item: Expense }) => {
    const categoryInfo = getCategoryDisplayInfo(item.category);

    return (
      <RNView style={[styles.page, pageHeight ? { height: pageHeight } : null]}>
        {/* Image with caption & date overlay */}
        <RNView style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          {!!item.caption && (
            <RNView style={styles.captionOverlay}>
              <Text style={styles.captionText} numberOfLines={2}>
                {item.caption}
              </Text>
            </RNView>
          )}
          <RNView style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {item.createdAt.toLocaleString()}
            </Text>
          </RNView>
        </RNView>

        {/* Amount & Category in one row */}
        <RNView style={styles.infoRow}>
          <RNView style={styles.infoSection}>
            <Text style={styles.infoLabel}>Amount</Text>
            <Text style={[styles.amountText, { color: primaryColor }]}>
              {formatAmount(item.amount)}
            </Text>
          </RNView>

          <RNView style={styles.infoSection}>
            <Text style={styles.infoLabel}>Category</Text>
            <RNView style={styles.categoryRow}>
              <RNView
                style={[
                  styles.categoryIcon,
                  {
                    backgroundColor: categoryInfo.color,
                  },
                ]}
              >
                <Ionicons
                  name={categoryInfo.icon as any}
                  size={20}
                  color={iconOnColorBg}
                />
              </RNView>
              <Text style={styles.categoryText}>{categoryInfo.label}</Text>
            </RNView>
          </RNView>
        </RNView>
      </RNView>
    );
  };

  const currentExpense = sortedExpenses[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <RNView style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Expense Detail</Text>
        <TouchableOpacity
          onPress={() => {
            if (currentExpense) {
              onDelete(currentExpense.id);
            }
          }}
          style={styles.deleteButton}
        >
          <Ionicons name="trash" size={22} color="#ff4d4f" />
        </TouchableOpacity>
      </RNView>

      {/* Paged content */}
      <RNView
        style={styles.pagerContainer}
        onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}
      >
        {pageHeight && (
          <FlatList
            ref={listRef}
            data={sortedExpenses}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            getItemLayout={(_, index) => ({
              length: pageHeight,
              offset: pageHeight * index,
              index,
            })}
            initialScrollIndex={initialIndex}
            onScrollToIndexFailed={(info) => {
              // Handle scroll to index failure gracefully
              const wait = new Promise((resolve) => setTimeout(resolve, 500));
              wait.then(() => {
                if (listRef.current) {
                  listRef.current.scrollToIndex({
                    index: info.index,
                    animated: false,
                  });
                }
              });
            }}
          />
        )}
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  pagerContainer: {
    flex: 1,
  },
  page: {
    paddingTop: HEADER_HEIGHT + 60,
    paddingBottom: 40,
  },

  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: HEADER_HEIGHT,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,77,79,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },

  // Image
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    alignSelf: "center",
    borderRadius: 30,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  captionOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  captionText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },

  // Info sections
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 24,
  },
  infoSection: {
    flex: 1,
    alignItems: "center",
  },
  infoLabel: {
    color: "#999",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  amountText: {
    fontSize: 20,
    fontWeight: "700",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  dateBadge: {
    position: "absolute",
    left: 12,
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  dateText: {
    color: "#fff",
    fontSize: 11,
  },
});
