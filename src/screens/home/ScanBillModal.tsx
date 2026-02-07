import { Text, useThemeColor, View } from "@/components/Themed";
import { API_BASE_URL } from "@/config/api";
import { usePrimaryColor } from "@/contexts/ThemeContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useI18n } from "@/i18n";
import { ParsedTransactionFromText } from "@/types/textToTransaction";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActionSheetIOS,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    View as RNView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

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
  const primaryColor = usePrimaryColor();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const widgetBackgroundColor = useThemeColor({}, "card");
  const { t, languageKey } = useI18n();

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
        setErrorMessage(t("home.scanModal.error.cameraPermission"));
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
      setErrorMessage(error?.message || t("home.scanModal.error.photoFailed"));
    }
  };

  const handlePickImage = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage(t("home.scanModal.error.mediaPermission"));
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
      setErrorMessage(error?.message || t("home.scanModal.error.pickFailed"));
    }
  };

  const showImageSourceOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t("home.scanModal.selectSource.cancel"),
            t("home.scanModal.selectSource.takePhoto"),
            t("home.scanModal.selectSource.photoLibrary"),
          ],
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
        t("home.scanModal.selectSource.title"),
        t("home.scanModal.selectSource.message"),
        [
          { text: t("home.scanModal.selectSource.cancel"), style: "cancel" },
          {
            text: t("home.scanModal.selectSource.takePhoto"),
            onPress: handleTakePhoto,
          },
          {
            text: t("home.scanModal.selectSource.photoLibrary"),
            onPress: handlePickImage,
          },
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

      const uriParts = imageUri.split(".");
      const fileType = uriParts[uriParts.length - 1] || "jpg";

      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: `bill_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      } as any);
      formData.append("language", languageKey);

      const response = await fetch(`${API_BASE_URL}/scan-bill`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const message = error?.error || t("home.scanModal.error.scanFailed");
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
        throw new Error(t("home.error.createTransaction"));
      }

      // Navigate to add-transaction screen with pre-filled fields
      const params: Record<string, string> = {
        caption: parsed.caption ?? "",
        amount: String(parsed.amount ?? ""),
        type: parsed.type ?? "spent",
        category: parsed.category ?? "",
        createdAt: parsed.createdAt ?? "",
      };

      // Include imageUri if available (for scanned bills)
      if (imageUri) {
        params.imageUri = imageUri;
      }

      handleClose();
      router.push({
        pathname: "/add-transaction",
        params,
      } as any);
    } catch (error: any) {
      const rawMessage =
        typeof error?.message === "string" ? error.message : undefined;
      setErrorMessage(rawMessage || t("home.scanModal.error.extractFailed"));
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
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalKeyboard}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: widgetBackgroundColor },
            ]}
          >
            <Text style={[styles.modalHeading, { color: textColor }]}>
              {t("home.scanModal.title")}
            </Text>
            <Text style={[styles.modalInstruction, { color: textColor }]}>
              {t("home.scanModal.instruction")}
            </Text>

            {imageUri ? (
              <RNView style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={() => setImageUri(null)}
                >
                  <Text
                    style={[styles.changeImageText, { color: primaryColor }]}
                  >
                    {t("home.scanModal.changeImage")}
                  </Text>
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
                <Ionicons
                  name="cloud-upload-outline"
                  size={32}
                  color={textColor}
                />
                <Text style={[styles.uploadButtonText, { color: textColor }]}>
                  {t("home.scanModal.uploadButton")}
                </Text>
              </TouchableOpacity>
            )}

            {rawTextPreview && (
              <RNView style={styles.rawTextContainer}>
                <Text style={styles.rawTextLabel}>
                  {t("home.scanModal.extractedText")}
                </Text>
                <Text
                  style={[styles.rawTextContent, { color: textColor }]}
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
                  {t("home.scanModal.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalCreateButton,
                  {
                    backgroundColor: primaryColor,
                    opacity: isLoading || !imageUri ? 0.6 : 1,
                  },
                ]}
                onPress={handleExtractAndCreate}
                disabled={isLoading || !imageUri}
              >
                <Text style={styles.modalCreateText}>
                  {isLoading
                    ? t("home.scanModal.creating")
                    : t("home.scanModal.extract")}
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
    maxWidth: 420,
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
  uploadButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 60,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  imagePreviewContainer: {
    marginBottom: 12,
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    resizeMode: "cover",
    marginBottom: 8,
  },
  changeImageButton: {
    paddingVertical: 8,
    alignItems: "center",
  },
  changeImageText: {
    fontSize: 13,
    fontWeight: "600",
  },
  rawTextContainer: {
    marginBottom: 12,
  },
  rawTextLabel: {
    fontSize: 12,
    fontWeight: "600",
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
    color: "#e74c3c",
    fontWeight: "600",
  },
  successContainer: {
    marginBottom: 8,
  },
  successText: {
    fontSize: 13,
    color: "#2ecc71",
    fontWeight: "600",
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
