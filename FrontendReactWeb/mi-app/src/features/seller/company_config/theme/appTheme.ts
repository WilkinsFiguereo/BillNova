// src/styles/appTheme.ts

const T = {
  brand600: "var(--brand-600)",
  brand700: "var(--brand-700)",
  brand400: "var(--brand-400)",
  brand100: "var(--brand-100)",

  bgMain: "var(--bg-main)",
  bgCard: "var(--bg-card)",
  bgAlt: "var(--bg-alt)",

  text1: "var(--text-primary)",
  text2: "var(--text-secondary)",
  text3: "var(--text-disabled)",

  success: "var(--success-500)",
  successBg: "var(--success-100)",
  error: "var(--error-500)",
  errorBg: "var(--error-100)",
  warn: "var(--warning-500)",
  warnBg: "var(--warning-100)",

  border: "var(--border)",
  borderMd: "var(--border-md)",

  chart: {
    sales: "var(--chart-sales)",
    income: "var(--chart-payments)",
    pending: "var(--chart-pending)",
    overdue: "var(--chart-overdue)",
  },
} as const;

export default T;
