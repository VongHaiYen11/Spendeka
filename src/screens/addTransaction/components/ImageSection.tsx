import { Text, useThemeColor } from "@/components/Themed";
import { usePrimaryColor } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Image,
    LayoutChangeEvent,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

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
  const primaryColor = usePrimaryColor();
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const [previewWidth, setPreviewWidth] = useState<number>(0);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!imageUri) {
      setImageDimensions(null);
      return;
    }
    Image.getSize(
      imageUri,
      (width, height) => setImageDimensions({ width, height }),
      () => setImageDimensions(null),
    );
  }, [imageUri]);

  const onPreviewLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) setPreviewWidth(width);
  };

  const innerWidth = previewWidth - 16; // container has padding 8 each side
  const previewHeight =
    innerWidth > 0 && imageDimensions
      ? (innerWidth / imageDimensions.width) * imageDimensions.height
      : 200; // fallback until layout + image size are known

  return (
    <>
      <View style={[styles.imageRow, { backgroundColor: cardColor }]}>
        <View style={styles.rowLeft}>
          <Ionicons name="image-outline" size={22} color={primaryColor} />
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
              color={primaryColor}
            />
          </TouchableOpacity>
        )}
      </View>
      {imageUri && (
        <View
          style={[styles.imagePreview, { backgroundColor: cardColor }]}
          onLayout={onPreviewLayout}
        >
          <TouchableOpacity
            onPress={onRemoveImage}
            style={styles.imagePreviewClose}
          >
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.imagePreviewImg,
              { height: previewHeight, backgroundColor: cardColor },
            ]}
            resizeMode="contain"
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
  },
});
