import { SafeView, View, useThemeColor } from "@/components/Themed";
import { useTransactions } from "@/contexts/TransactionContext";
import { useI18n } from "@/i18n";
import {
    EXPENSE_CATEGORIES,
    EXPENSE_CATEGORIES_EN,
    INCOME_CATEGORIES_EN,
    INCOME_CATEGORIES_VI,
} from "@/models/Expense";
import {
    createAndSaveTransaction,
    generateTransactionId,
    updateDatabaseTransaction,
    uploadImageToCloudinary,
} from "@/services/TransactionService";
import { DatabaseTransaction, TransactionCategory } from "@/types/transaction";
import { format, isToday } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

interface AddTransactionScreenProps {
  /** When provided, screen is in edit mode: pre-filled form and "Update" button */
  initialTransaction?: DatabaseTransaction | null;
}

export default function AddTransactionScreen({
  initialTransaction,
}: AddTransactionScreenProps = {}) {
  const router = useRouter();
  const params = useLocalSearchParams<{
    caption?: string;
    amount?: string;
    type?: "income" | "spent";
    category?: string;
    createdAt?: string;
    imageUri?: string;
  }>();
  const { addTransactionOptimistic, removeOptimisticTransaction } =
    useTransactions();
  const { t, languageKey } = useI18n();

  const isEditMode = Boolean(initialTransaction?.id);

  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState<"income" | "spent">(
    "spent",
  );
  const [category, setCategory] = useState<TransactionCategory>("food");
  const [caption, setCaption] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const paramsInitialized = useRef(false);

  // Pre-fill form fields from route params (only once on mount)
  useEffect(() => {
    // Prevent infinite loops by only initializing once
    if (paramsInitialized.current) return;

    // Check if any params exist to initialize
    const hasParams =
      params.caption ||
      params.amount ||
      params.type ||
      params.category ||
      params.createdAt ||
      params.imageUri;
    if (!hasParams) return;

    if (params.caption) {
      setCaption(params.caption);
    }
    if (params.amount) {
      setAmount(params.amount);
    }
    if (params.type === "income" || params.type === "spent") {
      setTransactionType(params.type);
    }
    if (params.category) {
      setCategory(params.category as TransactionCategory);
    }
    if (params.createdAt) {
      const parsedDate = new Date(params.createdAt);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    }
    if (params.imageUri) {
      setImageUri(params.imageUri);
    }

    paramsInitialized.current = true;
  }, [
    params.caption,
    params.amount,
    params.type,
    params.category,
    params.createdAt,
    params.imageUri,
  ]);

  const backgroundColor = useThemeColor({}, "background");
  const selectedCategoryInfo =
    transactionType === "spent"
      ? (languageKey === "vie"
          ? EXPENSE_CATEGORIES
          : EXPENSE_CATEGORIES_EN
        ).find((c) => c.value === category)
      : (languageKey === "vie"
          ? INCOME_CATEGORIES_VI
          : INCOME_CATEGORIES_EN
        ).find((c) => c.value === category);
  const dateLabel = isToday(selectedDate)
    ? t("add.date.today")
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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("add.error.permissionTitle"),
        t("add.error.permissionMessage"),
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

  const handleSubmit = () => {
    const amountValue = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!amountValue || amountValue <= 0) {
      Alert.alert(
        t("add.error.invalidAmountTitle"),
        t("add.error.invalidAmountMessage"),
      );
      return;
    }

    if (isEditMode && initialTransaction) {
      (async () => {
        setIsSubmitting(true);
        try {
          let imageUrl: string | undefined = initialTransaction.imageUrl;
          if (imageUri) {
            imageUrl = imageUri.startsWith("http")
              ? imageUri
              : await uploadImageToCloudinary(imageUri);
          }
          const updated: DatabaseTransaction = {
            ...initialTransaction,
            caption: caption.trim() || category,
            amount: Math.abs(amountValue),
            category,
            type: transactionType,
            createdAt: selectedDate,
            imageUrl,
          };
          await updateDatabaseTransaction(updated);
          router.back();
        } catch {
          Alert.alert(t("add.error.updateTitle"), t("add.error.updateMessage"));
        } finally {
          setIsSubmitting(false);
        }
      })();
      return;
    }

    const newTransaction: DatabaseTransaction = {
      id: generateTransactionId(),
      imageUrl: undefined,
      caption: caption.trim() || category,
      amount: Math.abs(amountValue),
      category,
      type: transactionType,
      createdAt: selectedDate,
    };

    addTransactionOptimistic(newTransaction);
    router.back();

    (async () => {
      try {
        await createAndSaveTransaction(newTransaction, imageUri);
      } catch (error) {
        removeOptimisticTransaction(newTransaction.id);
        Alert.alert(t("add.error.saveTitle"), t("add.error.saveMessage"));
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
        <AddTransactionHeader
          title={isEditMode ? t("add.title.edit") : t("add.title.add")}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { backgroundColor }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AmountInput value={amount} onChangeText={formatAmountInput} />

          <TypeSwitcher
            value={transactionType}
            onChange={handleTransactionTypeChange}
          />

          <View style={styles.rowsContainer}>
            <DetailRow
              icon="grid-outline"
              label={t("add.field.category")}
              value={
                selectedCategoryInfo?.label ??
                (transactionType === "spent" ? "Food" : "Salary")
              }
              onPress={() => setShowCategoryModal(true)}
            />
            <DetailRow
              icon="calendar-outline"
              label={t("add.field.date")}
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
          onPress={handleSubmit}
          isLoading={isSubmitting}
          label={isEditMode ? t("add.button.update") : t("add.button.create")}
          icon={isEditMode ? "checkmark" : "add"}
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
