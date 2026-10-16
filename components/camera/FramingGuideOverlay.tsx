/**
 * MERA Framing Guide Overlay
 * Professional rule-of-thirds grid, eye-level prompter guideline,
 * target eye icons, facial symmetry structure, and shoulder contour guides.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { CameraPreset } from '../../constants/presets';

interface FramingGuideOverlayProps {
  visible: boolean;
  preset: CameraPreset;
  showEyeLine?: boolean;
}

export const FramingGuideOverlay: React.FC<FramingGuideOverlayProps> = ({
  visible,
  preset,
  showEyeLine = true,
}) => {
  if (!visible) return null;

  const eyePercent = `${Math.round(preset.framingGuidelines.eyeLevelPercent * 100)}%` as any;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* Rule of Thirds Vertical Lines */}
      <View style={[styles.gridLineVertical, { left: '33.33%' }]} />
      <View style={[styles.gridLineVertical, { left: '66.66%' }]} />

      {/* Rule of Thirds Horizontal Lines */}
      <View style={[styles.gridLineHorizontal, { top: '33.33%' }]} />
      <View style={[styles.gridLineHorizontal, { top: '66.66%' }]} />

      {/* Headroom Indicator Marker */}
      <View style={[styles.headroomBracket, { top: '4.5%' }]}>
        <View style={styles.headroomBar} />
        <Text style={styles.headroomText}>HEADROOM</Text>
      </View>

      {/* Target Eye-Line Guideline */}
      {showEyeLine ? (
        <View style={[styles.eyeLineContainer, { top: eyePercent }]}>
          <View style={styles.eyeLineBar} />
          <View style={styles.eyeLineBadge}>
            <Ionicons name="eye" size={11} color={THEME.colors.accentBright} />
            <Text style={styles.eyeLineText}>TARGET EYE LEVEL</Text>
          </View>
          <View style={styles.eyeLineBar} />
        </View>
      ) : null}

      {/* Face & Head Structure Overlay (Aligned to Target Eye Level) */}
      <View style={[styles.faceStructureContainer, { top: eyePercent }]}>
        {/* Head/Face Oval Contour */}
        <View style={styles.faceOval}>
          {/* Facial Symmetry Vertical Axis */}
          <View style={styles.facialCenterline} />

          {/* Eye Target Reticles (Left & Right Eye) */}
          <View style={styles.eyesRow}>
            {/* Left Eye Target */}
            <View style={styles.eyeTarget}>
              <View style={styles.eyeReticleRing}>
                <Ionicons name="eye-outline" size={18} color={THEME.colors.accentBright} />
                <View style={[styles.reticleTick, styles.tickTop]} />
                <View style={[styles.reticleTick, styles.tickBottom]} />
                <View style={[styles.reticleTick, styles.tickLeft]} />
                <View style={[styles.reticleTick, styles.tickRight]} />
              </View>
              <Text style={styles.eyeTargetLabel}>LEFT EYE</Text>
            </View>

            {/* Nose Bridge Crosshair */}
            <View style={styles.noseCrosshair}>
              <View style={styles.crosshairH} />
              <View style={styles.crosshairV} />
            </View>

            {/* Right Eye Target */}
            <View style={styles.eyeTarget}>
              <View style={styles.eyeReticleRing}>
                <Ionicons name="eye-outline" size={18} color={THEME.colors.accentBright} />
                <View style={[styles.reticleTick, styles.tickTop]} />
                <View style={[styles.reticleTick, styles.tickBottom]} />
                <View style={[styles.reticleTick, styles.tickLeft]} />
                <View style={[styles.reticleTick, styles.tickRight]} />
              </View>
              <Text style={styles.eyeTargetLabel}>RIGHT EYE</Text>
            </View>
          </View>

          {/* Chin Guide Bracket */}
          <View style={styles.chinBracket}>
            <Text style={styles.chinText}>CHIN</Text>
          </View>
        </View>

        {/* Shoulder Slope Structure Guides */}
        <View style={styles.shouldersContainer}>
          <View style={styles.leftShoulderCurve} />
          <View style={styles.shoulderCenterGap} />
          <View style={styles.rightShoulderCurve} />
        </View>

        {/* AI Director Framing Badge */}
        <View style={styles.framingAidBadge}>
          <Ionicons name="scan-outline" size={11} color={THEME.colors.success} />
          <Text style={styles.framingAidText}>ALIGN FACE & EYES</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: THEME.colors.guidelineGrid,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: THEME.colors.guidelineGrid,
  },
  headroomBracket: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 2,
  },
  headroomBar: {
    width: 68,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  headroomText: {
    fontSize: 8,
    fontWeight: THEME.typography.weights.heavy,
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  eyeLineContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeLineBar: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(167, 139, 250, 0.45)',
  },
  eyeLineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 16, 27, 0.85)',
    paddingVertical: 2.5,
    paddingHorizontal: 8,
    borderRadius: THEME.radii.xs,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.6)',
    gap: 5,
  },
  eyeLineText: {
    fontSize: 9,
    fontWeight: THEME.typography.weights.heavy,
    letterSpacing: 1,
    color: THEME.colors.accentBright,
  },
  faceStructureContainer: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: -85,
    zIndex: 11,
  },
  faceOval: {
    width: 196,
    height: 244,
    borderRadius: 98,
    borderWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.4)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  facialCenterline: {
    position: 'absolute',
    top: 14,
    bottom: 14,
    width: 1,
    backgroundColor: 'rgba(167, 139, 250, 0.25)',
  },
  eyesRow: {
    position: 'absolute',
    top: 76,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  eyeTarget: {
    alignItems: 'center',
    gap: 4,
  },
  eyeReticleRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.75)',
    backgroundColor: 'rgba(18, 16, 27, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  reticleTick: {
    position: 'absolute',
    backgroundColor: THEME.colors.accentBright,
  },
  tickTop: {
    top: -4,
    width: 2,
    height: 4,
  },
  tickBottom: {
    bottom: -4,
    width: 2,
    height: 4,
  },
  tickLeft: {
    left: -4,
    width: 4,
    height: 2,
  },
  tickRight: {
    right: -4,
    width: 4,
    height: 2,
  },
  eyeTargetLabel: {
    fontSize: 8,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.accentBright,
    letterSpacing: 0.5,
  },
  noseCrosshair: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairH: {
    position: 'absolute',
    width: 8,
    height: 1,
    backgroundColor: 'rgba(167, 139, 250, 0.45)',
  },
  crosshairV: {
    position: 'absolute',
    width: 1,
    height: 8,
    backgroundColor: 'rgba(167, 139, 250, 0.45)',
  },
  chinBracket: {
    position: 'absolute',
    bottom: -11,
    alignSelf: 'center',
    width: 54,
    height: 14,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderColor: THEME.colors.accentBright,
    backgroundColor: 'rgba(18, 16, 27, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chinText: {
    fontSize: 7.5,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.accentBright,
    letterSpacing: 0.6,
  },
  shouldersContainer: {
    position: 'absolute',
    top: 242,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 330,
  },
  leftShoulderCurve: {
    width: 110,
    height: 44,
    borderTopLeftRadius: 36,
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    borderStyle: 'dashed',
  },
  shoulderCenterGap: {
    width: 76,
  },
  rightShoulderCurve: {
    width: 110,
    height: 44,
    borderTopRightRadius: 36,
    borderRightWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    borderStyle: 'dashed',
  },
  framingAidBadge: {
    position: 'absolute',
    top: 298,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 16, 27, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    gap: 5,
  },
  framingAidText: {
    fontSize: 8.5,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    letterSpacing: 0.8,
  },
});
