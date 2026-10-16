/**
 * MERA Reusable Card Component
 * Elevated dark surface with rounded corners (20px) and subtle border (#332B40),
 * matching the official MERA design specification.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'secondary' | 'accent' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevatedCard;
      case 'secondary':
        return styles.secondaryCard;
      case 'accent':
        return styles.accentCard;
      case 'outlined':
        return styles.outlinedCard;
      default:
        return styles.elevatedCard;
    }
  };

  return (
    <View style={[styles.baseCard, getVariantStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  baseCard: {
    borderRadius: THEME.radii.card,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  elevatedCard: {
    backgroundColor: THEME.colors.surfaceElevated,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  secondaryCard: {
    backgroundColor: THEME.colors.surfaceSecondary,
  },
  accentCard: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderColor: 'rgba(139, 92, 246, 0.45)',
    shadowColor: THEME.colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  outlinedCard: {
    backgroundColor: 'transparent',
    borderColor: THEME.colors.borderSubtle,
  },
});
