/**
 * Central theme / design-system token definitions.
 * Supports light & dark modes via the exported `themes` map.
 *
 * The `Theme` type is the single source of truth for colors, spacing,
 * typography and radii across the app to keep the UI consistent.
 */

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  /** Brand primary */
  primary: string;
  /** Slightly darker variant for pressed states / gradients */
  primaryDark: string;
  /** Accent used for highlights, badges, CTAs */
  accent: string;
  /** Danger / error / destructive actions */
  danger: string;
  /** Success */
  success: string;
  /** Warning / caution */
  warning: string;
  /** Info */
  info: string;

  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;

  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  /** Offline / muted banner background */
  offlineBg: string;
  /** Overlay for modals */
  overlay: string;
  /** Transparent helpers */
  transparent: string;

  /** Semi-transparent row highlight */
  rowHighlight: string;

  /** Tab bar colors */
  tabBarBg: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export interface AppTheme {
  mode: ColorScheme;
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  typography: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    small: number;
    caption: number;
  };
  icon: number;
}

const baseSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const baseRadius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

const baseTypography = {
  h1: 28,
  h2: 22,
  h3: 17,
  body: 15,
  small: 13,
  caption: 11,
};

/** Ayurvedic-inspired palette */
const brand = {
  primary: '#1E734F',
  primaryDark: '#145A3D',
  accent: '#E9A13B',
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    ...brand,
    accent: brand.accent,
    danger: '#D64545',
    success: '#2E9E5B',
    warning: '#E9A13B',
    info: '#3B7DD8',

    background: '#F7F6F2',
    surface: '#FFFFFF',
    surfaceAlt: '#F0EDE6',
    border: '#E3DFD6',

    text: '#1B1F1C',
    textSecondary: '#4A504B',
    textMuted: '#8A8F8A',
    textInverse: '#FFFFFF',

    offlineBg: '#FBF3DF',
    overlay: 'rgba(0,0,0,0.45)',
    transparent: 'transparent',
    rowHighlight: 'rgba(30, 115, 79, 0.06)',

    tabBarBg: '#FFFFFF',
    tabBarActive: '#1E734F',
    tabBarInactive: '#8A8F8A',
  },
  spacing: baseSpacing,
  radius: baseRadius,
  typography: baseTypography,
  icon: 22,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    ...brand,
    accent: '#F0B04F',
    danger: '#E26060',
    success: '#3FB672',
    warning: '#F0B04F',
    info: '#5B97E8',

    background: '#121412',
    surface: '#1B1E1B',
    surfaceAlt: '#232724',
    border: '#2E332F',

    text: '#EDEFEC',
    textSecondary: '#BCC1BD',
    textMuted: '#7C827D',
    textInverse: '#1B1E1B',

    offlineBg: '#2B2413',
    overlay: 'rgba(0,0,0,0.6)',
    transparent: 'transparent',
    rowHighlight: 'rgba(240, 176, 79, 0.08)',

    tabBarBg: '#1B1E1B',
    tabBarActive: '#7FCE9F',
    tabBarInactive: '#7C827D',
  },
  spacing: baseSpacing,
  radius: baseRadius,
  typography: baseTypography,
  icon: 22,
};

export const themes: Record<ColorScheme, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
};

export type Theme = AppTheme;
export default themes;