/**
 * MERA Loading State Component
 * Matches Screen 19 from official design reference.
 * Minimalist violet activity ring, "Loading...", and "Just a moment".
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Loading...',
  subtitle = 'Just a moment',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator size="large" color={THEME.colors.accentPrimary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing['2xl'],
  },
  spinnerWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.base,
  },
  title: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
  },
});
