'use client';

import React from 'react';
import { colors, font, radius } from '../../users/theme/tokens';
import { EmpresaCard } from '../ui/EmpresaCard';
import type { Company } from '../types/company.types';

interface ListaEmpresasSectionProps {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  onViewDetails: (company: Company) => void;
}

export function ListaEmpresasSection({
  companies,
  isLoading,
  error,
  onViewDetails,
}: ListaEmpresasSectionProps) {
  if (isLoading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: colors.bg.secondary,
          borderRadius: radius.lg,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            width: 36,
            height: 36,
            border: `3px solid ${colors.bg.tertiary}`,
            borderTopColor: colors.accent,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: 16,
          }}
        />
        <p style={{ fontSize: font.sizes.base, color: colors.text.tertiary }}>Cargando empresas...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          background: colors.error + '22',
          borderRadius: radius.lg,
          border: `1px solid ${colors.error}`,
          color: colors.error,
          fontSize: font.sizes.base,
        }}
      >
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!companies.length) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: colors.bg.secondary,
          borderRadius: radius.lg,
          border: `1px solid ${colors.border}`,
          color: colors.text.tertiary,
        }}
      >
        <p style={{ fontSize: font.sizes.base }}>No se encontraron empresas</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: colors.bg.secondary,
        borderRadius: radius.lg,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: colors.bg.primary }}>
              <th
                style={{
                  padding: '14px',
                  textAlign: 'left',
                  fontSize: font.sizes.sm,
                  fontWeight: font.weights.semibold,
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                Empresa
              </th>
              <th
                style={{
                  padding: '14px',
                  textAlign: 'left',
                  fontSize: font.sizes.sm,
                  fontWeight: font.weights.semibold,
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                Contacto
              </th>
              <th
                style={{
                  padding: '14px',
                  textAlign: 'left',
                  fontSize: font.sizes.sm,
                  fontWeight: font.weights.semibold,
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                Tipo
              </th>
              <th
                style={{
                  padding: '14px',
                  textAlign: 'left',
                  fontSize: font.sizes.sm,
                  fontWeight: font.weights.semibold,
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                Estado
              </th>
              <th
                style={{
                  padding: '14px',
                  textAlign: 'left',
                  fontSize: font.sizes.sm,
                  fontWeight: font.weights.semibold,
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                Ingresos
              </th>
              <th
                style={{
                  padding: '14px',
                  textAlign: 'right',
                  fontSize: font.sizes.sm,
                  fontWeight: font.weights.semibold,
                  color: colors.text.tertiary,
                  textTransform: 'uppercase',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <EmpresaCard key={company.id} company={company} onViewDetails={onViewDetails} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
