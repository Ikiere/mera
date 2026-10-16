/**
 * MERA Error State Component
 * Matches Screen 21 from official design reference.
 * Clear feedback for capture, save, or network issues with Retry and Go Back actions.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  subtitle = "We couldn't complete the operation. Please try again.",
  onRetry,
  onGoBack,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name="alert-circle-outline" size={38} color={THEME.colors.error} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {onRetry ? (
        <Button
          title="Retry"
          variant="primary"
          size="md"
          onPress={onRetry}
          style={styles.retryBtn}
        />
      ) : null}

      {onGoBack ? (
        <Button
          title="Go Back"
          variant="secondary"
          size="sm"
          onPress={onGoBack}
          style={styles.goBackBtn}
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
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: THEME.colors.errorBg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
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
    maxWidth: 270,
    marginBottom: THEME.spacing.xl,
  },
  retryBtn: {
    width: '100%',
    maxWidth: 220,
  },
  goBackBtn: {
    width: '100%',
    maxWidth: 220,
    marginTop: THEME.spacing.sm,
  },
});
