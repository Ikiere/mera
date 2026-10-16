/**
 * MERA Status Badge Component
 * Studio-grade status pills matching official design reference (Screens 9-13).
 * Supports: Listening, Following Script, Paused, Manual Scroll, Speech Not Detected.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';

export type BadgeVariant =
  | 'listening'
  | 'following'
  | 'paused'
  | 'manual'
  | 'speechError'
  | 'success'
  | 'warning'
  | 'error'
  | 'accent'
  | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  showDot?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  showDot = false,
  icon,
  style,
}) => {
  const getStyleTokens = () => {
    switch (variant) {
      case 'listening':
        return {
          bg: 'rgba(16, 185, 129, 0.22)',
          text: '#FFFFFF',
          dot: THEME.colors.success,
          border: 'rgba(16, 185, 129, 0.45)',
        };
      case 'following':
        return {
          bg: 'rgba(124, 58, 237, 0.28)',
          text: '#FFFFFF',
          dot: THEME.colors.accentLavender,
          border: 'rgba(139, 92, 246, 0.55)',
        };
      case 'paused':
        return {
          bg: 'rgba(245, 158, 11, 0.22)',
          text: '#FFFFFF',
          dot: THEME.colors.warning,
          border: 'rgba(245, 158, 11, 0.45)',
        };
      case 'manual':
        return {
          bg: 'rgba(59, 130, 246, 0.22)',
          text: '#FFFFFF',
          dot: THEME.colors.info,
          border: 'rgba(59, 130, 246, 0.45)',
        };
      case 'speechError':
        return {
          bg: 'rgba(239, 68, 68, 0.25)',
          text: '#FFFFFF',
          dot: THEME.colors.error,
          border: 'rgba(239, 68, 68, 0.5)',
        };
      case 'success':
        return {
          bg: THEME.colors.successBg,
          text: THEME.colors.success,
          dot: THEME.colors.success,
          border: THEME.colors.success,
        };
      case 'warning':
        return {
          bg: THEME.colors.warningBg,
          text: THEME.colors.warning,
          dot: THEME.colors.warning,
          border: THEME.colors.warning,
        };
      case 'error':
        return {
          bg: THEME.colors.errorBg,
          text: THEME.colors.error,
          dot: THEME.colors.error,
          border: THEME.colors.error,
        };
      case 'accent':
        return {
          bg: 'rgba(124, 58, 237, 0.18)',
          text: THEME.colors.accentLavender,
          dot: THEME.colors.accentPrimary,
          border: 'rgba(139, 92, 246, 0.45)',
        };
      default:
        return {
          bg: THEME.colors.surfaceSecondary,
          text: THEME.colors.textSecondary,
          dot: THEME.colors.textMuted,
          border: THEME.colors.borderSubtle,
        };
    }
  };

  const tokens = getStyleTokens();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: tokens.bg, borderColor: tokens.border },
        style,
      ]}
    >
      {showDot ? <View style={[styles.dot, { backgroundColor: tokens.dot }]} /> : null}
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text style={[styles.text, { color: tokens.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4.5,
    paddingHorizontal: 10,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
  },
  iconContainer: {
    marginRight: 2,
  },
  text: {
    fontSize: 11,
    fontFamily: THEME.typography.fontFamilies.sans,
    fontWeight: THEME.typography.weights.semibold,
    letterSpacing: 0.2,
  },
});
