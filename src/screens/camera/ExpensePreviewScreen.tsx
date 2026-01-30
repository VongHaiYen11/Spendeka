import { Text, useThemeColor, View } from "@/components/Themed";
import { PRIMARY_COLOR } from "@/constants/Colors";
import { EXPENSE_CATEGORIES_EN, ExpenseCategory } from "@/models/Expense";
import {
  createAndSaveTransaction,
  generateTransactionId,
} from "@/services/TransactionService";
import { DatabaseTransaction } from "@/types/transaction";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  View as RNView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width - 40;
const MAX_NOTE_LENGTH = 50;

interface ExpensePreviewScreenProps {
  imageUri: string;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export default function ExpensePreviewScreen({
  imageUri,
  onSaveSuccess,
  onCancel,
}: ExpensePreviewScreenProps) {
  const [caption, setCaption] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory>("food");
  const [isSaving, setIsSaving] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const iconOnColorBg = useThemeColor({}, "background"); // inner icon on category color background
  const selectedCategoryInfo = useMemo(
    () => EXPENSE_CATEGORIES_EN.find((c) => c.value === selectedCategory),
    [selectedCategory],
  );

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return EXPENSE_CATEGORIES_EN;
    const search = categorySearch.toLowerCase();
    return EXPENSE_CATEGORIES_EN.filter((cat) =>
      cat.label.toLowerCase().includes(search),
    );
  }, [categorySearch]);

  const formatAmountInput = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    if (numericValue) {
      const formatted = new Intl.NumberFormat("en-US").format(
        parseInt(numericValue),
      );
      setAmount(formatted);
    } else {
      setAmount("");
    }
  };

  const handleCaptionChange = (text: string) => {
    if (text.length <= MAX_NOTE_LENGTH) {
      setCaption(text);
    }
  };

  const handleSelectCategory = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    setCategorySearch("");
  };

  const handleSave = async () => {
    const amountValue = parseFloat(amount.replace(/[^0-9]/g, ""));
    if (!amountValue || amountValue <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const transaction: DatabaseTransaction = {
      id: generateTransactionId(),
      imageUrl: undefined,
      caption,
      amount: amountValue,
      category: selectedCategory,
      type: "spent",
      createdAt: new Date(),
    };

    setIsSaving(true);
    try {
      await createAndSaveTransaction(transaction, imageUri);
      onSaveSuccess();
    } catch (error) {
      Alert.alert("Error", "Could not save expense");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <RNView style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Add Expense</Text>
            <RNView style={styles.placeholderButton} />
          </RNView>

          {/* Image with Caption Overlay */}
          <RNView style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <RNView style={styles.captionOverlay}>
              <TextInput
                style={styles.captionInput}
                placeholder="Add a note..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={caption}
                onChangeText={handleCaptionChange}
                maxLength={MAX_NOTE_LENGTH}
              />
              <Text style={styles.charCounter}>
                {caption.length}/{MAX_NOTE_LENGTH}
              </Text>
            </RNView>
          </RNView>

          {/* Amount Input */}
          <RNView style={styles.inputSection}>
            <Text style={styles.inputLabel}>Amount</Text>
            <RNView style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#666"
                value={amount}
                onChangeText={formatAmountInput}
                keyboardType="numeric"
              />
              <Text style={styles.currencyText}>VND</Text>
            </RNView>
          </RNView>

          {/* Category Dropdown */}
          <RNView style={styles.inputSection}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity
              style={styles.categoryDropdown}
              onPress={() => setShowCategoryModal(true)}
            >
              <RNView style={styles.categoryDropdownLeft}>
                <RNView
                  style={[
                    styles.categoryDropdownIcon,
                    { backgroundColor: selectedCategoryInfo?.color },
                  ]}
                >
                  <Ionicons
                    name={selectedCategoryInfo?.icon as any}
                    size={18}
                    color={iconOnColorBg}
                  />
                </RNView>
                <Text style={styles.categoryDropdownText}>
                  {selectedCategoryInfo?.label}
                </Text>
              </RNView>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </RNView>

          {/* Save Button */}
          <RNView style={styles.saveButtonContainer}>
            {/** Disable save when amount is not valid */}
            {/** Derived from current amount string */}
            {/** Keep validation in handleSave as safety */}
            {(() => {
              const numeric = amount.replace(/[^0-9]/g, "");
              const isAmountValid =
                numeric.length > 0 && parseInt(numeric, 10) > 0;
              const isDisabled = isSaving || !isAmountValid;

              return (
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (isSaving || !isAmountValid) && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={isDisabled}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={24} color="#000" />
                      <Text style={styles.saveButtonText}>Save Expense</Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })()}
          </RNView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <RNView style={styles.modalOverlay}>
          <RNView style={styles.modalContent}>
            <RNView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCategoryModal(false);
                  setCategorySearch("");
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </RNView>

            {/* Search Input */}
            <RNView style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search category..."
                placeholderTextColor="#666"
                value={categorySearch}
                onChangeText={setCategorySearch}
              />
              {categorySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCategorySearch("")}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </RNView>

            {/* Category List */}
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryListItem,
                    selectedCategory === item.value &&
                      styles.categoryListItemSelected,
                  ]}
                  onPress={() => handleSelectCategory(item.value)}
                >
                  <RNView
                    style={[
                      styles.categoryListIcon,
                      { backgroundColor: item.color },
                    ]}
                  >
                    <Ionicons name={item.icon as any} size={20} color={iconOnColorBg} />
                  </RNView>
                  <Text
                    style={[
                      styles.categoryListLabel,
                      selectedCategory === item.value &&
                        styles.categoryListLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedCategory === item.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={PRIMARY_COLOR}
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <RNView style={styles.emptySearch}>
                  <Ionicons name="search-outline" size={40} color="#444" />
                  <Text style={styles.emptySearchText}>
                    No categories found
                  </Text>
                </RNView>
              }
            />
          </RNView>
        </RNView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  placeholderButton: {
    width: 44,
    height: 44,
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
  captionInput: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  charCounter: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    textAlign: "right",
    marginTop: 4,
  },

  // Input Section
  inputSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  inputLabel: {
    color: "#999",
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "600",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    paddingVertical: 12,
  },
  currencyText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },

  // Category Dropdown
  categoryDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryDropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryDropdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryDropdownText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  // Save Button
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
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

  // Category List
  categoryListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 14,
  },
  categoryListItemSelected: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  categoryListIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryListLabel: {
    flex: 1,
    color: "#999",
    fontSize: 16,
  },
  categoryListLabelSelected: {
    color: "#fff",
    fontWeight: "600",
  },

  // Empty Search
  emptySearch: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptySearchText: {
    color: "#666",
    fontSize: 14,
    marginTop: 12,
  },
});
