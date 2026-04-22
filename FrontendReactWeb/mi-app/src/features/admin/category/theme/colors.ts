// src/features/seller/category/theme/colors.ts

export const colors = {
  brand: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    400: '#3B82F6',
    500: '#2563EB',
    600: '#1E3A8A',
    700: '#1A2F73',
    900: '#0F172A',
  },

  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E2937',
    900: '#0F172A',
  },

  success: {
    100: '#D1FAE5',
    500: '#10B981',
    700: '#059669',
  },

  error: {
    100: '#FEE2E2',
    500: '#EF4444',
    700: '#B91C1C',
  },

  warning: {
    100: '#FEF3C7',
    500: '#F59E0B',
    700: '#B45309',
  },

  background: {
    primary: '#F8FAFC',
    card: '#FFFFFF',
    section: '#F1F5F9',
  },

  border: {
    light: '#E2E8F0',
    medium: '#CBD5E1',
  },

  metrics: {
    sales: '#3B82F6',
    collections: '#10B981',
    pending: '#F59E0B',
    overdue: '#EF4444',
  },
} as const;

export type Colors = typeof colors;