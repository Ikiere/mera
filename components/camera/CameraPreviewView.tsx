/**
 * MERA Camera Preview Component
 * Live viewfinder with recording controls, camera facing switch, framing guides, and timers.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { CameraPreset } from '../../constants/presets';
import { FramingGuideOverlay } from './FramingGuideOverlay';
import { AudioLevelIndicator } from './AudioLevelIndicator';
import { Button } from '../common/Button';

interface CameraPreviewViewProps {
  preset: CameraPreset;
  facing: 'front' | 'back';
  onToggleFacing: () => void;
  isRecording: boolean;
  recordingDurationSec: number;
  countdownValue: number | null;
  showFramingGuides: boolean;
  onToggleFramingGuides?: () => void;
  onCameraReady?: () => void;
  cameraRef?: React.RefObject<any>;
  children?: React.ReactNode;
}

export const CameraPreviewView: React.FC<CameraPreviewViewProps> = ({
  preset,
  facing,
  onToggleFacing,
  isRecording,
  recordingDurationSec,
  countdownValue,
  showFramingGuides,
  onToggleFramingGuides,
  onCameraReady,
  cameraRef,
  children,
}) => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If permissions are not granted yet
  if (!cameraPermission?.granted || !micPermission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="videocam" size={32} color={THEME.colors.accentBright} />
          </View>
          <Text style={styles.permissionTitle}>Camera & Mic Access</Text>
          <Text style={styles.permissionDesc}>
            MERA requires camera access for your video preview and microphone access for voice-synchronized teleprompting.
          </Text>
          <Button
            title="Enable Camera & Microphone"
            variant="primary"
            onPress={async () => {
              await requestCameraPermission();
              await requestMicPermission();
            }}
            style={{ marginTop: 12, width: '100%' }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        mode="video"
        onCameraReady={onCameraReady}
      />

      {/* Framing Guidelines Overlay */}
      <FramingGuideOverlay visible={showFramingGuides} preset={preset} />

      {/* Top Camera Status Bar */}
      <View style={styles.topBar}>
        {/* Preset Name Pill */}
        <View style={styles.presetPill}>
          <Ionicons name="film-outline" size={12} color={THEME.colors.accentBright} />
          <Text style={styles.presetText}>{preset.name}</Text>
        </View>

        {/* Recording Timer or Ready Status */}
        {isRecording ? (
          <View style={styles.recordingTimerPill}>
            <View style={styles.pulsingRedDot} />
            <Text style={styles.recordingTimerText}>{formatTimer(recordingDurationSec)}</Text>
          </View>
        ) : (
          <View style={styles.standbyPill}>
            <Text style={styles.standbyText}>STANDBY</Text>
          </View>
        )}

        {/* Right Controls: Facing Switch & Grid Toggle */}
        <View style={styles.topRightControls}>
          <AudioLevelIndicator isActive={isRecording} />

          <TouchableOpacity
            onPress={onToggleFramingGuides}
            style={[styles.cameraActionBtn, showFramingGuides && styles.activeActionBtn]}
            accessibilityLabel="Toggle framing guides"
          >
            <Ionicons
              name="grid-outline"
              size={18}
              color={showFramingGuides ? THEME.colors.accentBright : '#FFFFFF'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onToggleFacing}
            disabled={isRecording}
            style={[styles.cameraActionBtn, isRecording && { opacity: 0.4 }]}
            accessibilityLabel="Switch front or back camera"
          >
            <Ionicons name="camera-reverse-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Countdown Overlay (3, 2, 1) */}
      {countdownValue !== null && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownNumber}>{countdownValue}</Text>
        </View>
      )}

      {/* Children elements (e.g. Teleprompter Overlay) */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  permissionCard: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radii.xl,
    padding: THEME.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    maxWidth: 380,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  permissionTitle: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  permissionDesc: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: THEME.spacing.md,
  },
  topBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(18, 16, 27, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  presetText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
  },
  recordingTimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: THEME.colors.recordRed,
  },
  pulsingRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.recordRed,
  },
  recordingTimerText: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.heavy,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  standbyPill: {
    backgroundColor: 'rgba(18, 16, 27, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.radii.full,
  },
  standbyText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textMuted,
    letterSpacing: 1,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cameraActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 16, 27, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  activeActionBtn: {
    borderColor: THEME.colors.accentPrimary,
    backgroundColor: THEME.colors.surfaceSecondary,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 7, 13, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  countdownNumber: {
    fontSize: 110,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.accentBright,
    textShadowColor: THEME.colors.accentPrimary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
});
