import { Text, useThemeColor, View } from "@/components/Themed";
import { useTransactions } from "@/contexts/TransactionContext";
import { deleteExpense } from "@/services/TransactionService";
import { DatabaseTransaction, getCategoryIconConfig } from "@/types/transaction";
import { formatDollar } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import React, { useCallback, useRef } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

interface TransactionItemProps {
  transaction: DatabaseTransaction;
}

// Format currency for display
// Income: green with +$amount
// Spent: red with -$amount
const formatCurrency = (amount: number, type: "income" | "spent") => {
  const formatted = formatDollar(Math.abs(amount));
  if (type === "income") {
    return formatted.replace(/^\$/, "+$");
  }
  // Spent show with minus sign
  return formatted.replace(/^\$/, "-$");
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const router = useRouter();
  const swipeableRef = useRef<Swipeable>(null);
  const { removeOptimisticTransaction, refreshTransactions } = useTransactions();
  const isIncome = transaction.type === "income";
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryTextColor = useThemeColor({}, "text");
  const categoryIcon = getCategoryIconConfig(transaction.category);

  // Close swipe when returning to history screen (e.g. after edit)
  useFocusEffect(
    useCallback(() => {
      swipeableRef.current?.close();
    }, [])
  );

  const handleEdit = () => {
    swipeableRef.current?.close();
    (router.push as (href: string) => void)(`/edit-transaction?id=${transaction.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const id = transaction.id;
            removeOptimisticTransaction(id);
            deleteExpense(id)
              .then(() => {
                // Emit already called inside deleteExpense; refresh will run and keep list in sync
              })
              .catch(async (err) => {
                await refreshTransactions();
                const message = err?.message ?? "Could not delete the transaction.";
                Alert.alert("Error", message);
              });
          },
        },
      ]
    );
  };

  const renderRightActions = () => (
    <View style={styles.actionsRow}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.editBtn]}
        onPress={handleEdit}
      >
        <Ionicons name="pencil" size={22} color="#fff" />
        <Text style={styles.actionLabel}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionBtn, styles.deleteBtn]}
        onPress={handleDelete}
      >
        <Ionicons name="trash" size={22} color="#fff" />
        <Text style={styles.actionLabel}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
    >
      <View style={[styles.transactionItem, { backgroundColor }]}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: categoryIcon.color },
          ]}
        >
          <Ionicons
            name={categoryIcon.icon as any}
            size={20}
            color={backgroundColor}
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionName, { color: textColor }]}>
            {transaction.caption || transaction.category}
          </Text>
          <Text style={[styles.transactionMeta, { color: secondaryTextColor }]}>
            {transaction.category} — {format(transaction.createdAt, "HH:mm")}
          </Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: isIncome ? "#4CAF50" : "#F44336" },
          ]}
        >
          {formatCurrency(transaction.amount, transaction.type)}
        </Text>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 13,
    opacity: 0.7,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  actionBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    paddingHorizontal: 8,
    gap: 4,
  },
  editBtn: {
    backgroundColor: "#2196F3",
  },
  deleteBtn: {
    backgroundColor: "#F44336",
  },
  actionLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default TransactionItem;
