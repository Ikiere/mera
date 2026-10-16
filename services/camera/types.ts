/**
 * MERA Camera Engine Types & Abstractions
 */

import { CameraType } from 'expo-camera';

export type CameraFacing = 'front' | 'back';

export type RecordingState =
  | 'idle'
  | 'countdown'
  | 'recording'
  | 'paused'
  | 'stopping'
  | 'saved'
  | 'error';

export interface CameraCapabilities {
  hasCameraPermission: boolean;
  hasMicrophonePermission: boolean;
  facing: CameraFacing;
  zoom: number;
  isTorchOn: boolean;
  canRecordVideo: boolean;
  statusMessage?: string;
}

export interface RecordedVideoResult {
  uri: string;
  durationSec: number;
  fileSizeBytes: number;
  width?: number;
  height?: number;
}
