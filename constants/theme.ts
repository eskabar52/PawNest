// constants/theme.ts — Aydınlık & Karanlık Mod Renk Sistemi

export const THEMES = {
  light: {
    background: '#F8F6F0',
    surface: '#FFFFFF',
    surfaceAlt: '#FAF8F4',
    textPrimary: '#0F1B2D',
    textSecondary: '#6B7A8D',
    textMuted: '#A0AABB',
    border: '#E8E4DC',
    shadow: 'rgba(15, 27, 45, 0.08)',
    shadowStrong: 'rgba(15, 27, 45, 0.18)',
    navBackground: 'rgba(255, 255, 255, 0.96)',
    navBorder: 'rgba(0, 0, 0, 0.06)',
    gradientStart: '#0F1B2D',
    gradientEnd: '#1A2F4A',
    success: '#2D6A4F',
    danger: '#8B2635',
    info: '#1B4A6B',
  },

  dark: {
    background: '#0A0F18',
    surface: '#111827',
    surfaceAlt: '#1A2335',
    textPrimary: '#F0EDE8',
    textSecondary: '#8A9BB0',
    textMuted: '#4A5A6B',
    border: '#1E2D42',
    shadow: 'rgba(0, 0, 0, 0.30)',
    shadowStrong: 'rgba(0, 0, 0, 0.50)',
    navBackground: 'rgba(10, 15, 24, 0.97)',
    navBorder: 'rgba(255, 255, 255, 0.06)',
    gradientStart: '#0A0F18',
    gradientEnd: '#0F1B2D',
    success: '#3D8A6A',
    danger: '#C0394A',
    info: '#2A6A9B',
  },

  shared: {
    primary: '#0F1B2D',
    secondary: '#C9A84C',
    accent: '#E8D48B',
    petColors: {
      cat: '#C9A84C',
      dog: '#4A7FA5',
      rabbit: '#5A9A72',
      bird: '#7A5A9A',
      hamster: '#8A6A4A',
      other: '#8A6A4A',
    },
  },
};

export type ThemeMode = 'light' | 'dark';
export type ThemeColors = typeof THEMES.light;
export type SharedColors = typeof THEMES.shared;
