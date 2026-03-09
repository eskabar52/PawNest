// constants/colors.ts — TÜM UYGULAMA BU DOSYADAN RENK ALIR

export const COLORS = {
  // Ana Renkler
  primary: '#0F1B2D',
  secondary: '#C9A84C',
  accent: '#E8D48B',

  // Arka Plan
  background: '#F8F6F0',
  card: '#FFFFFF',
  cardAlt: '#FAF8F4',

  // Metin
  textPrimary: '#0F1B2D',
  textSecondary: '#6B7A8D',
  textMuted: '#A0AABB',

  // Durum Renkleri
  success: '#2D6A4F',
  warning: '#C9A84C',
  danger: '#8B2635',
  info: '#1B4A6B',

  // Gradient
  gradientStart: '#0F1B2D',
  gradientEnd: '#1A2F4A',

  // Hayvan Teması
  petColors: {
    cat: '#C9A84C',
    dog: '#1B4A6B',
    rabbit: '#2D6A4F',
    bird: '#4A2D6B',
    hamster: '#6B4A2D',
    other: '#6B4A2D',
  },

  // Sınır & Gölge
  border: '#E8E4DC',
  shadow: 'rgba(15, 27, 45, 0.08)',
  shadowStrong: 'rgba(15, 27, 45, 0.18)',
};

export const GRADIENTS = {
  header: ['#0F1B2D', '#1A2F4A'] as const,
  gold: ['#C9A84C', '#E8D48B'] as const,
  card: ['#FFFFFF', '#FAF8F4'] as const,
  success: ['#2D6A4F', '#3D8A6A'] as const,
};

export const SHADOWS = {
  card: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHover: {
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 6,
  },
  button: {
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  header: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8,
  },
};
