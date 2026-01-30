import { PRIMARY_COLOR } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function AmountInput({ value, onChangeText }: AmountInputProps) {
  return (
    <View style={styles.amountSection}>
      <View style={styles.amountRow}>
        <Text style={styles.dollarSign}>$</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
        />
      </View>
      <View style={styles.amountUnderline} />
    </View>
  );
}

const styles = StyleSheet.create({
  amountSection: {
    marginBottom: 32,
    alignItems: "center",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dollarSign: {
    fontSize: 44,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    marginRight: 6,
  },
  amountInput: {
    fontSize: 44,
    fontWeight: "700",
    minWidth: 160,
    paddingVertical: 12,
    textAlign: "center",
    color: "#fff",
  },
  amountUnderline: {
    width: "80%",
    maxWidth: 280,
    height: 2,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 8,
    alignSelf: "center",
  },
});
