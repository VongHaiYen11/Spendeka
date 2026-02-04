import { SafeView, View, useThemeColor } from "@/components/Themed";
import { useTransactions } from "@/contexts/TransactionContext";
import {
  EXPENSE_CATEGORIES_EN,
  INCOME_CATEGORIES_EN,
} from "@/models/Expense";
import {
  createAndSaveTransaction,
  generateTransactionId,
} from "@/services/TransactionService";
import { DatabaseTransaction, TransactionCategory } from "@/types/transaction";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function AddTransactionScreen() {
  const router = useRouter();
  const {
    addTransactionOptimistic,
    removeOptimisticTransaction,
  } = useTransactions();

  const params = useLocalSearchParams<{
    caption?: string;
    amount?: string;
    category?: string;
    type?: "income" | "spent";
    createdAt?: string;
  }>();

  const allCategoryValues = [
    ...EXPENSE_CATEGORIES_EN.map((c) => c.value),
    ...INCOME_CATEGORIES_EN.map((c) => c.value),
  ];

  const isValidCategory = (
    c: string | undefined,
  ): c is TransactionCategory => !!c && allCategoryValues.includes(c as TransactionCategory);

  const initialTransactionType: "income" | "spent" =
    params.type === "income" || params.type === "spent"
      ? params.type
      : "spent";

  const initialCategory: TransactionCategory =
    (isValidCategory(params.category) ? params.category : undefined) ??
    (initialTransactionType === "spent" ? "food" : "salary");

  const initialCaption =
    typeof params.caption === "string" ? params.caption : "";

  const initialAmount =
    typeof params.amount === "string" && params.amount !== "0"
      ? params.amount
      : "";

  let initialDate = new Date();
  if (typeof params.createdAt === "string") {
    const d = new Date(params.createdAt);
    if (!isNaN(d.getTime())) initialDate = d;
  }

  const [amount, setAmount] = useState(initialAmount);
  const [transactionType, setTransactionType] = useState<"income" | "spent">(
    initialTransactionType,
  );
  const [category, setCategory] = useState<TransactionCategory>(
    initialCategory,
  );
  const [caption, setCaption] = useState(initialCaption);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const backgroundColor = useThemeColor({}, "background");
  const selectedCategoryInfo =
    transactionType === "spent"
      ? EXPENSE_CATEGORIES_EN.find((c) => c.value === category)
      : INCOME_CATEGORIES_EN.find((c) => c.value === category);
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

  const handleCreateTransaction = () => {
    const amountValue = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!amountValue || amountValue <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    const newTransaction: DatabaseTransaction = {
      id: generateTransactionId(),
      imageUrl: undefined, // filled in after background upload
      caption: caption.trim() || category,
      amount: Math.abs(amountValue),
      category,
      type: transactionType,
      createdAt: selectedDate,
    };

    addTransactionOptimistic(newTransaction);
    router.back();

    // Save to DB in background (single function: upload image if any, then persist)
    (async () => {
      try {
        await createAndSaveTransaction(newTransaction, imageUri);
      } catch (error) {
        removeOptimisticTransaction(newTransaction.id);
        Alert.alert(
          "Could not save",
          "The transaction was not saved. Please try again."
        );
      }
    })();
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setCategorySearch("");
  };

  const handleSelectCategory = (c: TransactionCategory) => {
    setCategory(c);
    setShowCategoryModal(false);
    setCategorySearch("");
  };

  const handleTransactionTypeChange = (type: "income" | "spent") => {
    setTransactionType(type);
    setCategory(type === "spent" ? "food" : "salary");
  };

  return (
    <SafeView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <AddTransactionHeader />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { backgroundColor }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AmountInput value={amount} onChangeText={formatAmountInput} />

          <TypeSwitcher value={transactionType} onChange={handleTransactionTypeChange} />

          <View style={styles.rowsContainer}>
            <DetailRow
              icon="grid-outline"
              label="Category"
              value={selectedCategoryInfo?.label ?? (transactionType === "spent" ? "Food" : "Salary")}
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
          isLoading={false}
        />
      </KeyboardAvoidingView>

      <CategoryModal
        visible={showCategoryModal}
        transactionType={transactionType}
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
  },
  rowsContainer: {
    backgroundColor: "transparent",
    marginBottom: 24,
    alignItems: "flex-start",
  },
});
