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

/**
 * Theme store: holds the active theme mode and exposes a derived `theme` object.
 * Components subscribe to `theme` / `isDark` and re-render only on change
 * (Zustand selector-based memoization keeps this cheap).
 */
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

/** Convenience hook returning the active AppTheme. */
export function useAppTheme(): AppTheme {
  return useThemeStore(s => s.theme);
}

export { themes };