/**
 * MERA Settings Screen
 * Redesigned to match Screen 16 of the official design reference.
 * Grouped studio configuration sections:
 * - Camera (Lens, Quality, Flash/Orientation)
 * - Teleprompter (Text Size A A, Line Spacing, Reading Position)
 * - Voice Tracking (Sensitivity, Speech Engine)
 * - Storage, Permissions, Accessibility, Onboarding Tour, About MERA
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '../constants/theme';
import { Header } from '../components/common/Header';
import { OnboardingModal } from '../components/common/OnboardingModal';
import {
  getUserSettings,
  saveUserSetting,
  resetUserSettings,
} from '../services/database/settingsRepo';
import { UserSettings } from '../services/database/types';
import { TrackingSensitivity } from '../lib/engine/types';
import { authService } from '../services/supabase/authService';
import { isSupabaseConfigured } from '../services/supabase/config';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await getUserSettings();
        setSettings(s);
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    }
    load();
  }, []);

  const update = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await saveUserSetting(key, value);
    } catch (err) {
      console.error('Failed to persist setting:', err);
    }
  };

  const handleToggleCamera = () => {
    if (!settings) return;
    const next = settings.defaultCamera === 'front' ? 'back' : 'front';
    update('defaultCamera', next);
  };

  const handleCyclePosition = () => {
    if (!settings) return;
    const positions: Array<'top' | 'middle' | 'bottom'> = ['top', 'middle', 'bottom'];
    const idx = positions.indexOf(settings.prompterPosition);
    const next = positions[(idx + 1) % positions.length];
    update('prompterPosition', next);
  };

  const handleCycleSensitivity = () => {
    if (!settings) return;
    const sensList: TrackingSensitivity[] = ['low', 'medium', 'high'];
    const idx = sensList.indexOf(settings.trackingSensitivity);
    const next = sensList[(idx + 1) % sensList.length];
    update('trackingSensitivity', next);
  };

  const handleCycleCountdown = () => {
    if (!settings) return;
    const options = [3, 5, 10];
    const idx = options.indexOf(settings.countdownSeconds);
    const next = options[(idx + 1) % options.length];
    update('countdownSeconds', next);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Restore all teleprompter and camera settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Defaults',
          style: 'destructive',
          onPress: async () => {
            const defaults = await resetUserSettings();
            setSettings(defaults);
            Alert.alert('Settings Reset', 'All settings have been restored to defaults.');
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You will need to log back in to access MERA.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await authService.signOut();
            update('currentUserEmail', null);
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const openSystemSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  if (!settings) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Settings" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header title="Settings" subtitle="Camera, prompter & offline tracking" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* CAMERA SECTION matching Screen 16 */}
        <View style={styles.sectionHeader}>
          <Ionicons name="videocam-outline" size={16} color={THEME.colors.accentBright} />
          <Text style={styles.sectionTitle}>Camera</Text>
        </View>

        <View style={styles.groupContainer}>
          {/* Row 1: Camera */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleToggleCamera}
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <Ionicons name="camera-reverse-outline" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Camera</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>
                {settings.defaultCamera === 'front' ? 'Front' : 'Rear'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 2: Video Quality */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="film-outline" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Video Quality</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>1080p</Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 3: Countdown Timer */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleCycleCountdown}
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <Ionicons name="timer-outline" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Countdown</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{settings.countdownSeconds}s</Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* TELEPROMPTER SECTION matching Screen 16 */}
        <View style={styles.sectionHeader}>
          <Ionicons name="reader-outline" size={16} color={THEME.colors.accentBright} />
          <Text style={styles.sectionTitle}>Teleprompter</Text>
        </View>

        <View style={styles.groupContainer}>
          {/* Row 1: Text Size */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="text-outline" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Text Size</Text>
            </View>
            <View style={styles.textSizePills}>
              <TouchableOpacity
                onPress={() => update('prompterFontSize', Math.max(16, settings.prompterFontSize - 4))}
                style={styles.pillSmall}
                accessibilityLabel="Decrease font size"
              >
                <Text style={styles.pillTextSmall}>A-</Text>
              </TouchableOpacity>
              <Text style={styles.sizeIndicator}>{settings.prompterFontSize}px</Text>
              <TouchableOpacity
                onPress={() => update('prompterFontSize', Math.min(36, settings.prompterFontSize + 4))}
                style={styles.pillSmall}
                accessibilityLabel="Increase font size"
              >
                <Text style={styles.pillTextLarge}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 2: Reading Position */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleCyclePosition}
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <Ionicons name="compass-outline" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Reading Position</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>
                {settings.prompterPosition === 'top'
                  ? 'Near Lens (Top)'
                  : settings.prompterPosition === 'middle'
                  ? 'Center'
                  : 'Bottom'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Row 3: Prompter Opacity */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="contrast-outline" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Overlay Opacity</Text>
            </View>
            <View style={styles.rowRight}>
              <TouchableOpacity
                onPress={() => {
                  const ops = [0.5, 0.75, 0.95];
                  const next = ops[(ops.indexOf(settings.prompterOpacity) + 1) % ops.length];
                  update('prompterOpacity', next);
                }}
              >
                <Text style={styles.rowValue}>{Math.round(settings.prompterOpacity * 100)}%</Text>
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </View>
        </View>

        {/* VOICE TRACKING SECTION matching Screen 16 */}
        <View style={styles.sectionHeader}>
          <Ionicons name="mic-outline" size={16} color={THEME.colors.accentBright} />
          <Text style={styles.sectionTitle}>Voice Tracking</Text>
        </View>

        <View style={styles.groupContainer}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleCycleSensitivity}
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <Ionicons name="pulse-outline" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Sensitivity</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { textTransform: 'capitalize' }]}>
                {settings.trackingSensitivity}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* MERA ACCOUNT & SUPABASE CLOUD SECTION */}
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={16} color={THEME.colors.accentBright} />
          <Text style={styles.sectionTitle}>Account & Supabase Cloud</Text>
        </View>

        <View style={styles.groupContainer}>
          {/* User Account Row */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              if (settings.currentUserEmail) {
                handleSignOut();
              } else {
                router.push('/auth/login');
              }
            }}
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name={settings.currentUserEmail ? 'person-outline' : 'log-in-outline'}
                size={18}
                color={THEME.colors.textSecondary}
              />
              <Text style={styles.rowLabel}>
                {settings.currentUserEmail ? 'Account Email' : 'MERA Account'}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text
                style={[
                  styles.rowValue,
                  settings.currentUserEmail ? { color: THEME.colors.accentBright } : {},
                ]}
                numberOfLines={1}
              >
                {settings.currentUserEmail || 'Sign In / Register'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Cloud Sync Backend Row */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="cloud-outline" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Supabase Sync</Text>
            </View>
            <View style={styles.rowRight}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isSupabaseConfigured()
                    ? THEME.colors.success
                    : THEME.colors.warning,
                  marginRight: 4,
                }}
              />
              <Text style={styles.rowValue}>
                {isSupabaseConfigured() ? 'Connected' : 'Offline Mode (Local)'}
              </Text>
            </View>
          </View>

          {settings.currentUserEmail ? (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.settingRow}
                onPress={handleSignOut}
                accessibilityRole="button"
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="log-out-outline" size={18} color={THEME.colors.error} />
                  <Text style={[styles.rowLabel, { color: THEME.colors.error }]}>Sign Out</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        {/* SYSTEM & APP PREFERENCES matching Screen 16 */}
        <View style={styles.sectionHeader}>
          <Ionicons name="hardware-chip-outline" size={16} color={THEME.colors.accentBright} />
          <Text style={styles.sectionTitle}>System & Privacy</Text>
        </View>

        <View style={styles.groupContainer}>
          {/* Storage */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="file-tray-full-outline" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Storage</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>SQLite Local</Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Permissions */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={openSystemSettings}
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <Ionicons name="shield-checkmark-outline" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>Permissions</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: THEME.colors.success }]}>Active</Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Onboarding Tour */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowOnboarding(true)}
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <Ionicons name="sparkles-outline" size={18} color={THEME.colors.accentBright} />
              <Text style={styles.rowLabel}>Product Walkthrough</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: THEME.colors.accentBright }]}>Replay</Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* About MERA */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="information-circle-outline" size={18} color={THEME.colors.textSecondary} />
              <Text style={styles.rowLabel}>About MERA</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>v1.0.0 (Production)</Text>
            </View>
          </View>
        </View>

        {/* Restore Defaults Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <Text style={styles.resetButtonText}>Restore Factory Defaults</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Onboarding Modal */}
      <OnboardingModal
        visible={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
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
    padding: THEME.spacing.base,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupContainer: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textPrimary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.borderSubtle,
    marginHorizontal: 16,
  },
  textSizePills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radii.sm,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  pillTextSmall: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  pillTextLarge: {
    fontSize: 14,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  sizeIndicator: {
    fontSize: 12,
    color: THEME.colors.accentBright,
    fontWeight: THEME.typography.weights.semibold,
    minWidth: 32,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 28,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: THEME.radii.pill,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textMuted,
  },
});
