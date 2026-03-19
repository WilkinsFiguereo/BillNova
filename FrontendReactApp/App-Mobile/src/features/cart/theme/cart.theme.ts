// src/features/cart/theme/cart.theme.ts

export const cartTheme = {
  colors: {
    primary:      '#1E3A8A',
    primaryHover: '#1A2F73',
    primaryLight: '#3B82F6',
    primarySoft:  '#DBEAFE',

    bgMain:  '#F8FAFC',
    bgCard:  '#FFFFFF',
    bgAlt:   '#F1F5F9',

    textPrimary:   '#1F2937',
    textSecondary: '#4B5563',
    textDisabled:  '#9CA3AF',

    success:     '#10B981',
    successSoft: '#D1FAE5',
    error:       '#EF4444',
    errorSoft:   '#FEE2E2',
    warning:     '#F59E0B',
    warningSoft: '#FEF3C7',

    white:       '#FFFFFF',
    borderLight: '#E2E8F0',
    borderMid:   '#CBD5E1',
  },

  font: {
    xs:  11,
    sm:  12,
    md:  14,
    lg:  16,
    xl:  18,
    xxl: 22,
    h1:  28,
  },

  spacing: {
    xs:  4,
    sm:  8,
    md:  12,
    lg:  16,
    xl:  20,
    xxl: 28,
  },

  radius: {
    sm:   6,
    md:   10,
    lg:   14,
    xl:   18,
    full: 999,
  },

  shadow: {
    card: {
      shadowColor:   '#1E3A8A',
      shadowOffset:  { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius:  8,
      elevation:     3,
    },
    button: {
      shadowColor:   '#1E3A8A',
      shadowOffset:  { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius:  10,
      elevation:     6,
    },
  },
} as const;