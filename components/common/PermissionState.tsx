/**
 * MERA Permission Denied / Access Request Component
 * Matches Screen 20 from official design reference.
 * Explains camera & microphone necessity with clean recovery actions.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Button } from './Button';

interface PermissionStateProps {
  title?: string;
  subtitle?: string;
  onOpenSettings?: () => void;
  onDismiss?: () => void;
  style?: ViewStyle;
}

export const PermissionState: React.FC<PermissionStateProps> = ({
  title = 'Camera & Microphone Access',
  subtitle = 'MERA needs access to your camera and microphone to record videos.',
  onOpenSettings,
  onDismiss,
  style,
}) => {
  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      if (Platform.OS !== 'web') {
        Linking.openSettings().catch(() => {});
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Camera & Mic Dual Icon */}
      <View style={styles.iconCircle}>
        <View style={styles.iconRow}>
          <Ionicons name="videocam" size={24} color={THEME.colors.accentLavender} />
          <Ionicons name="mic" size={22} color={THEME.colors.accentPrimary} />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <Button
        title="Open Settings"
        variant="primary"
        size="md"
        onPress={handleOpenSettings}
        style={styles.primaryBtn}
      />

      {onDismiss ? (
        <Button
          title="Not now"
          variant="ghost"
          size="sm"
          onPress={onDismiss}
          style={styles.secondaryBtn}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing['2xl'],
    paddingHorizontal: THEME.spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: THEME.spacing.xl,
  },
  primaryBtn: {
    width: '100%',
    maxWidth: 240,
  },
  secondaryBtn: {
    marginTop: THEME.spacing.sm,
  },
});
