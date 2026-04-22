export const colors = {
  bg: {
    primary: "var(--bg-main)",
    secondary: "var(--bg-card)",
    tertiary: "var(--bg-alt)",
    alt: "var(--bg-alt)",
    hover: "var(--brand-100)",
  },
  text: {
    primary: "var(--text-primary)",
    secondary: "var(--text-secondary)",
    tertiary: "var(--text-disabled)",
    disabled: "var(--text-disabled)",
  },
  accent: "var(--brand-600)",
  primary: "var(--brand-600)",
  primaryHover: "var(--brand-700)",
  primaryLight: "var(--brand-400)",
  primarySoft: "var(--brand-100)",

  success: "var(--success-500)",
  successSoft: "var(--success-100)",
  warning: "var(--warning-500)",
  warningSoft: "var(--warning-100)",
  error: "var(--error-500)",
  errorSoft: "var(--error-100)",

  border: "var(--border)",
  borderLight: "var(--bg-alt)",

  chartSales: "var(--chart-sales)",
  chartCollections: "var(--chart-payments)",
  chartPending: "var(--chart-pending)",
  chartOverdue: "var(--chart-overdue)",
} as const;

export const font = {
  family: "'Inter', 'Segoe UI', system-ui, sans-serif",
  sizes: {
    xs: "11px",
    sm: "12px",
    base: "14px",
    md: "15px",
    lg: "17px",
    xl: "20px",
    "2xl": "24px",
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    loose: 1.75,
  },
} as const;

export const radius = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

