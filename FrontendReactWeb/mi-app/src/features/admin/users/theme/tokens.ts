// ── Colors (desde dashboardTheme) ────────────────────────────────────────────

export const colors = {
  bg: {
    primary:   "#F8FAFC",
    secondary: "#FFFFFF",
    tertiary:  "#F1F5F9",
    alt:       "#F1F5F9",
    hover:     "#DBEAFE",
  },
  text: {
    primary:   "#1F2937",
    secondary: "#4B5563",
    tertiary:  "#9CA3AF",
    disabled:  "#9CA3AF",
  },
  accent:     "#1E3A8A",
  primary:    "#1E3A8A",
  primaryHover: "#1A2F73",
  primaryLight: "#3B82F6",
  primarySoft: "#DBEAFE",
  
  success:    "#10B981",
  successSoft: "#D1FAE5",
  warning:    "#F59E0B",
  warningSoft: "#FEF3C7",
  error:      "#EF4444",
  errorSoft:  "#FEE2E2",
  
  border:     "#E2E8F0",
  borderLight: "#F1F5F9",
  
  chartSales: "#3B82F6",
  chartCollections: "#10B981",
  chartPending: "#F59E0B",
  chartOverdue: "#EF4444",
} as const;


// ── Typography ───────────────────────────────────────────────────────────────

export const font = {
  family: "'Inter', 'Segoe UI', system-ui, sans-serif",
  sizes: {
    xs:   "11px",
    sm:   "12px",
    base: "14px",
    md:   "15px",
    lg:   "17px",
    xl:   "20px",
    "2xl":"24px",
  },
  weights: {
    normal:   400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },
  lineHeight: {
    tight:  1.25,
    normal: 1.5,
    loose:  1.75,
  },
} as const;

// ── Border Radius ─────────────────────────────────────────────────────────────

export const radius = {
  sm:   "6px",
  md:   "8px",
  lg:   "12px",
  xl:   "16px",
  full: "9999px",
} as const;