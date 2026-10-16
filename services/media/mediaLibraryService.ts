/**
 * MERA Media Library Service
 * Safely wraps expo-media-library with fallback for Expo Go, Web, and simulators
 * where native ExpoMediaLibraryNext is not compiled into the host client.
 */

import { Platform, Share } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

let MediaLibraryModule: any = null;
let isModuleChecked = false;

function getMediaLibrary() {
  if (isModuleChecked) {
    return MediaLibraryModule;
  }
  isModuleChecked = true;

  if (Platform.OS === 'web') {
    MediaLibraryModule = null;
    return null;
  }

  try {
    // Check if the native C++/Kotlin module is actually compiled into the host client (absent in Expo Go)
    const nativeModule =
      requireOptionalNativeModule('ExpoMediaLibraryNext') ||
      requireOptionalNativeModule('ExpoMediaLibrary');

    if (!nativeModule) {
      MediaLibraryModule = null;
      return null;
    }

    // Only load the package if the native binary exists
    MediaLibraryModule = require('expo-media-library');
  } catch (err) {
    MediaLibraryModule = null;
  }
  return MediaLibraryModule;
}

export function isMediaLibraryAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  const mod = getMediaLibrary();
  return !!(mod && typeof mod.requestPermissionsAsync === 'function');
}

export async function exportVideoToGallery(videoUri: string): Promise<{
  success: boolean;
  message: string;
  savedToPhotos: boolean;
}> {
  if (Platform.OS === 'web') {
    return {
      success: true,
      message: 'Video URI available: ' + videoUri,
      savedToPhotos: false,
    };
  }

  const mod = getMediaLibrary();

  // If running in full native dev build with ExpoMediaLibraryNext linked
  if (mod && typeof mod.requestPermissionsAsync === 'function') {
    try {
      const { status } = await mod.requestPermissionsAsync();
      if (status !== 'granted') {
        return {
          success: false,
          message: 'Permission denied to access device photo library.',
          savedToPhotos: false,
        };
      }

      await mod.saveToLibraryAsync(videoUri);
      return {
        success: true,
        message: 'Video successfully saved to your device Photo Library!',
        savedToPhotos: true,
      };
    } catch (err: any) {
      console.warn('Native saveToLibraryAsync failed:', err);
    }
  }

  // Graceful fallback for Expo Go: Use native system Share dialog
  try {
    const shareResult = await Share.share({
      title: 'MERA Recording',
      url: videoUri,
      message: `MERA Video Recording: ${videoUri}`,
    });

    if (shareResult.action === Share.sharedAction) {
      return {
        success: true,
        message: 'Video shared successfully.',
        savedToPhotos: false,
      };
    } else {
      return {
        success: true,
        message: 'Share dismissed.',
        savedToPhotos: false,
      };
    }
  } catch (shareErr: any) {
    return {
      success: false,
      message:
        'Direct Photo Library export requires an Expo Development Build (npx expo run:android). In Expo Go, your video remains safely in the local MERA gallery.',
      savedToPhotos: false,
    };
  }
}
