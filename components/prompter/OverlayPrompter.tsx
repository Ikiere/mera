/**
 * MERA Overlay Teleprompter Component
 * Translucent overlay positioned in upper third of viewfinder
 * with real-time speech synchronization and glowing phrase highlighting (Screens 9-13).
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { THEME } from '../../constants/theme';
import { ScriptToken } from '../../lib/engine/types';

interface OverlayPrompterProps {
  tokens: ScriptToken[];
  cursorIndex: number;
  fontSize: number;
  opacity: number;
  isPaused: boolean;
  isUncertain: boolean;
  isAutoFollowing?: boolean;
  onSelectToken: (index: number) => void;
  style?: ViewStyle;
}

export const OverlayPrompter: React.FC<OverlayPrompterProps> = ({
  tokens,
  cursorIndex,
  fontSize,
  opacity,
  isPaused,
  isUncertain,
  isAutoFollowing,
  onSelectToken,
  style,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const tokenLayouts = useRef<{ [index: number]: { y: number; height: number } }>({});

  // Auto-scroll to active token with smooth animation
  useEffect(() => {
    if (cursorIndex >= 0 && tokenLayouts.current[cursorIndex]) {
      const layout = tokenLayouts.current[cursorIndex];
      // Keep active line roughly 45px from the top (direct eye-line contact area)
      const targetY = Math.max(0, layout.y - 45);
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
    <View
      style={[
        styles.container,
        { backgroundColor: `rgba(13, 11, 18, ${opacity})` },
        style,
      ]}
    >
      {/* Script Scrolling View */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
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
                activeOpacity={0.75}
                onPress={() => onSelectToken(token.index)}
                onLayout={(e) => handleTokenLayout(token.index, e)}
                style={[
                  styles.tokenTouch,
                  isCurrent && styles.activeTokenBg,
                ]}
              >
                <Text
                  style={[
                    styles.tokenText,
                    { fontSize, lineHeight: fontSize * 1.48 },
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 43, 64, 0.6)',
    maxHeight: 180,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: 4,
  },
  textWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenTouch: {
    marginVertical: 2,
    borderRadius: 6,
  },
  activeTokenBg: {
    backgroundColor: 'rgba(124, 58, 237, 0.65)',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    marginHorizontal: 1.5,
  },
  tokenText: {
    fontFamily: THEME.typography.fontFamilies.sans,
    letterSpacing: -0.1,
  },
  pastToken: {
    color: '#706A7C',
  },
  currentToken: {
    color: '#FFFFFF',
    fontWeight: THEME.typography.weights.heavy,
  },
  futureToken: {
    color: '#F7F5FA',
    fontWeight: THEME.typography.weights.medium,
  },
});
