"use client";

import { DashboardTheme } from "../types/dashboard.types";

export const dashboardTheme: DashboardTheme = {
  brand600: "var(--brand-600)",
  brand700: "var(--brand-700)",
  brand400: "var(--brand-400)",
  brand100: "var(--brand-100)",

  bgMain: "var(--bg-main)",
  bgCard: "var(--bg-card)",
  bgAlt: "var(--bg-alt)",

  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textDisabled: "var(--text-disabled)",

  success: "var(--success-500)",
  successBg: "var(--success-100)",
  error: "var(--error-500)",
  errorBg: "var(--error-100)",
  warning: "var(--warning-500)",
  warningBg: "var(--warning-100)",

  border: "var(--border)",
};

export const globalStyles = (t: DashboardTheme) => `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --brand-600: #1e3a8a;
    --brand-700: #1a2f73;
    --brand-400: #3b82f6;
    --brand-100: #dbeafe;

    --bg-main: #f8fafc;
    --bg-card: #ffffff;
    --bg-alt: #f1f5f9;

    --text-primary: #1f2937;
    --text-secondary: #4b5563;
    --text-disabled: #9ca3af;

    --success-500: #10b981;
    --success-100: #d1fae5;
    --error-500: #ef4444;
    --error-100: #fee2e2;
    --warning-500: #f59e0b;
    --warning-100: #fef3c7;

    --chart-sales: #3b82f6;
    --chart-payments: #1e3a8a;
    --chart-pending: #f59e0b;
    --chart-overdue: #ef4444;

    --border: #e2e8f0;
  }

  html.dark {
    --brand-600: #60a5fa;
    --brand-700: #3b82f6;
    --brand-400: #93c5fd;
    --brand-100: rgba(96, 165, 250, 0.14);

    --bg-main: #0f172a;
    --bg-card: #111827;
    --bg-alt: #1f2937;

    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-disabled: #94a3b8;

    --success-500: #34d399;
    --success-100: rgba(52, 211, 153, 0.16);
    --error-500: #f87171;
    --error-100: rgba(248, 113, 113, 0.16);
    --warning-500: #fbbf24;
    --warning-100: rgba(251, 191, 36, 0.16);

    --chart-sales: #60a5fa;
    --chart-payments: #93c5fd;
    --chart-pending: #fbbf24;
    --chart-overdue: #f87171;

    --border: #334155;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: var(--bg-main);
    color: var(--text-primary);
    transition: background-color 0.2s ease, color 0.2s ease;
  }
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

  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 16px;
    border-radius: 10px; cursor: pointer;
    font-size: 14px; font-weight: 500; color: ${t.textSecondary};
    transition: background-color 0.2s ease, color 0.2s ease;
  }
  .nav-item.active {
    background: ${t.brand100};
    color: ${t.textPrimary};
  }

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
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
