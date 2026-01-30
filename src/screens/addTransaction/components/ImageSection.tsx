import { Text, useThemeColor } from "@/components/Themed";
import { PRIMARY_COLOR } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { WIDGET_BG } from "../constants";

interface ImageSectionProps {
  imageUri: string | null;
  onPickImage: () => void;
  onRemoveImage: () => void;
}

export default function ImageSection({
  imageUri,
  onPickImage,
  onRemoveImage,
}: ImageSectionProps) {
  const textColor = useThemeColor({}, "text");

  return (
    <>
      <View style={styles.imageRow}>
        <View style={styles.rowLeft}>
          <Ionicons name="image-outline" size={22} color={PRIMARY_COLOR} />
          <Text style={[styles.rowLabel, { color: textColor }]}>Image</Text>
        </View>
        {imageUri ? (
          <View style={styles.imageActions}>
            <TouchableOpacity onPress={onRemoveImage}>
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={onPickImage}>
            <Ionicons
              name="cloud-upload-outline"
              size={24}
              color={PRIMARY_COLOR}
            />
          </TouchableOpacity>
        )}
      </View>
      {imageUri && (
        <View style={styles.imagePreview}>
          <TouchableOpacity
            onPress={onRemoveImage}
            style={styles.imagePreviewClose}
          >
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: imageUri }}
            style={styles.imagePreviewImg}
            resizeMode="cover"
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: WIDGET_BG,
    marginTop: 14,
    width: "100%",
    borderRadius: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  imageActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeImageText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "500",
  },
  imagePreview: {
    marginTop: 14,
    width: "100%",
    position: "relative",
    backgroundColor: WIDGET_BG,
    borderRadius: 12,
    padding: 8,
    overflow: "hidden",
  },
  imagePreviewClose: {
    position: "absolute",
    top: 4,
    right: 4,
    zIndex: 1,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreviewImg: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    backgroundColor: "#333",
  },
});
