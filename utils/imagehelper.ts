import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

export class ImageStorageManager {
  private static readonly PROFILE_IMAGE_KEY = "user_profile_image";
  private static readonly PROFILE_IMAGE_CACHE_DIR = `${FileSystem.documentDirectory}profile_images/`;

  /**
   * Store profile image locally
   * @param userId - User ID to create unique filename
   * @param imageUri - Local or remote image URI
   * @returns Local file path of stored image
   */
  static async storeProfileImage(
    userId: string,
    imageUri: string
  ): Promise<string | null> {
    try {
      // Ensure cache directory exists
      await FileSystem.makeDirectoryAsync(this.PROFILE_IMAGE_CACHE_DIR, {
        intermediates: true,
      });

      const fileName = `profile_${userId}_${Date.now()}.jpg`;
      const localPath = `${this.PROFILE_IMAGE_CACHE_DIR}${fileName}`;

      // Download/copy image to local storage
      const downloadResult = await FileSystem.downloadAsync(
        imageUri,
        localPath
      );

      if (downloadResult.status === 200) {
        // Store reference in AsyncStorage
        await AsyncStorage.setItem(
          `${this.PROFILE_IMAGE_KEY}_${userId}`,
          localPath
        );
        return localPath;
      }

      return null;
    } catch (error) {
      console.error("Failed to store profile image:", error);
      return null;
    }
  }

  /**
   * Get stored profile image path
   * @param userId - User ID
   * @returns Local file path or null if not found
   */
  static async getProfileImage(userId: string): Promise<string | null> {
    try {
      const localPath = await AsyncStorage.getItem(
        `${this.PROFILE_IMAGE_KEY}_${userId}`
      );

      if (localPath) {
        // Check if file still exists
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        if (fileInfo.exists) {
          return localPath;
        } else {
          // Clean up broken reference
          await AsyncStorage.removeItem(`${this.PROFILE_IMAGE_KEY}_${userId}`);
        }
      }

      return null;
    } catch (error) {
      console.error("Failed to get profile image:", error);
      return null;
    }
  }

  /**
   * Remove stored profile image
   * @param userId - User ID
   */
  static async removeProfileImage(userId: string): Promise<void> {
    try {
      const localPath = await AsyncStorage.getItem(
        `${this.PROFILE_IMAGE_KEY}_${userId}`
      );

      if (localPath) {
        // Remove file
        await FileSystem.deleteAsync(localPath, { idempotent: true });
        // Remove reference
        await AsyncStorage.removeItem(`${this.PROFILE_IMAGE_KEY}_${userId}`);
      }
    } catch (error) {
      console.error("Failed to remove profile image:", error);
    }
  }

  /**
   * Clear all cached profile images
   */
  static async clearAllProfileImages(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(
        this.PROFILE_IMAGE_CACHE_DIR
      );
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.PROFILE_IMAGE_CACHE_DIR, {
          idempotent: true,
        });
      }

      // Remove all AsyncStorage references
      const allKeys = await AsyncStorage.getAllKeys();
      const profileImageKeys = allKeys.filter((key) =>
        key.startsWith(this.PROFILE_IMAGE_KEY)
      );
      await AsyncStorage.multiRemove(profileImageKeys);
    } catch (error) {
      console.error("Failed to clear profile images:", error);
    }
  }

  /**
   * Compress and resize image before storing
   * @param imageUri - Original image URI
   * @param quality - Image quality (0-1)
   * @param maxWidth - Maximum width
   * @param maxHeight - Maximum height
   * @returns Compressed image URI
   */
  static async compressImage(
    imageUri: string,
    quality: number = 0.8,
    maxWidth: number = 400,
    maxHeight: number = 400
  ): Promise<string> {
    try {
      // For React Native, you might want to use react-native-image-resizer
      // or expo-image-manipulator for compression

      // This is a placeholder - implement based on your image processing library
      // Example with expo-image-manipulator:
      /*
      import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
      
      const result = await manipulateAsync(
        imageUri,
        [{ resize: { width: maxWidth, height: maxHeight } }],
        { compress: quality, format: SaveFormat.JPEG }
      );
      
      return result.uri;
      */

      return imageUri; // Return original for now
    } catch (error) {
      console.error("Failed to compress image:", error);
      return imageUri;
    }
  }
}

/**
 * Enhanced user data storage with image handling
 */
export class UserDataStorage {
  private static readonly USER_DATA_KEY = "complete_user_data";

  /**
   * Store complete user data including images
   */
  static async storeUserData(user: any): Promise<void> {
    try {
      // If user has profile image, store it locally
      if (user.profilePic?.url && user.id) {
        const localImagePath = await ImageStorageManager.storeProfileImage(
          user.id,
          user.profilePic.url
        );

        if (localImagePath) {
          // Update user object with local path
          user.profilePic.localPath = localImagePath;
        }
      }

      // Store complete user data
      await AsyncStorage.setItem(
        this.USER_DATA_KEY,
        JSON.stringify({
          ...user,
          lastStored: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Failed to store user data:", error);
    }
  }

  /**
   * Retrieve complete user data
   */
  static async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_DATA_KEY);

      if (userData) {
        const parsedData = JSON.parse(userData);

        // Check if we have a local image path
        if (parsedData.profilePic?.localPath && parsedData.id) {
          const localImagePath = await ImageStorageManager.getProfileImage(
            parsedData.id
          );
          if (localImagePath) {
            parsedData.profilePic.localPath = localImagePath;
          }
        }

        return parsedData;
      }

      return null;
    } catch (error) {
      console.error("Failed to get user data:", error);
      return null;
    }
  }

  /**
   * Clear all user data
   */
  static async clearUserData(): Promise<void> {
    try {
      const userData = await this.getUserData();

      if (userData?.id) {
        await ImageStorageManager.removeProfileImage(userData.id);
      }

      await AsyncStorage.removeItem(this.USER_DATA_KEY);
    } catch (error) {
      console.error("Failed to clear user data:", error);
    }
  }

  /**
   * Update specific user fields
   */
  static async updateUserData(updates: Partial<any>): Promise<void> {
    try {
      const currentData = await this.getUserData();

      if (currentData) {
        const updatedData = {
          ...currentData,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        await this.storeUserData(updatedData);
      }
    } catch (error) {
      console.error("Failed to update user data:", error);
    }
  }
}
