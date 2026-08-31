export type ColorScheme = 'light' | 'dark';

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
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
  shadowPrimary: string;
}

export interface AppTheme {
  mode: ColorScheme;
  colors: ThemeColors;
  shadow: {
    soft: ShadowStyle;
    card: ShadowStyle;
  };
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
  sm: 8,
  md: 12,
  lg: 18,
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
  primary: '#1B4332',
  primaryDark: '#081C15',
  secondary: '#84A98C',
  accent: '#C59D5F',
};

const lightShadow = {
  soft: {
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#12291F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
};

const darkShadow = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 3,
  },
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    ...brand,
    danger: '#B3402F',
    success: '#2E7D5B',
    warning: '#B98A2F',
    info: '#3E7CB1',

    background: '#FAF6EF',
    surface: '#FFFFFF',
    surfaceAlt: '#F1ECE1',
    border: '#E6DFD2',

    text: '#1C2A24',
    textSecondary: '#55655D',
    textMuted: '#8A968E',
    textInverse: '#FFFFFF',

    offlineBg: '#F4ECDD',
    overlay: 'rgba(28, 42, 36, 0.45)',
    transparent: 'transparent',
    rowHighlight: 'rgba(27, 67, 50, 0.06)',

    tabBarBg: '#FFFFFF',
    tabBarActive: '#1B4332',
    tabBarInactive: '#9AA69E',

    bone: '#EAE4D8',
    boneHighlight: '#F7F3EA',
    shadowPrimary: '#2F3E2A',
  },
  shadow: lightShadow,
  spacing: baseSpacing,
  radius: baseRadius,
  typography: baseTypography,
  icon: 22,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    primary: '#74C69D',
    primaryDark: '#52B788',
    secondary: '#9DBFA6',
    accent: '#D9B36C',
    danger: '#E07A6A',
    success: '#7FC9A6',
    warning: '#D9B36C',
    info: '#7FB0C9',

    background: '#0F1512',
    surface: '#17201B',
    surfaceAlt: '#1F2A24',
    border: '#2A362F',

    text: '#EAF1EE',
    textSecondary: '#A9B7B3',
    textMuted: '#71807C',
    textInverse: '#0F1512',

    offlineBg: '#3A3322',
    overlay: 'rgba(0, 0, 0, 0.6)',
    transparent: 'transparent',
    rowHighlight: 'rgba(116, 198, 157, 0.08)',

    tabBarBg: '#17201B',
    tabBarActive: '#74C69D',
    tabBarInactive: '#71807C',

    bone: '#1F2A24',
    boneHighlight: '#2A362F',
    shadowPrimary: '#000000',
  },
  shadow: darkShadow,
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
