import { Text } from "@/components/Themed";
import { PRIMARY_COLOR } from "@/constants/Colors";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type TransactionType = "income" | "spent";

interface TypeSwitcherProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
}

export default function TypeSwitcher({ value, onChange }: TypeSwitcherProps) {
  return (
    <View style={styles.typeContainer}>
      <TouchableOpacity
        style={[styles.typeButton, value === "spent" && styles.typeButtonActive]}
        onPress={() => onChange("spent")}
      >
        <Text
          style={[
            styles.typeButtonText,
            value === "spent"
              ? styles.typeButtonTextActive
              : [styles.typeButtonTextInactive, { color: PRIMARY_COLOR }],
          ]}
        >
          Expense
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.typeButton, value === "income" && styles.typeButtonActive]}
        onPress={() => onChange("income")}
      >
        <Text
          style={[
            styles.typeButtonText,
            value === "income"
              ? styles.typeButtonTextActive
              : [styles.typeButtonTextInactive, { color: PRIMARY_COLOR }],
          ]}
        >
          Income
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  typeContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    padding: 3,
    marginBottom: 32,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  typeButtonActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: "#000",
  },
  typeButtonTextInactive: {},
});
