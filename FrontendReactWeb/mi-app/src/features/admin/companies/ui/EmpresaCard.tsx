'use client';

import React from 'react';
import { colors, font, radius } from '../../users/theme/tokens';
import { Badge } from './Badge';
import type { Company } from '../types/company.types';

interface EmpresaCardProps {
  company: Company;
  onViewDetails: (company: Company) => void;
}

export function EmpresaCard({ company, onViewDetails }: EmpresaCardProps) {
  return (
    <tr>
      <td
        style={{
          padding: '14px',
          borderBottom: `1px solid ${colors.border}`,
          fontSize: font.sizes.base,
          color: colors.text.primary,
        }}
      >
        <div style={{ fontWeight: 600 }}>{company.name}</div>
        <div style={{ fontSize: font.sizes.sm, color: colors.text.tertiary, marginTop: 2 }}>
          {company.ruc && `RUC: ${company.ruc}`}
        </div>
      </td>
      <td
        style={{
          padding: '14px',
          borderBottom: `1px solid ${colors.border}`,
          fontSize: font.sizes.base,
          color: colors.text.secondary,
        }}
      >
        {company.contact_email || '—'}
      </td>
      <td
        style={{
          padding: '14px',
          borderBottom: `1px solid ${colors.border}`,
          fontSize: font.sizes.base,
          color: colors.text.secondary,
        }}
      >
        {company.sector || '—'}
      </td>
      <td
        style={{
          padding: '14px',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Badge status={company.status} />
      </td>
      <td
        style={{
          padding: '14px',
          borderBottom: `1px solid ${colors.border}`,
          fontSize: font.sizes.base,
          color: colors.text.primary,
          fontWeight: 600,
        }}
      >
        ${(company.revenue || 0).toLocaleString()}
      </td>
      <td
        style={{
          padding: '14px',
          borderBottom: `1px solid ${colors.border}`,
          textAlign: 'right',
        }}
      >
        <button
          onClick={() => onViewDetails(company)}
          style={{
            padding: '5px 12px',
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: radius.md,
            color: colors.text.secondary,
            fontSize: font.sizes.sm,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = colors.accent;
            e.currentTarget.style.color = colors.accent;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.color = colors.text.secondary;
          }}
        >
          Ver detalles
        </button>
      </td>
    </tr>
  );
}
