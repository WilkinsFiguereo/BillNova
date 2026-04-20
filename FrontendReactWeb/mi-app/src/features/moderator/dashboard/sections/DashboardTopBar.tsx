import React from 'react';
import { RefreshCw } from 'lucide-react';
import { colors } from '../theme/dashboard.theme';

interface DashboardTopBarProps {
  ahora: string;
  periodo: '7d' | '30d' | '1y';
  onPeriodo: (p: '7d' | '30d' | '1y') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const PERIODS: Array<{ key: '7d' | '30d' | '1y'; label: string }> = [
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '1y', label: '1y' },
];

export function DashboardTopBar({ ahora, periodo, onPeriodo, onRefresh, isRefreshing }: DashboardTopBarProps) {
  return (
    <div style={s.wrap}>
      <div>
        <h1 style={s.title}>Panel de control</h1>
        <p style={s.subtitle}>{ahora}</p>
      </div>
      <div style={s.actions}>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Actualizar"
          style={s.refreshBtn}
        >
          <RefreshCw size={16} style={isRefreshing ? { animation: 'spin .8s linear infinite' } : undefined} />
        </button>
        <div style={s.periods}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => onPeriodo(p.key)}
              style={{ ...s.periodBtn, ...(periodo === p.key ? s.periodBtnActive : null) }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: colors.text.primary },
  subtitle: { margin: '4px 0 0', fontSize: 12, color: colors.text.secondary },
  actions: { display: 'flex', alignItems: 'center', gap: 10 },
  periods: { display: 'flex', gap: 8 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    background: colors.bg.secondary,
    color: colors.text.secondary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodBtn: {
    padding: '6px 12px',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    background: colors.bg.secondary,
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  periodBtnActive: {
    background: colors.brand[100],
    borderColor: colors.brand[400],
    color: colors.brand[600],
  },
} as const;
