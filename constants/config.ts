// constants/config.ts — Uygulama Sabitleri

export const APP_CONFIG = {
  name: 'PawNest',
  slogan: 'Her hayvanın bir yuvası olsun.',
  version: '1.0.0',

  // Ücretsiz plan limitleri
  freePlan: {
    maxPets: 2,
    maxPhotos: 50,
    maxAiMessages: 10, // günlük
  },

  // Desteklenen hayvan türleri
  petTypes: ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'other'] as const,

  // Desteklenen bakım frekansları
  careFrequencies: ['daily', 'weekly', 'monthly', 'yearly'] as const,
};

export const PET_TYPE_LABELS: Record<string, string> = {
  dog: 'Köpek',
  cat: 'Kedi',
  rabbit: 'Tavşan',
  hamster: 'Hamster',
  bird: 'Kuş',
  other: 'Diğer',
};

export const PET_TYPE_ICONS: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  rabbit: '🐇',
  hamster: '🐹',
  bird: '🐦',
  other: '🐾',
};
