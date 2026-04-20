// src/features/seller/category/theme/typography.ts

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],        // Recomendada para SaaS moderno
    // sans: ['DM Sans', 'system-ui', 'sans-serif'],   // Alternativa si prefieres DM Sans
    mono: ['IBM Plex Mono', 'monospace'],
  },

  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px (títulos grandes)
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;