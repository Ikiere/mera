/**
 * MERA Teleprompter Interactive Controls Bar
 * Controls text sizing, overlay opacity, manual cursor adjustments, and auto-tracking toggle.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { TrackingSensitivity } from '../../lib/engine/types';

interface PrompterControlsProps {
  isTracking: boolean;
  onToggleTracking: () => void;
  onRewind: () => void;
  onForward: () => void;
  onRecenter: () => void;
  fontSize: number;
  onChangeFontSize: (newSize: number) => void;
  sensitivity: TrackingSensitivity;
  onChangeSensitivity: (newSens: TrackingSensitivity) => void;
  opacity: number;
  onChangeOpacity: (newOpacity: number) => void;
  layout: 'overlay' | 'split';
  onToggleLayout: () => void;
}

export const PrompterControls: React.FC<PrompterControlsProps> = ({
  isTracking,
  onToggleTracking,
  onRewind,
  onForward,
  onRecenter,
  fontSize,
  onChangeFontSize,
  sensitivity,
  onChangeSensitivity,
  opacity,
  onChangeOpacity,
  layout,
  onToggleLayout,
}) => {
  const cycleFontSize = () => {
    const sizes = [18, 22, 26, 32];
    const currentIndex = sizes.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    onChangeFontSize(sizes[nextIndex]);
  };

  const cycleSensitivity = () => {
    const sens: TrackingSensitivity[] = ['low', 'medium', 'high'];
    const curIdx = sens.indexOf(sensitivity);
    const nextIdx = (curIdx + 1) % sens.length;
    onChangeSensitivity(sens[nextIdx]);
  };

  const cycleOpacity = () => {
    const opacities = [0.5, 0.75, 0.95];
    const curIdx = opacities.indexOf(opacity);
    const nextIdx = (curIdx + 1) % opacities.length;
    onChangeOpacity(opacities[nextIdx]);
  };

  return (
    <View style={styles.container}>
      {/* Left: Tracking State & Recenter */}
      <View style={styles.group}>
        <TouchableOpacity
          onPress={onToggleTracking}
          style={[styles.btn, isTracking ? styles.activeTrackingBtn : styles.pausedTrackingBtn]}
          accessibilityRole="button"
          accessibilityLabel={isTracking ? 'Pause speech tracking' : 'Resume speech tracking'}
        >
          <Ionicons
            name={isTracking ? 'mic' : 'mic-off'}
            size={18}
            color={isTracking ? '#FFFFFF' : THEME.colors.warning}
          />
          <Text style={styles.btnLabel}>{isTracking ? 'TRACKING' : 'MANUAL'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRecenter}
          style={styles.iconBtn}
          accessibilityLabel="Recenter prompter"
        >
          <Ionicons name="locate-outline" size={18} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Center: Rewind / Forward */}
      <View style={styles.group}>
        <TouchableOpacity
          onPress={onRewind}
          style={styles.iconBtn}
          accessibilityLabel="Rewind 5 words"
        >
          <Ionicons name="play-back" size={18} color={THEME.colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onForward}
          style={styles.iconBtn}
          accessibilityLabel="Advance 5 words"
        >
          <Ionicons name="play-forward" size={18} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Right: Quick Adjustments */}
      <View style={styles.group}>
        <TouchableOpacity
          onPress={cycleFontSize}
          style={styles.pillBtn}
          accessibilityLabel="Adjust prompter font size"
        >
          <Text style={styles.pillText}>A{fontSize}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={cycleSensitivity}
          style={styles.pillBtn}
          accessibilityLabel="Adjust speech sensitivity"
        >
          <Text style={styles.pillText}>{sensitivity.toUpperCase()[0]}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={cycleOpacity}
          style={styles.pillBtn}
          accessibilityLabel="Adjust background opacity"
        >
          <Ionicons name="contrast-outline" size={14} color={THEME.colors.accentBright} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleLayout}
          style={styles.iconBtn}
          accessibilityLabel="Toggle prompter layout"
        >
          <Ionicons
            name={layout === 'overlay' ? 'layers-outline' : 'tablet-landscape-outline'}
            size={18}
            color={THEME.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 8,
    backgroundColor: 'rgba(18, 16, 27, 0.92)',
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    marginHorizontal: THEME.spacing.md,
    marginVertical: 6,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: THEME.radii.full,
    gap: 4,
  },
  activeTrackingBtn: {
    backgroundColor: THEME.colors.accentDeep,
    borderColor: THEME.colors.accentPrimary,
    borderWidth: 1,
  },
  pausedTrackingBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: THEME.colors.warning,
    borderWidth: 1,
  },
  btnLabel: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 8,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.surfaceSecondary,
  },
  pillBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: THEME.radii.sm,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.accentBright,
  },
});
