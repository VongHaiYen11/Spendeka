import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '@/config/cloudinaryConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Photo {
  id: string;
  url: string;
  publicId: string;
  timestamp: Date;
}

const PHOTOS_STORAGE_KEY = '@spendeka_photos';

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
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('file', {
      uri: uri,
      type: `image/${fileType}`,
      name: `photo_${Date.now()}.${fileType}`,
    } as any);
    
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', 'spendeka_photos');

    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error:', errorData);
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    
    const newPhoto: Photo = {
      id: data.public_id,
      url: data.secure_url,
      publicId: data.public_id,
      timestamp: new Date(),
    };

    // Save to local storage
    await savePhotoToStorage(newPhoto);

    return newPhoto;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Save photo metadata to AsyncStorage
 */
const savePhotoToStorage = async (photo: Photo): Promise<void> => {
  try {
    const existingPhotos = await getPhotos();
    const updatedPhotos = [photo, ...existingPhotos];
    await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
  } catch (error) {
    console.error('Error saving photo to storage:', error);
  }
};

/**
 * Get all photos from local storage, ordered by timestamp (newest first)
 * @returns Array of photos
 */
export const getPhotos = async (): Promise<Photo[]> => {
  try {
    const photosJson = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
    if (!photosJson) {
      return [];
    }
    
    const photos: Photo[] = JSON.parse(photosJson);
    // Convert timestamp strings back to Date objects and sort
    return photos
      .map(p => ({
        ...p,
        timestamp: new Date(p.timestamp),
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Error loading photos:', error);
    return [];
  }
};

/**
 * Delete a photo from local storage
 * Note: This doesn't delete from Cloudinary (would need API key for that)
 * @param photo - The photo to delete
 */
export const deletePhoto = async (photo: Photo): Promise<void> => {
  try {
    const existingPhotos = await getPhotos();
    const updatedPhotos = existingPhotos.filter(p => p.id !== photo.id);
    await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

/**
 * Get a single photo by ID
 * @param photoId - The photo ID
 * @returns The photo or null if not found
 */
export const getPhotoById = async (photoId: string): Promise<Photo | null> => {
  try {
    const photos = await getPhotos();
    return photos.find((p) => p.id === photoId) || null;
  } catch (error) {
    console.error('Error getting photo:', error);
    return null;
  }
};

/**
 * Clear all photos from local storage
 */
export const clearAllPhotos = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PHOTOS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing photos:', error);
  }
};
