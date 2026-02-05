import { Text, useThemeColor, View } from "@/components/Themed";
import { API_BASE_URL } from "@/config/api";
import { PRIMARY_COLOR } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ParsedTransactionFromText } from "@/types/textToTransaction";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  View as RNView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

interface SpeechToTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onParsed?: (parsed: ParsedTransactionFromText) => void;
}

export default function SpeechToTransactionModal({
  visible,
  onClose,
  onParsed,
}: SpeechToTransactionModalProps) {
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const widgetBackgroundColor = useThemeColor({}, "card");

  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimeoutRef = useRef<any>(null);

  const resetState = () => {
    setValue("");
    setIsLoading(false);
    setErrorMessage(null);
    setIsRecording(false);
    setRecordingStatus(null);
  };

  const handleClose = () => {
    // Make sure any recording is stopped when closing
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (recordingRef.current) {
      try {
        recordingRef.current.stopAndUnloadAsync();
      } catch {
        // ignore
      }
      recordingRef.current = null;
    }
    resetState();
    onClose();
  };

  const startRecording = async () => {
    if (isRecording) return;

    try {
      setErrorMessage(null);
      setRecordingStatus("Requesting microphone permission...");

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setRecordingStatus(null);
        Alert.alert(
          "Microphone permission required",
          "Please enable microphone access in your device settings to record audio.",
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY,
      );
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingStatus("Recording... (auto-stops after ~10s)");

      // Auto-stop after ~10 seconds to keep file size small for Whisper
      recordingTimeoutRef.current = setTimeout(() => {
        if (recordingRef.current && isRecording) {
          stopRecordingAndTranscribe();
        }
      }, 10_000);
    } catch (error: any) {
      console.error("startRecording error", error);
      setIsRecording(false);
      setRecordingStatus(null);
      setErrorMessage(
        error?.message || "Failed to start recording. Please try again.",
      );
    }
  };

  const stopRecordingAndTranscribe = async () => {
    if (!recordingRef.current) return;

    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    const recording = recordingRef.current;
    recordingRef.current = null;

    try {
      setIsRecording(false);
      setRecordingStatus("Processing recording...");

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        setRecordingStatus(null);
        setErrorMessage("No audio URI available after recording.");
        return;
      }

      setRecordingStatus("Uploading for transcription...");

      const formData = new FormData();
      formData.append(
        "file",
        {
          uri,
          name: "recording.m4a",
          type: "audio/m4a",
        } as any,
      );

      const response = await fetch(`${API_BASE_URL}/transcribe`, {
        method: "POST",
        // Let React Native set the multipart/form-data boundary automatically.
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const message =
          error?.error ||
          "Failed to transcribe audio. Please try again with a shorter recording.";
        throw new Error(message);
      }

      const data = (await response.json()) as { transcript?: string };
      const text = data?.transcript?.trim();

      if (!text) {
        throw new Error("Transcription returned empty text.");
      }

      setValue(text);
      setRecordingStatus("Transcription complete. You can edit the text below.");
    } catch (error: any) {
      console.error("stopRecordingAndTranscribe error", error);
      setRecordingStatus(null);
      setErrorMessage(
        error?.message ||
          "Something went wrong while processing the recording. Please try again.",
      );
    }
  };

  const handleCreate = async () => {
    if (!value.trim() || isLoading) return;

    // Clear any previous error
    setErrorMessage(null);

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

      // Reuse the same validation rules as TextToTransactionModal
      if (!parsed) {
        throw new Error("Invalid transaction data received from server");
      }

      if (typeof parsed.amount !== "number" || parsed.amount <= 0) {
        throw new Error("Invalid amount in parsed transaction");
      }

      if (
        !parsed.caption ||
        typeof parsed.caption !== "string" ||
        parsed.caption.trim() === ""
      ) {
        throw new Error("Invalid caption in parsed transaction");
      }

      if (!parsed.category || typeof parsed.category !== "string") {
        throw new Error("Invalid category in parsed transaction");
      }

      if (parsed.type !== "income" && parsed.type !== "spent") {
        throw new Error("Invalid transaction type in parsed transaction");
      }

      if (!parsed.createdAt || typeof parsed.createdAt !== "string") {
        throw new Error("Invalid createdAt in parsed transaction");
      }

      const dateCheck = new Date(parsed.createdAt);
      if (isNaN(dateCheck.getTime())) {
        throw new Error("Invalid date format in parsed transaction");
      }

      if (onParsed) {
        onParsed(parsed);
      }
      handleClose();
    } catch (error: any) {
      const rawMessage =
        typeof error?.message === "string" ? error.message : undefined;

      const userMessage =
        rawMessage ||
        "Invalid input. Please include at least one amount (e.g., $10, 25.50) and try again.";

      setErrorMessage(userMessage);
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
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
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
                Speech to Transaction
              </Text>
              <Text style={[styles.modalInstruction, { color: textColor }]}>
                Record your voice, review the recognized text, then we&apos;ll
                turn it into a transaction.
              </Text>

              <RNView style={styles.speechSection}>
                <RNView style={styles.speechButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.speechButton,
                      {
                        borderColor: isRecording ? "#e74c3c" : borderColor,
                        backgroundColor: isRecording
                          ? "#e74c3c22"
                          : "transparent",
                      },
                    ]}
                    onPress={
                      isRecording
                        ? stopRecordingAndTranscribe
                        : startRecording
                    }
                  >
                    <Text
                      style={[
                        styles.speechButtonText,
                        { color: isRecording ? "#e74c3c" : textColor },
                      ]}
                    >
                      {isRecording ? "Stop & Transcribe" : "Start Recording"}
                    </Text>
                  </TouchableOpacity>
                </RNView>
                {recordingStatus && (
                  <Text style={styles.speechStatus}>{recordingStatus}</Text>
                )}
              </RNView>

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    color: textColor,
                    borderColor: errorMessage ? "#e74c3c" : borderColor,
                    backgroundColor: widgetBackgroundColor,
                  },
                ]}
                placeholder="Recognized text will appear here. You can edit it before continuing."
                placeholderTextColor={colorScheme === "dark" ? "#888" : "#999"}
                value={value}
                onChangeText={(text) => {
                  setValue(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {errorMessage && (
                <RNView style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
                  <Text style={styles.errorHint}>
                    Please adjust your speech or the text and try again.
                  </Text>
                </RNView>
              )}

              <RNView style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { borderColor }]}
                  onPress={handleClose}
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
                      opacity: isLoading ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleCreate}
                  disabled={isLoading || !value.trim()}
                >
                  <Text style={styles.modalCreateText}>
                    {isLoading ? "Creating..." : "Continue"}
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
    marginBottom: 16,
    lineHeight: 20,
  },
  speechSection: {
    marginBottom: 8,
  },
  speechButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  speechButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  speechButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  speechStatus: {
    fontSize: 12,
    opacity: 0.85,
    marginBottom: 8,
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
    color: "#e74c3c",
    fontWeight: "600",
    marginBottom: 4,
  },
  errorHint: {
    fontSize: 12,
    color: "#e74c3c",
    opacity: 0.8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
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

