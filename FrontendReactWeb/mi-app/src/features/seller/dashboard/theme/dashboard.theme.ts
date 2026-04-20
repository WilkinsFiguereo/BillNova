"use client";

import { DashboardTheme } from "../types/dashboard.types";

export const dashboardTheme: DashboardTheme = {
  // Brand
  brand600: "var(--brand-600)",
  brand700: "var(--brand-700)",
  brand400: "var(--brand-400)",
  brand100: "var(--brand-100)",

  // Fondos
  bgMain: "var(--bg-main)",
  bgCard: "var(--bg-card)",
  bgAlt: "var(--bg-alt)",

  // Tipografia
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textDisabled: "var(--text-disabled)",

  // Estados
  success: "var(--success-500)",
  successBg: "var(--success-100)",
  error: "var(--error-500)",
  errorBg: "var(--error-100)",
  warning: "var(--warning-500)",
  warningBg: "var(--warning-100)",

  // Bordes
  border: "var(--border)",
};

export const globalStyles = (t: DashboardTheme) => `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 10px; }

  .btn-primary {
    background: ${t.brand600}; color: white; border: none;
    padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;
  }
  .btn-primary:hover {
    background: ${t.brand700}; transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(30,58,138,0.25);
  }
  .btn-secondary {
    background: ${t.bgCard}; color: ${t.brand600}; border: 1.5px solid ${t.brand100};
    padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;
  }
  .btn-secondary:hover { background: ${t.brand100}; transform: translateY(-1px); }

  .btn-icon {
    width: 40px; height: 40px;
    display: inline-flex; align-items: center; justify-content: center;
    background: ${t.bgCard}; color: ${t.textSecondary};
    border: 1.5px solid ${t.brand100};
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-icon:hover { background: ${t.brand100}; transform: translateY(-1px); }
  .btn-icon:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 16px;
    border-radius: 10px; cursor: pointer; transition: all 0.2s;
    font-size: 14px; font-weight: 500; color: ${t.textSecondary};
  }
  .nav-item:hover { background: rgba(59,130,246,0.08); color: ${t.brand600}; }
  .nav-item.active { background: ${t.brand100}; color: ${t.brand600}; font-weight: 600; }

  .table-row:hover { background: ${t.bgAlt}; }
  .action-btn {
    border: none; background: none; cursor: pointer; padding: 6px 10px;
    border-radius: 8px; font-size: 13px; transition: all 0.15s;
  }
  .action-btn:hover { background: ${t.bgAlt}; }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
