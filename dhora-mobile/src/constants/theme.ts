export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  card: string;
  success: string;
  error: string;
  warning: string;
}

export const lightTheme: ThemeColors = {
  background: '#F9F9F7',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F2EE',
  border: '#E5E3DC',
  textPrimary: '#18181B',
  textSecondary: '#71717A',
  textTertiary: '#A1A1AA',
  accent: '#C28E58', // DHORA Fashion Gold
  accentLight: '#FBF5EE',
  accentDark: '#8E6235',
  card: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

export const darkTheme: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#282828',
  border: '#333333',
  textPrimary: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  accent: '#D4A373',
  accentLight: '#2A2016',
  accentDark: '#A57444',
  card: '#1E1E1E',
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
  button: { fontSize: 15, fontWeight: '600' as const },
};
