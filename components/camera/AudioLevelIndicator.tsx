/**
 * MERA Microphone Audio Level Indicator
 * Real-time audio meter animation for recording feedback.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';

interface AudioLevelIndicatorProps {
  isActive: boolean;
}

export const AudioLevelIndicator: React.FC<AudioLevelIndicatorProps> = ({ isActive }) => {
  const [bars, setBars] = useState([30, 60, 45, 80, 50]);

  useEffect(() => {
    if (!isActive) {
      setBars([20, 20, 20, 20, 20]);
      return;
    }

    const interval = setInterval(() => {
      // Simulate live microphone RMS level modulation
      setBars([
        Math.floor(Math.random() * 50) + 25,
        Math.floor(Math.random() * 70) + 30,
        Math.floor(Math.random() * 60) + 20,
        Math.floor(Math.random() * 85) + 15,
        Math.floor(Math.random() * 40) + 20,
      ]);
    }, 120);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <View style={styles.container}>
      {bars.map((heightPercent, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: `${heightPercent}%`,
              backgroundColor: isActive
                ? heightPercent > 75
                  ? THEME.colors.warning
                  : THEME.colors.accentBright
                : THEME.colors.textMuted,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
    gap: 2.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(18, 16, 27, 0.75)',
    borderRadius: THEME.radii.sm,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
  },
});
