import { SafeView, useThemeColor } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useI18n } from "@/i18n";
import { Expense } from "@/models/Expense";
import ChartCategories from "@/screens/summary/components/chartCategories";
import Overview from "@/screens/summary/components/overview";
import {
    createAndSaveTransaction,
    generateTransactionId,
    getSavedAmountByDateRange,
    getSpentAmountByDateRange,
} from "@/services/TransactionService";
import { ParsedTransactionFromText } from "@/types/textToTransaction";
import type { DatabaseTransaction } from "@/types/transaction";
import { formatDollar } from "@/utils/formatCurrency";
import { getDateRange } from "@/utils/getDateRange";
import { isSameDay } from "date-fns";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StatusBar, StyleSheet } from "react-native";
import HomeHeader from "./HomeHeader";
import HomeToolbar from "./HomeToolbar";
import ScanBillModal from "./ScanBillModal";
import TextToTransactionModal from "./TextToTransactionModal";
import TodaySummaryCard from "./TodaySummaryCard";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { transactions, reloadTransactions } = useTransactions();
  const { t } = useI18n();
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [textInputValue, setTextInputValue] = useState("");
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [totalIncomeToday, setTotalIncomeToday] = useState(0);
  const [totalSpentToday, setTotalSpentToday] = useState(0);
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? "light"].text;
  const textColor = useThemeColor({}, "text");
  const todayCardBackground = colorScheme === "dark" ? "#1a1a1a" : "#ffffff";

  const userName =
    user?.displayName?.trim() || user?.email?.split("@")?.[0] || "User";
  const avatarUrl = user?.photoURL;

  // Range for embedded Summary charts on Home (fixed to "day")
  const homeRange: "day" = "day";
  const homeCurrentDate = new Date();
  const { start: homeStart, end: homeEnd } = getDateRange(
    homeRange,
    homeCurrentDate,
  );
  const homeStartDate = homeStart || new Date();
  const homeEndDate = homeEnd || new Date();

  const expenses = useMemo<Expense[]>(() => {
    return transactions
      .map((tx) => ({
        id: tx.id,
        imageUrl: tx.imageUrl ?? "",
        caption: tx.caption,
        amount: tx.amount,
        category: tx.category,
        type: tx.type,
        createdAt: tx.createdAt,
      }))
      .filter((expense) => expense.imageUrl && expense.imageUrl.trim() !== "");
  }, [transactions]);

  const todayExpenses = useMemo(() => {
    const now = new Date();

    return expenses
      .filter((e) => isSameDay(e.createdAt, now))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [expenses]);

  // Use TransactionService helpers to calculate today's income/spent totals
  useEffect(() => {
    const fetchTodayTotals = async () => {
      try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const [income, spent] = await Promise.all([
          getSavedAmountByDateRange(start, end),
          getSpentAmountByDateRange(start, end),
        ]);

        setTotalIncomeToday(income);
        setTotalSpentToday(spent);
      } catch (error) {
        // Silent fail; keep previous values
      }
    };

    fetchTodayTotals();
  }, [transactions]);

  const formatAmount = (value: number) => formatDollar(value);

  const handleGoHistory = () => {
    router.push("/history" as import("expo-router").Href);
  };

  const handleGoSettings = () => {
    router.push("/settings" as import("expo-router").Href);
  };

  const openTextModal = () => setTextModalVisible(true);
  const closeTextModal = () => {
    setTextModalVisible(false);
    setTextInputValue("");
  };

  const openScanModal = () => setScanModalVisible(true);
  const closeScanModal = () => {
    setScanModalVisible(false);
  };

  const handleParsedFromScan = async (parsed: ParsedTransactionFromText) => {
    try {
      const tx: DatabaseTransaction = {
        id: generateTransactionId(),
        caption: parsed.caption,
        amount: parsed.amount,
        // Parsed category is already aligned with TransactionCategory union
        // used on the frontend.
        category: parsed.category as any,
        type: parsed.type,
        createdAt: new Date(parsed.createdAt),
      };

      await createAndSaveTransaction(tx);
      await reloadTransactions();
      closeScanModal();
    } catch (error: any) {
      Alert.alert(
        t("home.textModal.error.title"),
        error?.message || t("home.error.createTransaction"),
      );
    }
  };

  const handleOpenCameraFromToday = (expenseId?: string) => {
    if (expenseId) {
      router.push({
        pathname: "/camera",
        params: { openExpenseId: expenseId },
      } as import("expo-router").Href);
      return;
    }

    router.push("/camera" as import("expo-router").Href);
  };

  return (
    <SafeView style={styles.container}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <HomeHeader
        userName={userName}
        avatarUrl={avatarUrl}
        iconColor={iconColor}
        onPressProfile={handleGoSettings}
      />

      <HomeToolbar
        iconColor={iconColor}
        onPressHistory={handleGoHistory}
        onPressScan={openScanModal}
        onPressText={openTextModal}
        onPressCamera={() => handleOpenCameraFromToday()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TodaySummaryCard
          colorScheme={colorScheme}
          textColor={textColor}
          backgroundColor={todayCardBackground}
          todayExpenses={todayExpenses}
          totalIncomeToday={totalIncomeToday}
          totalSpentToday={totalSpentToday}
          onOpenCamera={handleOpenCameraFromToday}
          formatAmount={formatAmount}
        />

        {/* Summary-style sections: Overview & Categories (same layout as Summary tab) */}
        <Overview
          startDate={homeStartDate}
          endDate={homeEndDate}
          range={homeRange}
        />
        <ChartCategories
          startDate={homeStartDate}
          endDate={homeEndDate}
          range={homeRange}
        />
      </ScrollView>

      {/* Text to Transaction Modal */}
      <TextToTransactionModal
        visible={textModalVisible}
        value={textInputValue}
        onChangeText={setTextInputValue}
        onClose={closeTextModal}
      />

      {/* Scan Bill Modal */}
      <ScanBillModal
        visible={scanModalVisible}
        onClose={closeScanModal}
        onParsed={handleParsedFromScan}
      />
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
