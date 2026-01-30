import { Text, useThemeColor } from "@/components/Themed";
import { PRIMARY_COLOR } from "@/constants/Colors";
import {
  EXPENSE_CATEGORIES_EN,
  INCOME_CATEGORIES_EN,
} from "@/models/Expense";
import { TransactionCategory } from "@/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CategoryModalProps {
  visible: boolean;
  transactionType: "income" | "spent";
  selectedCategory: TransactionCategory;
  searchQuery: string;
  onClose: () => void;
  onSelectCategory: (category: TransactionCategory) => void;
  onSearchChange: (query: string) => void;
}

const categoryLists = {
  spent: EXPENSE_CATEGORIES_EN,
  income: INCOME_CATEGORIES_EN,
};

export default function CategoryModal({
  visible,
  transactionType,
  selectedCategory,
  searchQuery,
  onClose,
  onSelectCategory,
  onSearchChange,
}: CategoryModalProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const placeholderColor = useThemeColor({}, "placeholder");

  const categories = categoryLists[transactionType];
  const filteredCategories = searchQuery.trim()
    ? categories.filter((cat) =>
        cat.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Select Category
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          <View style={[styles.searchContainer, { backgroundColor: cardColor }]}>
            <Ionicons name="search" size={20} color={placeholderColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search category..."
              placeholderTextColor={placeholderColor}
              value={searchQuery}
              onChangeText={onSearchChange}
            />
          </View>
          <ScrollView style={styles.categoryList}>
            {filteredCategories.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.categoryItem,
                  selectedCategory === item.value &&
                    styles.categoryItemSelected,
                ]}
                onPress={() => onSelectCategory(item.value as TransactionCategory)}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={20} color="#000" />
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: placeholderColor },
                    selectedCategory === item.value && [
                      styles.categoryLabelSelected,
                      { color: textColor },
                    ],
                  ]}
                >
                  {item.label}
                </Text>
                {selectedCategory === item.value && (
                  <Ionicons name="checkmark" size={20} color={PRIMARY_COLOR} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  categoryList: {
    maxHeight: 320,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 14,
  },
  categoryItemSelected: {
    backgroundColor: "rgba(128,128,128,0.15)",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
  },
  categoryLabelSelected: {
    fontWeight: "600",
  },
});
