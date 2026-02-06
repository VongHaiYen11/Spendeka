import { Text } from "@/components/Themed";
import { usePrimaryColor } from "@/contexts/ThemeContext";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type TransactionType = "income" | "spent";

interface TypeSwitcherProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
}

export default function TypeSwitcher({ value, onChange }: TypeSwitcherProps) {
  const primaryColor = usePrimaryColor();
  return (
    <View style={[styles.typeContainer, { borderColor: primaryColor }]}>
      <TouchableOpacity
        style={[
          styles.typeButton,
          value === "spent" && [
            styles.typeButtonActive,
            { backgroundColor: primaryColor },
          ],
        ]}
        onPress={() => onChange("spent")}
      >
        <Text
          style={[
            styles.typeButtonText,
            value === "spent"
              ? styles.typeButtonTextActive
              : [styles.typeButtonTextInactive, { color: primaryColor }],
          ]}
        >
          Expense
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.typeButton,
          value === "income" && [
            styles.typeButtonActive,
            { backgroundColor: primaryColor },
          ],
        ]}
        onPress={() => onChange("income")}
      >
        <Text
          style={[
            styles.typeButtonText,
            value === "income"
              ? styles.typeButtonTextActive
              : [styles.typeButtonTextInactive, { color: primaryColor }],
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
  typeButtonActive: {},
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: "#000",
  },
  typeButtonTextInactive: {},
});
