/**
 * MERA Split Screen Teleprompter Component
 * Dedicated prompter pane for side-by-side or stacked recording studio mode.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import { THEME } from '../../constants/theme';
import { ScriptToken } from '../../lib/engine/types';

interface SplitPrompterProps {
  tokens: ScriptToken[];
  cursorIndex: number;
  fontSize: number;
  isPaused: boolean;
  isUncertain: boolean;
  isAutoFollowing?: boolean;
  onSelectToken: (index: number) => void;
}

export const SplitPrompter: React.FC<SplitPrompterProps> = ({
  tokens,
  cursorIndex,
  fontSize,
  isPaused,
  isUncertain,
  isAutoFollowing,
  onSelectToken,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const tokenLayouts = useRef<{ [index: number]: { y: number; height: number } }>({});

  useEffect(() => {
    if (cursorIndex >= 0 && tokenLayouts.current[cursorIndex]) {
      const layout = tokenLayouts.current[cursorIndex];
      const targetY = Math.max(0, layout.y - 80);
      scrollViewRef.current?.scrollTo({
        y: targetY,
        animated: true,
      });
    }
  }, [cursorIndex]);

  const handleTokenLayout = (index: number, event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    tokenLayouts.current[index] = { y, height };
  };

  return (
    <View style={styles.container}>
      {/* Pane Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SCRIPT PROMPTER</Text>
        <View style={styles.statusPill}>
          <View
            style={[
              styles.indicatorDot,
              isAutoFollowing
                ? styles.dotPurple
                : isUncertain
                ? styles.dotAmber
                : isPaused
                ? styles.dotBlue
                : styles.dotGreen,
            ]}
          />
          <Text style={styles.statusLabel}>
            {isAutoFollowing
              ? 'Voice Following'
              : isUncertain
              ? 'Syncing...'
              : isPaused
              ? 'Paused'
              : 'Active'}
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.textWrap}>
          {tokens.map((token) => {
            const isPast = token.index < cursorIndex;
            const isCurrent = token.index === cursorIndex;
            const isFuture = token.index > cursorIndex;

            return (
              <TouchableOpacity
                key={token.index}
                activeOpacity={0.7}
                onPress={() => onSelectToken(token.index)}
                onLayout={(e) => handleTokenLayout(token.index, e)}
                style={[styles.tokenTouch, isCurrent && styles.activeTokenBg]}
              >
                <Text
                  style={[
                    styles.tokenText,
                    { fontSize, lineHeight: fontSize * 1.5 },
                    isPast && styles.pastToken,
                    isCurrent && styles.currentToken,
                    isFuture && styles.futureToken,
                  ]}
                >
                  {token.raw}{' '}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
    backgroundColor: THEME.colors.surfaceSecondary,
  },
  title: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    letterSpacing: 1.5,
    color: THEME.colors.textSecondary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: THEME.colors.success,
  },
  dotBlue: {
    backgroundColor: THEME.colors.info,
  },
  dotAmber: {
    backgroundColor: THEME.colors.warning,
  },
  dotPurple: {
    backgroundColor: THEME.colors.accentBright,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textMuted,
  },
  scrollContent: {
    padding: THEME.spacing.base,
  },
  textWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tokenTouch: {
    marginVertical: 3,
  },
  activeTokenBg: {
    backgroundColor: 'rgba(139, 92, 246, 0.45)',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#A78BFA',
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginHorizontal: 1,
  },
  tokenText: {
    fontFamily: THEME.typography.fontFamilies.sans,
  },
  pastToken: {
    color: THEME.colors.prompterPastWord,
  },
  currentToken: {
    color: '#FFFFFF',
    fontWeight: THEME.typography.weights.heavy,
  },
  futureToken: {
    color: THEME.colors.textPrimary,
  },
});
