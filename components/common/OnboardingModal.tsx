/**
 * MERA Three-Page Onboarding Flow & Splash Experience
 * Matches Screens 1-4 from official design reference.
 * 1. Professional videos, made simple.
 * 2. Your script, never leaves your sight.
 * 3. Create. Educate. Build. Share.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { MeraLogo } from './MeraLogo';
import { Button } from './Button';

interface OnboardingModalProps {
  visible: boolean;
  onFinish?: () => void;
  onComplete?: () => void;
}

const ONBOARDING_PAGES = [
  {
    id: 'page1',
    title: 'Professional videos, made simple',
    description:
      'MERA helps you record high-quality videos with a voice-following teleprompter and smart voice tracking.',
    icon: 'videocam',
    badge: 'AI VIDEO DIRECTOR',
  },
  {
    id: 'page2',
    title: 'Your script, never leaves your sight',
    description:
      'Read naturally while MERA follows your voice and keeps your place in the script.',
    icon: 'document-text',
    badge: 'VOICE-FOLLOWING PROMPTER',
  },
  {
    id: 'page3',
    title: 'Create. Educate.\nBuild. Share.',
    description:
      'Perfect for creators, educators, entrepreneurs and everyday speakers.',
    icon: 'sparkles',
    badge: 'STUDIO GRADE',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onFinish,
  onComplete,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { width } = useWindowDimensions();

  if (!visible) return null;

  const page = ONBOARDING_PAGES[currentPage];
  const isLastPage = currentPage === ONBOARDING_PAGES.length - 1;

  const handleNext = () => {
    if (isLastPage) {
      (onFinish || onComplete)?.();
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    (onFinish || onComplete)?.();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header with Brand */}
        <View style={styles.header}>
          <MeraLogo size="md" />
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Cinematic Illustration Visual */}
        <View style={styles.visualContainer}>
          <View style={styles.ambientGlow} />
          <View style={styles.visualCard}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={page.icon as any}
                size={48}
                color={THEME.colors.accentLavender}
              />
            </View>
            <View style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>{page.badge}</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>{page.title}</Text>
          <Text style={styles.description}>{page.description}</Text>
        </View>

        {/* Footer with Pagination Dots & Actions */}
        <View style={styles.footer}>
          {/* 3-Dot Pagination Indicator */}
          <View style={styles.paginationRow}>
            {ONBOARDING_PAGES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentPage ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Bottom Action Controls */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.footerSkipText}>Skip</Text>
            </TouchableOpacity>

            <Button
              title={isLastPage ? 'Get Started' : 'Next'}
              variant="primary"
              size="md"
              onPress={handleNext}
              style={styles.nextButton}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.xl,
    paddingTop: THEME.spacing.md,
  },
  skipBtn: {
    padding: THEME.spacing.xs,
  },
  skipText: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.medium,
  },
  visualContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: THEME.spacing.lg,
  },
  ambientGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(124, 58, 237, 0.16)',
  },
  visualCard: {
    width: 220,
    height: 260,
    borderRadius: 28,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    gap: 18,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.45)',
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.heavy,
    letterSpacing: 1,
    color: THEME.colors.accentLavender,
  },
  contentSection: {
    paddingHorizontal: THEME.spacing.xl,
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 12,
  },
  description: {
    fontSize: THEME.typography.sizes.base,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: THEME.spacing.xl,
    paddingBottom: THEME.spacing.xl,
    gap: 20,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: THEME.colors.accentPrimary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(167, 160, 178, 0.3)',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerSkipText: {
    fontSize: THEME.typography.sizes.base,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.medium,
    paddingHorizontal: 8,
  },
  nextButton: {
    minWidth: 130,
  },
});
