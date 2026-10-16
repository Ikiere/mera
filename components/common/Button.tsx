/**
 * MERA Reusable Button Component
 * Polished luxury violet/black styling matching official design reference.
 * Pill-shaped geometry, haptic feedback, accessible states.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { THEME } from '../../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
  hapticFeedback = true,
  accessibilityLabel,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;

    if (hapticFeedback && Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onPress();
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryBtn;
      case 'secondary':
        return styles.secondaryBtn;
      case 'outline':
        return styles.outlineBtn;
      case 'danger':
        return styles.dangerBtn;
      case 'ghost':
        return styles.ghostBtn;
      default:
        return styles.primaryBtn;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.baseBtn,
        getContainerStyle(),
        getSizeStyle(),
        disabled && styles.disabledBtn,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : THEME.colors.accentBright}
        />
      ) : (
        <>
          {icon ? <React.Fragment>{icon}</React.Fragment> : null}
          <Text
            style={[
              styles.baseText,
              getTextStyle(),
              icon ? { marginLeft: 8 } : null,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.radii.pill,
  },
  baseText: {
    fontFamily: THEME.typography.fontFamilies.sans,
    fontWeight: THEME.typography.weights.bold,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: THEME.radii.pill,
  },
  sizeMd: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: THEME.radii.pill,
  },
  sizeLg: {
    paddingVertical: 17,
    paddingHorizontal: 28,
    borderRadius: THEME.radii.pill,
  },
  primaryBtn: {
    backgroundColor: THEME.colors.accentBright,
    shadowColor: THEME.colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.sizes.base,
  },
  secondaryBtn: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  secondaryText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.base,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.accentPrimary,
  },
  outlineText: {
    color: THEME.colors.accentLavender,
    fontSize: THEME.typography.sizes.base,
  },
  dangerBtn: {
    backgroundColor: THEME.colors.error,
  },
  dangerText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.sizes.base,
  },
  ghostBtn: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.medium,
  },
  disabledBtn: {
    opacity: 0.4,
  },
  disabledText: {
    color: THEME.colors.textMuted,
  },
});
