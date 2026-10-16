/**
 * MERA Design Tokens & Theme Specification
 * Master visual system derived from official design reference.
 * Deep black, elevated surfaces, restrained violet and lavender accents.
 */

export const THEME = {
  colors: {
    // Backgrounds & Surfaces (Matching Reference Image)
    background: '#0D0B12',
    surfaceElevated: '#17131F',
    surfaceSecondary: '#211B2B',
    surfaceTertiary: '#2A2338',
    surfaceHover: '#332B42',

    // Accents & Brand Violets
    accentPrimary: '#8B5CF6',
    accentBright: '#7C3AED',
    accentLavender: '#C4B5FD',
    accentDeep: '#5B21B6',
    accentGlow: 'rgba(139, 92, 246, 0.28)',
    accentSubtle: 'rgba(139, 92, 246, 0.12)',

    // High-Contrast Typography
    textPrimary: '#F7F5FA',
    textSecondary: '#A7A0B2',
    textMuted: '#706A7C',
    textInverse: '#0D0B12',

    // Semantic States (Accessible)
    success: '#10B981',
    successBg: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.15)',
    info: '#3B82F6',
    infoBg: 'rgba(59, 130, 246, 0.15)',

    // Teleprompter Highlighting & Readability
    prompterBackdropOverlay: 'rgba(13, 11, 18, 0.82)',
    prompterBackdropSolid: '#17131F',
    prompterCurrentWordHighlight: '#F7F5FA',
    prompterCurrentWordBg: 'rgba(124, 58, 237, 0.55)',
    prompterPastWord: '#706A7C',
    prompterFutureWord: '#F7F5FA',
    prompterUncertainIndicator: '#F59E0B',

    // Camera & Viewfinder Guidelines
    recordRed: '#EF4444',
    recordingPulsing: 'rgba(239, 68, 68, 0.35)',
    guidelineGrid: 'rgba(255, 255, 255, 0.15)',
    framingBoxValid: '#10B981',
    framingBoxAdjust: '#F59E0B',

    // Subtle Borders (From Reference #332B40)
    borderSubtle: '#332B40',
    borderAccent: 'rgba(139, 92, 246, 0.45)',
    borderFocus: '#8B5CF6',
  },

  typography: {
    fontFamilies: {
      sans: 'System',
      mono: 'Courier',
    },
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 34,
      prompterSm: 18,
      prompterBase: 24,
      prompterLg: 32,
      prompterXl: 40,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      heavy: '800' as const,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      prompter: 1.5,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
  },

  radii: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    card: 20,
    pill: 9999,
    full: 9999,
  },

  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 10,
      elevation: 6,
    },
    accentGlow: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
    recordingPill: {
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 8,
    },
  },
} as const;

export type Theme = typeof THEME;
