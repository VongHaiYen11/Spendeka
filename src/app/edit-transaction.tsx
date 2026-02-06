import { useTransactions } from "@/contexts/TransactionContext";
import AddTransactionScreen from "@/screens/addTransaction";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export default function EditTransactionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { transactions } = useTransactions();
  const transaction = id
    ? transactions.find((t) => t.id === id)
    : undefined;

  useEffect(() => {
    if (id && transaction === undefined && transactions.length > 0) {
      router.replace("/history");
    }
  }, [id, transaction, transactions.length, router]);

  if (!id) {
    router.replace("/history");
    return null;
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.centered}>
        <Text>Transaction not found</Text>
      </View>
    );
  }

  return <AddTransactionScreen initialTransaction={transaction} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
