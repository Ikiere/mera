/**
 * MERA Signature Brand Logo
 * Geometric violet ribbon 'M' monogram and typographic wordmark,
 * matching the official MERA visual identity.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';

interface MeraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  style?: ViewStyle;
}

export const MeraLogo: React.FC<MeraLogoProps> = ({
  size = 'md',
  showWordmark = true,
  style,
}) => {
  const iconDimensions = {
    sm: { width: 22, height: 22, fontSize: 16, letterSpacing: 1.5 },
    md: { width: 30, height: 30, fontSize: 20, letterSpacing: 2 },
    lg: { width: 44, height: 44, fontSize: 28, letterSpacing: 2.5 },
    xl: { width: 72, height: 72, fontSize: 42, letterSpacing: 4 },
  }[size];

  return (
    <View style={[styles.container, style]}>
      {/* Geometric Ribbon 'M' Monogram */}
      <View
        style={[
          styles.monogramContainer,
          { width: iconDimensions.width, height: iconDimensions.height },
        ]}
      >
        <View style={styles.ribbonLeft} />
        <View style={styles.ribbonCenterLeft} />
        <View style={styles.ribbonCenterRight} />
        <View style={styles.ribbonRight} />
      </View>

      {/* Typographic Brand Wordmark */}
      {showWordmark ? (
        <Text
          style={[
            styles.wordmark,
            {
              fontSize: iconDimensions.fontSize,
              letterSpacing: iconDimensions.letterSpacing,
            },
          ]}
        >
          MERA
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monogramContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ribbonLeft: {
    position: 'absolute',
    left: '8%',
    top: '12%',
    bottom: '12%',
    width: '26%',
    borderRadius: 4,
    backgroundColor: THEME.colors.accentBright,
    transform: [{ skewY: '-12deg' }],
  },
  ribbonCenterLeft: {
    position: 'absolute',
    left: '28%',
    top: '20%',
    bottom: '18%',
    width: '24%',
    borderRadius: 3,
    backgroundColor: THEME.colors.accentPrimary,
    transform: [{ skewY: '24deg' }],
    opacity: 0.9,
  },
  ribbonCenterRight: {
    position: 'absolute',
    right: '28%',
    top: '20%',
    bottom: '18%',
    width: '24%',
    borderRadius: 3,
    backgroundColor: THEME.colors.accentLavender,
    transform: [{ skewY: '-24deg' }],
    opacity: 0.95,
  },
  ribbonRight: {
    position: 'absolute',
    right: '8%',
    top: '12%',
    bottom: '12%',
    width: '26%',
    borderRadius: 4,
    backgroundColor: THEME.colors.accentBright,
    transform: [{ skewY: '12deg' }],
  },
  wordmark: {
    color: THEME.colors.textPrimary,
    fontWeight: THEME.typography.weights.heavy,
    fontFamily: THEME.typography.fontFamilies.sans,
  },
});
