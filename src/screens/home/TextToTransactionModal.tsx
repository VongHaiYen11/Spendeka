import { Text, useThemeColor, View } from "@/components/Themed";
import { API_BASE_URL } from "@/config/api";
import { usePrimaryColor } from "@/contexts/ThemeContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useI18n } from "@/i18n";
import { ParsedTransactionFromText } from "@/types/textToTransaction";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    View as RNView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";

interface TextToTransactionModalProps {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
}

export default function TextToTransactionModal({
  visible,
  value,
  onChangeText,
  onClose,
}: TextToTransactionModalProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const primaryColor = usePrimaryColor();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const widgetBackgroundColor = useThemeColor({}, "card");
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!value.trim() || isLoading) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/text-to-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: value }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Failed to parse text");
      }

      const parsed: ParsedTransactionFromText = await response.json();

      // Navigate to add-transaction screen with pre-filled fields
      const params: Record<string, string> = {
        caption: parsed.caption ?? "",
        amount: String(parsed.amount ?? ""),
        type: parsed.type ?? "spent",
        category: parsed.category ?? "",
        createdAt: parsed.createdAt ?? "",
      };

      onClose();
      router.push({
        pathname: "/add-transaction",
        params,
      } as any);
    } catch (error: any) {
      Alert.alert(
        t("home.textModal.error.title"),
        error?.message || t("home.textModal.error.message"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalKeyboard}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: widgetBackgroundColor },
              ]}
            >
              <Text style={[styles.modalHeading, { color: textColor }]}>
                {t("home.textModal.title")}
              </Text>
              <Text style={[styles.modalInstruction, { color: textColor }]}>
                {t("home.textModal.instruction")}
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    color: textColor,
                    borderColor,
                    backgroundColor: widgetBackgroundColor,
                  },
                ]}
                placeholder={t("home.textModal.placeholder")}
                placeholderTextColor={colorScheme === "dark" ? "#888" : "#999"}
                value={value}
                onChangeText={onChangeText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <RNView style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { borderColor }]}
                  onPress={onClose}
                >
                  <Text style={[styles.modalCancelText, { color: textColor }]}>
                    {t("home.textModal.cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalCreateButton,
                    {
                      backgroundColor: primaryColor,
                      opacity: isLoading ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleCreate}
                  disabled={isLoading}
                >
                  <Text style={styles.modalCreateText}>
                    {isLoading
                      ? t("home.textModal.creating")
                      : t("home.textModal.create")}
                  </Text>
                </TouchableOpacity>
              </RNView>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalKeyboard: {
    width: "100%",
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalInstruction: {
    fontSize: 14,
    opacity: 0.85,
    marginBottom: 24,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 100,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalCreateButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalCreateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
