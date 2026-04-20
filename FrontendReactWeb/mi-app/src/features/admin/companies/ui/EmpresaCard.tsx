'use client';

import React from 'react';
import { colors, font, radius } from '../../users/theme/tokens';
import { Badge } from './Badge';
import type { Company } from '../types/company.types';

interface EmpresaCardProps {
  company: Company;
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onToggleActive: (company: Company) => void;
}

export function EmpresaCard({ company, onView, onEdit, onToggleActive }: EmpresaCardProps) {
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
        <Badge plan={company.plan} />
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
        <div style={{ display: 'inline-flex', gap: 8 }}>
          <button
            onClick={() => onView(company)}
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
          >
            Ver
          </button>
          <button
            onClick={() => onEdit(company)}
            style={{
              padding: '5px 12px',
              background: 'transparent',
              border: `1px solid ${colors.accent}`,
              borderRadius: radius.md,
              color: colors.accent,
              fontSize: font.sizes.sm,
              cursor: 'pointer',
            }}
          >
            Editar
          </button>
          <button
            onClick={() => onToggleActive(company)}
            style={{
              padding: '5px 12px',
              background: company.active === false ? colors.success : colors.error,
              border: 'none',
              borderRadius: radius.md,
              color: '#fff',
              fontSize: font.sizes.sm,
              cursor: 'pointer',
            }}
          >
            {company.active === false ? 'Activar' : 'Desactivar'}
          </button>
        </div>
      </td>
    </tr>
  );
}
