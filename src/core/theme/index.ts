export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  accent: string;
  terracotta: string;
  danger: string;
  success: string;
  warning: string;
  info: string;

  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;

  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  offlineBg: string;
  overlay: string;
  transparent: string;
  rowHighlight: string;

  tabBarBg: string;
  tabBarActive: string;
  tabBarInactive: string;

  bone: string;
  boneHighlight: string;
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

const brand = {
  primary: '#2F5233',
  primaryDark: '#24402A',
  accent: '#D98E29',
  terracotta: '#B5583B',
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    ...brand,
    danger: '#B5583B',
    success: '#2F6B3F',
    warning: '#D98E29',
    info: '#3B6B7D',

    background: '#FAF7F1',
    surface: '#FFFFFF',
    surfaceAlt: '#F1EBE0',
    border: '#E6DFD2',

    text: '#2A2822',
    textSecondary: '#6B6558',
    textMuted: '#9A937F',
    textInverse: '#FFFFFF',

    offlineBg: '#F6E8CF',
    overlay: 'rgba(42, 40, 34, 0.45)',
    transparent: 'transparent',
    rowHighlight: 'rgba(47, 82, 51, 0.06)',

    tabBarBg: '#FFFFFF',
    tabBarActive: '#2F5233',
    tabBarInactive: '#9A937F',

    bone: '#EFE8DB',
    boneHighlight: '#F9F5EC',
  },
  spacing: baseSpacing,
  radius: baseRadius,
  typography: baseTypography,
  icon: 22,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    primary: '#8FBE96',
    primaryDark: '#6FA177',
    accent: '#E8A94F',
    terracotta: '#D0826A',
    danger: '#E28570',
    success: '#7FBF92',
    warning: '#E8A94F',
    info: '#7FA8BC',

    background: '#1C1B17',
    surface: '#262521',
    surfaceAlt: '#302E29',
    border: '#3B3931',

    text: '#F0EDE4',
    textSecondary: '#BEB8A8',
    textMuted: '#8B8577',
    textInverse: '#26251F',

    offlineBg: '#3A3222',
    overlay: 'rgba(0, 0, 0, 0.6)',
    transparent: 'transparent',
    rowHighlight: 'rgba(232, 169, 79, 0.08)',

    tabBarBg: '#262521',
    tabBarActive: '#E8A94F',
    tabBarInactive: '#8B8577',

    bone: '#302E29',
    boneHighlight: '#3B3931',
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
