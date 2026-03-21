/**
 * OmniTask - Media Capture Service
 * Handles photo/video picking and voice recording placeholder
 */
import {Alert, Platform, PermissionsAndroid} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import {addMediaAttachment} from '../../core/database';

/**
 * Requests camera and storage permissions
 */
const requestMediaPermissions = async () => {
  if (Platform.OS !== 'android') return true;
  try {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    return Object.values(results).every(
      (r) => r === PermissionsAndroid.RESULTS.GRANTED,
    );
  } catch {
    return false;
  }
};

/**
 * Pick a photo from the gallery
 */
export const pickPhoto = async (taskId) => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets?.length) return null;

    const asset = result.assets[0];
    return addMediaAttachment({
      task_id: taskId,
      type: 'photo',
      file_uri: asset.uri,
      file_name: asset.fileName || 'photo.jpg',
      file_size: asset.fileSize || 0,
    });
  } catch (error) {
    Alert.alert('Error', 'Failed to pick photo');
    console.error('[OmniTask] Photo pick error:', error);
    return null;
  }
};

/**
 * Take a photo with the camera
 */
export const takePhoto = async (taskId) => {
  const hasPermission = await requestMediaPermissions();
  if (!hasPermission) {
    Alert.alert('Permission Required', 'Camera permission is needed to take photos');
    return null;
  }

  try {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
    });

    if (result.didCancel || !result.assets?.length) return null;

    const asset = result.assets[0];
    return addMediaAttachment({
      task_id: taskId,
      type: 'photo',
      file_uri: asset.uri,
      file_name: asset.fileName || 'camera_photo.jpg',
      file_size: asset.fileSize || 0,
    });
  } catch (error) {
    Alert.alert('Error', 'Failed to take photo');
    console.error('[OmniTask] Camera error:', error);
    return null;
  }
};

/**
 * Pick a video from the gallery
 */
export const pickVideo = async (taskId) => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'video',
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets?.length) return null;

    const asset = result.assets[0];
    return addMediaAttachment({
      task_id: taskId,
      type: 'video',
      file_uri: asset.uri,
      file_name: asset.fileName || 'video.mp4',
      file_size: asset.fileSize || 0,
    });
  } catch (error) {
    Alert.alert('Error', 'Failed to pick video');
    console.error('[OmniTask] Video pick error:', error);
    return null;
  }
};

/**
 * Voice recording placeholder - uses Alert to notify user
 * Voice recording is available via the native SpeechToTextModule
 */
export const startVoiceRecording = async () => {
  Alert.alert('Voice Note', 'Use the microphone button to dictate text instead.');
  return null;
};

export const stopVoiceRecording = async (taskId) => {
  return null;
};

export const playVoiceRecording = async (uri) => {
  Alert.alert('Playback', 'Voice playback available on device.');
};

export const stopPlayback = async () => {};

/**
 * Delete a media file from storage
 */
export const deleteMediaFile = async (filePath) => {
  try {
    const path = filePath.replace('file://', '');
    const exists = await RNFS.exists(path);
    if (exists) {
      await RNFS.unlink(path);
    }
  } catch (error) {
    console.error('[OmniTask] File delete error:', error);
  }
};
