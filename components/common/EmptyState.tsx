/**
 * MERA Empty State Component
 * Matches Screen 18 from official design reference.
 * Displays outlined icon, friendly prompt, primary creation CTA and skip option.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  actionTitle?: string;
  onAction?: () => void;
  secondaryTitle?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No scripts yet',
  subtitle = 'Create your first script to get started.',
  iconName = 'document-text-outline',
  actionTitle = '+ Create Script',
  onAction,
  secondaryTitle,
  onSecondaryAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Icon Squircle */}
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={36} color={THEME.colors.accentLavender} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {onAction ? (
        <Button
          title={actionTitle}
          variant="primary"
          size="md"
          onPress={onAction}
          style={styles.actionBtn}
        />
      ) : null}

      {onSecondaryAction && secondaryTitle ? (
        <Button
          title={secondaryTitle}
          variant="ghost"
          size="sm"
          onPress={onSecondaryAction}
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
    paddingVertical: THEME.spacing['3xl'],
    paddingHorizontal: THEME.spacing.xl,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  title: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
    marginBottom: THEME.spacing.xl,
  },
  actionBtn: {
    minWidth: 180,
  },
  secondaryBtn: {
    marginTop: THEME.spacing.sm,
  },
});
