import {
    CLOUDINARY_CONFIG,
    CLOUDINARY_UPLOAD_URL,
} from "@/config/cloudinaryConfig";

export interface Photo {
  id: string;
  url: string;
  publicId: string;
  timestamp: Date;
}

/**
 * Upload an image to Cloudinary
 * @param uri - Local file URI of the image
 * @returns The uploaded photo data or null if failed
 */
export const uploadImage = async (uri: string): Promise<Photo | null> => {
  try {
    // Create form data for Cloudinary upload
    const formData = new FormData();

    // Get file extension
    const uriParts = uri.split(".");
    const fileType = uriParts[uriParts.length - 1];

    formData.append("file", {
      uri: uri,
      type: `image/${fileType}`,
      name: `photo_${Date.now()}.${fileType}`,
    } as any);

    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("folder", "spendeka_photos");

    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const data = await response.json();

    const newPhoto: Photo = {
      id: data.public_id,
      url: data.secure_url,
      publicId: data.public_id,
      timestamp: new Date(),
    };

    return newPhoto;
  } catch (error) {
    throw error;
  }
};
