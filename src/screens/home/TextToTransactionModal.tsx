import { Text, useThemeColor, View } from '@/components/Themed';
import { View as RNView } from 'react-native';
import { PRIMARY_COLOR } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { API_BASE_URL } from '@/config/api';
import { ParsedTransactionFromText } from '@/types/textToTransaction';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface TextToTransactionModalProps {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onParsed?: (parsed: ParsedTransactionFromText) => void;
}

export default function TextToTransactionModal({
  visible,
  value,
  onChangeText,
  onClose,
  onParsed,
}: TextToTransactionModalProps) {
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const widgetBackgroundColor = useThemeColor({}, 'card');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!value.trim() || isLoading) return;
    
    // Clear any previous error
    setErrorMessage(null);
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/text-to-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: value }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || 'Failed to parse text');
      }

      const parsed: ParsedTransactionFromText = await response.json();

      // KIỂM TRA ĐẦY ĐỦ tất cả các fields trước khi chuyển trang
      // Validate ALL fields before proceeding to add-transaction page
      if (!parsed) {
        throw new Error('Invalid transaction data received from server');
      }

      if (typeof parsed.amount !== 'number' || parsed.amount <= 0) {
        throw new Error('Invalid amount in parsed transaction');
      }

      if (!parsed.caption || typeof parsed.caption !== 'string' || parsed.caption.trim() === '') {
        throw new Error('Invalid caption in parsed transaction');
      }

      if (!parsed.category || typeof parsed.category !== 'string') {
        throw new Error('Invalid category in parsed transaction');
      }

      if (parsed.type !== 'income' && parsed.type !== 'spent') {
        throw new Error('Invalid transaction type in parsed transaction');
      }

      if (!parsed.createdAt || typeof parsed.createdAt !== 'string') {
        throw new Error('Invalid createdAt in parsed transaction');
      }

      // Validate createdAt is a valid date
      const dateCheck = new Date(parsed.createdAt);
      if (isNaN(dateCheck.getTime())) {
        throw new Error('Invalid date format in parsed transaction');
      }
      
      // CHỈ KHI TẤT CẢ CHECK ĐỀU PASS mới chuyển trang
      // Only navigate to add-transaction page after ALL validations pass
      if (onParsed) {
        onParsed(parsed);
      }
      onClose();
    } catch (error: any) {
      // Extract error message from backend
      const rawMessage = typeof error?.message === 'string' ? error.message : undefined;
      
      // Display backend error messages directly (they're already user-friendly)
      // Examples:
      // - "No number related to money was found in this text. Please include at least one amount (e.g. 25, 10.50, 100k) and try again."
      // - "Could not extract a valid transaction from this text. Please include at least one clear money amount and enough details, then try again."
      // - "Gemini API error: ..."
      // - "Failed to parse Gemini response as JSON"
      // - "Gemini response JSON is missing required fields"
      const userMessage = rawMessage || 'Invalid input. Please include at least one amount (e.g., $10, 25.50) and try again.';
      
      setErrorMessage(userMessage);
      // KHÔNG gọi onParsed hoặc onClose khi có lỗi - giữ modal mở để người dùng sửa lại
      // Do NOT call onParsed or onClose when there's an error - keep modal open for retry
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalKeyboard}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={[styles.modalContent, { backgroundColor: widgetBackgroundColor }]}>
              <Text style={[styles.modalHeading, { color: textColor }]}>
                Text to Transaction
              </Text>
              <Text style={[styles.modalInstruction, { color: textColor }]}>
                Type something below. We'll try to turn it into a transaction.
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { 
                    color: textColor, 
                    borderColor: errorMessage ? '#e74c3c' : borderColor, 
                    backgroundColor: widgetBackgroundColor,
                  },
                ]}
                placeholder="e.g. Coffee $4.50, Lunch $12..."
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
                value={value}
                onChangeText={(text) => {
                  onChangeText(text);
                  // Clear error when user starts typing
                  if (errorMessage) setErrorMessage(null);
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errorMessage && (
                <RNView style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    ⚠️ {errorMessage}
                  </Text>
                  <Text style={styles.errorHint}>
                    Please adjust your text and try again.
                  </Text>
                </RNView>
              )}
              <RNView style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { borderColor }]}
                  onPress={onClose}
                >
                  <Text style={[styles.modalCancelText, { color: textColor }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalCreateButton,
                    { backgroundColor: PRIMARY_COLOR, opacity: isLoading ? 0.7 : 1 },
                  ]}
                  onPress={handleCreate}
                  disabled={isLoading}
                >
                  <Text style={styles.modalCreateText}>
                    {isLoading ? 'Creating...' : 'Create'}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalKeyboard: {
    width: '100%',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalInstruction: {
    fontSize: 14,
    opacity: 0.85,
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 100,
    fontSize: 16,
    marginBottom: 8,
  },
  errorContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
    marginBottom: 4,
  },
  errorHint: {
    fontSize: 12,
    color: '#e74c3c',
    opacity: 0.8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalCreateButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

