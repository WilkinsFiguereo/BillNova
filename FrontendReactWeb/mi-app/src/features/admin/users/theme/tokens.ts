export const font = {
  family: "'DM Sans', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  size: {
    xs: 12,
    sm: 13,
    base: 14,
    lg: 16,
    xl: 18,
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export const colors = {
  brand: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    200: "#C7D2FE",
    300: "#A5B4FC",
    400: "#818CF8",
    500: "#6366F1",
    600: "#4F46E5",
    700: "#4338CA",
    800: "#3730A3",
    900: "#312E81",
  },
  bg: {
    primary: "#F7F8FC",
    secondary: "#FFFFFF",
    alt: "#F1F5F9",
  },
  text: {
    primary: "#0F172A",
    secondary: "#334155",
    disabled: "#64748B",
  },
  border: "#E2E8F0",
  error: {
    DEFAULT: "#DC2626",
    soft: "#FEF2F2",
    text: "#991B1B",
  },
  success: {
    DEFAULT: "#16A34A",
    soft: "#DCFCE7",
    text: "#166534",
  },
} as const;

