import { create } from 'zustand';
import { themes, ColorScheme, AppTheme } from './index';

export type ThemeMode = ColorScheme;

interface ThemeState {
  mode: ThemeMode;
  theme: AppTheme;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>(set => ({
  mode: 'light',
  theme: themes.light,
  isDark: false,
  setMode: mode =>
    set({
      mode,
      theme: themes[mode],
      isDark: mode === 'dark',
    }),
  toggle: () =>
    set(state => {
      const next: ThemeMode = state.mode === 'dark' ? 'light' : 'dark';
      return { mode: next, theme: themes[next], isDark: next === 'dark' };
    }),
}));

export function useAppTheme(): AppTheme {
  return useThemeStore(s => s.theme);
}

export { themes };
