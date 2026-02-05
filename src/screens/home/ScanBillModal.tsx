import { Text, useThemeColor, View } from '@/components/Themed';
import { API_BASE_URL } from '@/config/api';
import { PRIMARY_COLOR } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ParsedTransactionFromText } from '@/types/textToTransaction';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  View as RNView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface ScanBillModalProps {
  visible: boolean;
  onClose: () => void;
  onParsed?: (parsed: ParsedTransactionFromText) => void;
}

export default function ScanBillModal({
  visible,
  onClose,
  onParsed,
}: ScanBillModalProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const widgetBackgroundColor = useThemeColor({}, 'card');

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rawTextPreview, setRawTextPreview] = useState<string | null>(null);

  const resetState = () => {
    setImageUri(null);
    setIsLoading(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setRawTextPreview(null);
  };

  // Reset state when modal becomes visible (not on close)
  useEffect(() => {
    if (visible) {
      resetState();
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  const handleTakePhoto = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage(
          'Camera permission is required to take a photo of your bill.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setImageUri(asset.uri);
    } catch (error: any) {
      console.error('handleTakePhoto error', error);
      setErrorMessage(
        error?.message || 'Failed to take photo. Please try again.',
      );
    }
  };

  const handlePickImage = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage(
          'Media library permission is required to upload a bill image.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setImageUri(asset.uri);
    } catch (error: any) {
      console.error('handlePickImage error', error);
      setErrorMessage(
        error?.message || 'Failed to pick image. Please try again.',
      );
    }
  };

  const showImageSourceOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Photo Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handlePickImage();
          }
        },
      );
    } else {
      Alert.alert(
        'Select Image Source',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: handleTakePhoto },
          { text: 'Photo Library', onPress: handlePickImage },
        ],
        { cancelable: true },
      );
    }
  };

  const handleExtractAndCreate = async () => {
    if (!imageUri || isLoading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setIsLoading(true);

      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';

      const formData = new FormData();
      formData.append(
        'file',
        {
          uri: imageUri,
          name: `bill_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any,
      );

      const response = await fetch(`${API_BASE_URL}/scan-bill`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const message =
          error?.error ||
          'Failed to scan bill. Please try again with a clearer image.';
        throw new Error(message);
      }

      const data = (await response.json()) as {
        rawText?: string;
        parsed?: ParsedTransactionFromText;
      };

      if (data.rawText) {
        setRawTextPreview(data.rawText);
      }

      const parsed = data.parsed;
      if (!parsed) {
        throw new Error('Server did not return a parsed transaction.');
      }

      // Navigate to add-transaction screen with pre-filled fields
      const params: Record<string, string> = {
        caption: parsed.caption ?? '',
        amount: String(parsed.amount ?? ''),
        type: parsed.type ?? 'spent',
        category: parsed.category ?? '',
        createdAt: parsed.createdAt ?? '',
      };

      // Include imageUri if available (for scanned bills)
      if (imageUri) {
        params.imageUri = imageUri;
      }

      handleClose();
      router.push({
        pathname: '/add-transaction',
        params,
      } as any);
    } catch (error: any) {
      console.error('handleExtractAndCreate error', error);
      const rawMessage =
        typeof error?.message === 'string' ? error.message : undefined;
      setErrorMessage(
        rawMessage ||
          'Could not extract a transaction from this bill. Please try a clearer photo.',
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
      onRequestClose={handleClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalKeyboard}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: widgetBackgroundColor },
            ]}
          >
              <Text style={[styles.modalHeading, { color: textColor }]}>
                Scan bill to transaction
              </Text>
              <Text style={[styles.modalInstruction, { color: textColor }]}>
                Take a photo or upload a clear image of your bill.
              </Text>

              {imageUri ? (
                <RNView style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={() => setImageUri(null)}
                  >
                    <Text style={styles.changeImageText}>Change image</Text>
                  </TouchableOpacity>
                </RNView>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    {
                      borderColor,
                      backgroundColor: widgetBackgroundColor,
                    },
                  ]}
                  onPress={showImageSourceOptions}
                >
                  <Ionicons name="cloud-upload-outline" size={32} color={textColor} />
                  <Text style={[styles.uploadButtonText, { color: textColor }]}>
                    Upload Bill Image
                  </Text>
                </TouchableOpacity>
              )}

              {rawTextPreview && (
                <RNView style={styles.rawTextContainer}>
                  <Text style={styles.rawTextLabel}>Extracted text preview</Text>
                  <Text
                    style={[
                      styles.rawTextContent,
                      { color: textColor },
                    ]}
                    numberOfLines={4}
                  >
                    {rawTextPreview}
                  </Text>
                </RNView>
              )}

              {errorMessage && (
                <RNView style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </RNView>
              )}

              {successMessage && (
                <RNView style={styles.successContainer}>
                  <Text style={styles.successText}>{successMessage}</Text>
                </RNView>
              )}

              <RNView style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { borderColor }]}
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <Text style={[styles.modalCancelText, { color: textColor }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalCreateButton,
                    {
                      backgroundColor: PRIMARY_COLOR,
                      opacity: isLoading || !imageUri ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleExtractAndCreate}
                  disabled={isLoading || !imageUri}
                >
                  <Text style={styles.modalCreateText}>
                    {isLoading ? 'Creating...' : 'Extract'}
                  </Text>
                </TouchableOpacity>
              </RNView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
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
    maxWidth: 420,
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
    marginBottom: 24,
    lineHeight: 20,
  },
  uploadButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 60,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  imagePreviewContainer: {
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  changeImageButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  changeImageText: {
    fontSize: 13,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  rawTextContainer: {
    marginBottom: 12,
  },
  rawTextLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  rawTextContent: {
    fontSize: 12,
    opacity: 0.9,
  },
  errorContainer: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#e74c3c',
    fontWeight: '600',
  },
  successContainer: {
    marginBottom: 8,
  },
  successText: {
    fontSize: 13,
    color: '#2ecc71',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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

