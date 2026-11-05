import { create } from 'zustand';
import { ThemeColors, lightTheme, darkTheme } from '../constants/theme';

interface ThemeState {
  isDarkMode: boolean;
  theme: ThemeColors;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: false,
  theme: lightTheme,
  toggleTheme: () =>
    set((state) => {
      const nextMode = !state.isDarkMode;
      return {
        isDarkMode: nextMode,
        theme: nextMode ? darkTheme : lightTheme,
      };
    }),
  setTheme: (isDark: boolean) =>
    set({
      isDarkMode: isDark,
      theme: isDark ? darkTheme : lightTheme,
    }),
}));
