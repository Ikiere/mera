/**
 * MERA Pre-Recording Setup Assistant & Framing Evaluator
 * Validates camera readiness, microphone status, orientation match, and framing alignment.
 */

import { CameraPreset } from '../../constants/presets';

export type CheckStatus = 'pass' | 'warn' | 'fail';

export interface SetupCheckItem {
  id: string;
  title: string;
  status: CheckStatus;
  message: string;
  recommendation?: string;
}

export interface SetupEvaluation {
  isReadyToRecord: boolean;
  score: number; // 0 to 100
  items: SetupCheckItem[];
  framingScore: number;
}

export interface FramingMetrics {
  faceDetected: boolean;
  faceBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  headroomRatio?: number;
  eyeLevelRatio?: number;
}

export function evaluateSetup(
  hasCameraPermission: boolean,
  hasMicPermission: boolean,
  currentOrientation: 'portrait' | 'landscape',
  activePreset: CameraPreset,
  framingMetrics?: FramingMetrics
): SetupEvaluation {
  const items: SetupCheckItem[] = [];

  // 1. Camera Permission
  if (hasCameraPermission) {
    items.push({
      id: 'camera_perm',
      title: 'Camera Access',
      status: 'pass',
      message: 'Camera permission active and ready.',
    });
  } else {
    items.push({
      id: 'camera_perm',
      title: 'Camera Access',
      status: 'fail',
      message: 'Camera permission denied.',
      recommendation: 'Enable camera access in settings to record videos.',
    });
  }

  // 2. Microphone Permission
  if (hasMicPermission) {
    items.push({
      id: 'mic_perm',
      title: 'Microphone & Speech Sync',
      status: 'pass',
      message: 'Microphone active for voice tracking and audio.',
    });
  } else {
    items.push({
      id: 'mic_perm',
      title: 'Microphone & Speech Sync',
      status: 'fail',
      message: 'Microphone permission missing.',
      recommendation: 'Grant microphone permission so MERA can follow your speech.',
    });
  }

  // 3. Orientation Match
  if (currentOrientation === activePreset.targetOrientation) {
    items.push({
      id: 'orientation',
      title: 'Aspect Ratio & Orientation',
      status: 'pass',
      message: `Device is in ${currentOrientation} mode matching "${activePreset.name}".`,
    });
  } else {
    items.push({
      id: 'orientation',
      title: 'Aspect Ratio & Orientation',
      status: 'warn',
      message: `Device is ${currentOrientation}, but "${activePreset.name}" is designed for ${activePreset.targetOrientation}.`,
      recommendation: `Rotate device to ${activePreset.targetOrientation} for best results.`,
    });
  }

  // 4. Framing Analysis
  let framingScore = 80;
  if (!framingMetrics || !framingMetrics.faceDetected) {
    items.push({
      id: 'framing_face',
      title: 'Subject Positioning',
      status: 'warn',
      message: 'Align your face inside the upper third guideline.',
      recommendation: 'Keep your phone steady at eye level about an arm’s length away.',
    });
  } else {
    // Face is detected
    const eyeY = framingMetrics.eyeLevelRatio ?? 0.33;
    const targetEyeY = activePreset.framingGuidelines.eyeLevelPercent;
    const eyeDiff = Math.abs(eyeY - targetEyeY);

    if (eyeDiff <= 0.08) {
      items.push({
        id: 'framing_face',
        title: 'Eye-Line Alignment',
        status: 'pass',
        message: 'Eye line is well aligned with the prompter focal zone.',
      });
      framingScore = 100;
    } else {
      items.push({
        id: 'framing_face',
        title: 'Eye-Line Alignment',
        status: 'warn',
        message: eyeY > targetEyeY ? 'Subject framed too low' : 'Subject framed too high',
        recommendation:
          eyeY > targetEyeY
            ? 'Raise your phone slightly so the lens sits directly at eye level.'
            : 'Lower your phone slightly to give adequate headroom above your head.',
      });
      framingScore = 70;
    }
  }

  // Calculate overall score
  const totalItems = items.length;
  const passCount = items.filter(i => i.status === 'pass').length;
  const warnCount = items.filter(i => i.status === 'warn').length;
  const hasFail = items.some(i => i.status === 'fail');

  const score = hasFail ? Math.min(40, Math.round((passCount / totalItems) * 70)) : Math.round(((passCount + warnCount * 0.7) / totalItems) * 100);

  return {
    isReadyToRecord: !hasFail,
    score,
    items,
    framingScore,
  };
}
