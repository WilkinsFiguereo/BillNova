'use client';

import React from 'react';
import { colors, radius } from '../../users/theme/tokens';
import type { CompanyStatus, CompanyPlan } from '../types/company.types';

interface BadgeProps {
  status?: CompanyStatus;
  plan?: CompanyPlan;
  type?: 'status' | 'plan';
  value?: CompanyStatus | CompanyPlan;
  text?: string;
}

const statusColors: Record<CompanyStatus, { bg: string; color: string }> = {
  'Activa': { bg: '#D1FAE5', color: '#065F46' },
  'Pendiente': { bg: '#FEF3C7', color: '#92400E' },
  'Inactiva': { bg: '#FEE2E2', color: '#7F1D1D' },
};

const planColors: Record<CompanyPlan, { bg: string; color: string }> = {
  'Starter': { bg: '#DBEAFE', color: '#1E3A8A' },
  'Business': { bg: '#E0F2FE', color: '#1E3A8A' },
  'Premium': { bg: '#DBEAFE', color: '#0EA5E9' },
};

export function Badge({ status, plan, type, value, text }: BadgeProps) {
  let colors_map = statusColors['Activa'];
  const label = text || status || plan || value || '';

  if (type === 'status' && value && value in statusColors) {
    colors_map = statusColors[value as CompanyStatus];
  } else if (type === 'plan' && value && value in planColors) {
    colors_map = planColors[value as CompanyPlan];
  } else if (status && status in statusColors) {
    colors_map = statusColors[status];
  } else if (plan && plan in planColors) {
    colors_map = planColors[plan];
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        background: colors_map.bg,
        color: colors_map.color,
        borderRadius: radius.full,
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
