'use client';

import React, { useMemo } from 'react';
import { colors, font, radius } from '../../users/theme/tokens';
import type { Company } from '../types/company.types';

interface GraficasSectionProps {
  companies: Company[];
}

export function GraficasSection({ companies }: GraficasSectionProps) {
  const chartData = useMemo(() => {
    const statusDist = {
      Activa: companies.filter((company) => company.status === 'Activa').length,
      Pendiente: companies.filter((company) => company.status === 'Pendiente').length,
      Inactiva: companies.filter((company) => company.status === 'Inactiva').length,
    };

    const topRevenue = [...companies]
      .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
      .slice(0, 5)
      .reduce<Record<string, number>>((acc, company) => {
        acc[company.name] = company.revenue ?? 0;
        return acc;
      }, {});

    return { statusDist, topRevenue };
  }, [companies]);

  const renderBarChart = (
    title: string,
    data: Record<string, number>,
    colorMap: Record<string, string>,
  ) => {
    const maxValue = Math.max(...Object.values(data), 1);
    const bars = Object.entries(data);

    return (
      <div
        style={{
          background: colors.bg.secondary,
          padding: '20px',
          borderRadius: radius.lg,
          border: `1px solid ${colors.border}`,
        }}
      >
        <h3 style={{ fontSize: font.sizes.sm, fontWeight: font.weights.semibold, marginBottom: 16 }}>
          {title}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bars.map(([label, value]) => (
            <div key={label}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  fontSize: font.sizes.sm,
                }}
              >
                <span style={{ color: colors.text.primary }}>{label}</span>
                <span style={{ fontWeight: font.weights.semibold, color: colorMap[label] }}>
                  {value}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 8,
                  background: colors.bg.tertiary,
                  borderRadius: radius.sm,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(value / maxValue) * 100}%`,
                    background: colorMap[label],
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const statusColorMap: Record<string, string> = {
    Activa: colors.success,
    Pendiente: colors.warning,
    Inactiva: colors.error,
  };

  const revenueColorMap = Object.keys(chartData.topRevenue).reduce<Record<string, string>>((acc, label, index) => {
    const palette = [colors.success, colors.accent, colors.warning, '#7C3AED', '#0EA5E9'];
    acc[label] = palette[index % palette.length];
    return acc;
  }, {});

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
      {renderBarChart('Distribucion por estado', chartData.statusDist, statusColorMap)}
      {renderBarChart('Top empresas por ingresos', chartData.topRevenue, revenueColorMap)}
    </div>
  );
}
