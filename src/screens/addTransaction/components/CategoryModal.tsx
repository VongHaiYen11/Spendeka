import { Text } from "@/components/Themed";
import { PRIMARY_COLOR } from "@/constants/Colors";
import {
  ExpenseCategory,
  EXPENSE_CATEGORIES_EN,
} from "@/models/Expense";
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
import { DARK_BG, ROW_BG } from "../constants";

interface CategoryModalProps {
  visible: boolean;
  selectedCategory: ExpenseCategory;
  searchQuery: string;
  onClose: () => void;
  onSelectCategory: (category: ExpenseCategory) => void;
  onSearchChange: (query: string) => void;
}

export default function CategoryModal({
  visible,
  selectedCategory,
  searchQuery,
  onClose,
  onSelectCategory,
  onSearchChange,
}: CategoryModalProps) {
  const filteredCategories = searchQuery.trim()
    ? EXPENSE_CATEGORIES_EN.filter((cat) =>
        cat.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : EXPENSE_CATEGORIES_EN;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search category..."
              placeholderTextColor="#666"
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
                onPress={() => onSelectCategory(item.value)}
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
                    selectedCategory === item.value &&
                      styles.categoryLabelSelected,
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
    backgroundColor: DARK_BG,
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ROW_BG,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
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
    backgroundColor: "rgba(255,255,255,0.05)",
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
    color: "#999",
    fontSize: 16,
  },
  categoryLabelSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});
