export const impuestosTheme = {
  brand600: "#1E3A8A",
  brand700: "#1A2F73",
  brand400: "#3B82F6",
  brand100: "#DBEAFE",
  bgMain: "#F8FAFC",
  bgCard: "#FFFFFF",
  bgAlt: "#F1F5F9",
  textPrimary: "#1F2937",
  textSecondary: "#4B5563",
  textDisabled: "#9CA3AF",
  success: "#10B981",
  successBg: "#D1FAE5",
  error: "#EF4444",
  errorBg: "#FEE2E2",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  border: "#E2E8F0",
};

export const globalImpuestosStyles = (t: typeof impuestosTheme) => `
  .btn-primary {
    background: ${t.brand600}; color: white; border: none;
    padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px;
  }
  .btn-secondary {
    background: white; color: ${t.brand600}; border: 1.5px solid ${t.brand100};
    padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
    cursor: pointer;
  }
`;