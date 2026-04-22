'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { colors, font, radius } from '../../users/theme/tokens';
import { Badge } from '../ui/Badge';
import type { Company } from '../types/company.types';

interface TopEmpresasSectionProps {
  companies: Company[];
}

export function TopEmpresasSection({ companies }: TopEmpresasSectionProps) {
  // Get top 5 companies by revenue
  const topCompanies = React.useMemo(() => {
    return [...companies]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5);
  }, [companies]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      style={{
        background: colors.bg.secondary,
        borderRadius: radius.lg,
        border: `1px solid ${colors.border}`,
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <TrendingUp size={20} color={colors.success} />
        <h3 style={{ fontSize: font.sizes.base, fontWeight: font.weights.semibold }}>
          Empresas con Mayor Ingresos
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {topCompanies.map((company, index) => (
          <div
            key={company.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px',
              background: colors.bg.tertiary,
              borderRadius: radius.md,
              borderLeft: `4px solid ${[colors.success, colors.accent, colors.warning, colors.warning, colors.text.tertiary][index]}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: radius.sm,
                  background: '#DBEAFE',
                  fontSize: font.sizes.sm,
                  fontWeight: font.weights.semibold,
                  color: colors.accent,
                }}
              >
                {index + 1}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: font.sizes.sm,
                    fontWeight: font.weights.semibold,
                    color: colors.text.primary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {company.name}
                </p>
                <p
                  style={{
                    fontSize: font.sizes.xs,
                    color: colors.text.tertiary,
                    marginTop: 2,
                  }}
                >
                  {company.sector || 'No especificado'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Badge type="plan" value={company.plan} />
              <div
                style={{
                  textAlign: 'right',
                  minWidth: 100,
                }}
              >
                <p
                  style={{
                    fontSize: font.sizes.sm,
                    fontWeight: font.weights.semibold,
                    color: colors.success,
                  }}
                >
                  {formatCurrency(company.revenue || 0)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {topCompanies.length === 0 && (
        <p
          style={{
            textAlign: 'center',
            color: colors.text.tertiary,
            padding: '30px',
            fontSize: font.sizes.sm,
          }}
        >
          No hay empresas disponibles
        </p>
      )}
    </div>
  );
}
