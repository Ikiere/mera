/**
 * MERA Audio Waveform Visualizer
 * Glowing violet audio waveform visualizer shown beneath the teleprompter in Studio
 * (Matching Screens 9-12 in the official design reference).
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';

interface AudioWaveformProps {
  isActive: boolean;
  barCount?: number;
  style?: ViewStyle;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  barCount = 32,
  style,
}) => {
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => 4)
  );

  useEffect(() => {
    if (!isActive) {
      setHeights(Array.from({ length: barCount }, () => 4));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array.from({ length: barCount }, (_, i) => {
          // Organic speech waveform simulation with center-weighted bias
          const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
          const maxH = Math.max(6, 26 * (1 - centerDist * 0.6));
          return Math.max(4, Math.round(Math.random() * maxH));
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return (
    <View style={[styles.container, style]}>
      {heights.map((h, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              height: h,
              backgroundColor: isActive
                ? i % 3 === 0
                  ? THEME.colors.accentLavender
                  : THEME.colors.accentPrimary
                : 'rgba(167, 160, 178, 0.25)',
              opacity: isActive ? 0.9 : 0.35,
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
    justifyContent: 'center',
    height: 32,
    gap: 3,
  },
  bar: {
    width: 2.5,
    borderRadius: 1.5,
  },
});
