/**
 * MERA Recording Setup Screen
 * Matches Screen 8 from official design reference.
 * - Header: "< Recording Setup"
 * - Prominent Camera Preview Card with subject preview
 * - Setup rows: Camera (Front/Back), Orientation (Portrait/Landscape), Quality (1080p), Teleprompter (On/Off)
 * - Primary Action Button: "Continue" (vibrant violet pill button)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { THEME } from '../constants/theme';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { CameraPreviewView } from '../components/camera/CameraPreviewView';
import { SMART_PRESETS } from '../constants/presets';
import { getUserSettings, saveUserSetting } from '../services/database/settingsRepo';

export default function SetupScreen() {
  const router = useRouter();

  const [cameraPerm, requestCameraPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();

  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [quality, setQuality] = useState<'1080p' | '720p' | '4K'>('1080p');
  const [teleprompterEnabled, setTeleprompterEnabled] = useState<boolean>(true);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const s = await getUserSettings();
        setCameraFacing(s.defaultCamera || 'front');
      } catch (err) {
        console.error('Error loading setup settings:', err);
      }
    }
    loadPreferences();
  }, []);

  const handleToggleCamera = () => {
    setCameraFacing((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  const handleToggleOrientation = () => {
    setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  };

  const handleToggleQuality = () => {
    setQuality((prev) => (prev === '1080p' ? '4K' : prev === '4K' ? '720p' : '1080p'));
  };

  const handleToggleTeleprompter = () => {
    setTeleprompterEnabled((prev) => !prev);
  };

  const handleContinue = async () => {
    // Check permissions before moving to recording studio
    if (!cameraPerm?.granted) {
      const res = await requestCameraPerm();
      if (!res.granted) {
        Alert.alert(
          'Camera Required',
          'Camera permission is needed to record your video.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    if (!micPerm?.granted) {
      const micRes = await requestMicPerm();
      if (!micRes.granted) {
        Alert.alert(
          'Microphone Required',
          'Microphone permission is needed for speech synchronization.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    router.push('/(tabs)/studio');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header matching Screen 8 */}
      <Header showBack title="Recording Setup" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Prominent Camera Preview Card (Screen 8) */}
        <View style={styles.previewCard}>
          <CameraPreviewView
            preset={SMART_PRESETS[0]}
            facing={cameraFacing}
            onToggleFacing={handleToggleCamera}
            isRecording={false}
            recordingDurationSec={0}
            countdownValue={null}
            showFramingGuides={true}
          />
        </View>

        {/* Setting Rows Card (Screen 8) */}
        <View style={styles.settingsCard}>
          {/* Camera row */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleCamera}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="camera-outline" size={20} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Camera</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>
                {cameraFacing === 'front' ? 'Front' : 'Back'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Orientation row */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleOrientation}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="phone-portrait-outline" size={20} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Orientation</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>
                {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Quality row */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleQuality}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="videocam-outline" size={20} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Quality</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{quality}</Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Teleprompter row */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleTeleprompter}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="document-text-outline" size={20} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Teleprompter</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{teleprompterEnabled ? 'On' : 'Off'}</Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Primary Action Button: Continue */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          variant="primary"
          size="lg"
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: 24,
  },
  previewCard: {
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  settingsCard: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radii.card,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.medium,
  },
  rowDivider: {
    height: 1,
    backgroundColor: THEME.colors.borderSubtle,
  },
  footer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
    backgroundColor: THEME.colors.background,
  },
  continueBtn: {
    width: '100%',
  },
});
