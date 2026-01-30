import { SafeView, View } from "@/components/Themed";
import { useTransactions } from "@/contexts/TransactionContext";
import {
  ExpenseCategory,
  EXPENSE_CATEGORIES_EN,
} from "@/models/Expense";
import {
  saveDatabaseTransaction,
  uploadImageToCloudinary,
} from "@/services/ExpenseService";
import { DatabaseTransaction } from "@/types/expense";
import { useRouter } from "expo-router";
import { format, isToday } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  AddTransactionHeader,
  AmountInput,
  CategoryModal,
  CreateButtonFooter,
  DatePickerModal,
  DetailRow,
  ImageSection,
  NoteSection,
  TypeSwitcher,
} from "./components";
import { generateTransactionId } from "./constants";

export default function AddTransactionScreen() {
  const router = useRouter();
  const { reloadTransactions } = useTransactions();

  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState<"income" | "spent">(
    "spent"
  );
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [caption, setCaption] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const selectedCategoryInfo = EXPENSE_CATEGORIES_EN.find(
    (c) => c.value === category
  );
  const dateLabel = isToday(selectedDate)
    ? "Today"
    : format(selectedDate, "MMM d, yyyy");

  const formatAmountInput = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    if (numericValue === "" || numericValue === ".") {
      setAmount(numericValue);
      return;
    }
    const parts = numericValue.split(".");
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setAmount(numericValue);
  };

  const handlePickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library to attach an image."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreateTransaction = async () => {
    const amountValue = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!amountValue || amountValue <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = "";
      if (imageUri) {
        imageUrl = await uploadImageToCloudinary(imageUri);
      }

      const newTransaction: DatabaseTransaction = {
        id: generateTransactionId(),
        imageUrl: imageUrl || undefined,
        caption: caption.trim() || category,
        amount: Math.abs(amountValue),
        category,
        type: transactionType,
        createdAt: selectedDate,
      };
      await saveDatabaseTransaction(newTransaction);
      await reloadTransactions();
      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not create transaction. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setCategorySearch("");
  };

  const handleSelectCategory = (c: ExpenseCategory) => {
    setCategory(c);
    setShowCategoryModal(false);
    setCategorySearch("");
  };

  return (
    <SafeView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <AddTransactionHeader />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AmountInput value={amount} onChangeText={formatAmountInput} />

          <TypeSwitcher value={transactionType} onChange={setTransactionType} />

          <View style={styles.rowsContainer}>
            <DetailRow
              icon="grid-outline"
              label="Category"
              value={selectedCategoryInfo?.label ?? "Food"}
              onPress={() => setShowCategoryModal(true)}
            />
            <DetailRow
              icon="calendar-outline"
              label="Date"
              value={dateLabel}
              onPress={() => setShowDateModal(true)}
            />
            <ImageSection
              imageUri={imageUri}
              onPickImage={handlePickImage}
              onRemoveImage={() => setImageUri(null)}
            />
            <NoteSection value={caption} onChangeText={setCaption} />
          </View>
        </ScrollView>

        <CreateButtonFooter
          onPress={handleCreateTransaction}
          isLoading={isSaving}
        />
      </KeyboardAvoidingView>

      <CategoryModal
        visible={showCategoryModal}
        selectedCategory={category}
        searchQuery={categorySearch}
        onClose={handleCloseCategoryModal}
        onSelectCategory={handleSelectCategory}
        onSearchChange={setCategorySearch}
      />

      <DatePickerModal
        visible={showDateModal}
        value={selectedDate}
        onClose={() => setShowDateModal(false)}
        onChange={setSelectedDate}
      />
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    backgroundColor: "#000",
  },
  rowsContainer: {
    backgroundColor: "transparent",
    marginBottom: 24,
    alignItems: "flex-start",
  },
});
