'use client';

import React from 'react';
import { colors, font, radius } from '../../users/theme/tokens';

interface StatCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export function StatCard({ label, value, subtext, icon, accentColor = colors.accent }: StatCardProps) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 200,
        padding: '20px',
        background: colors.bg.secondary,
        borderRadius: radius.lg,
        border: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      {icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            background: accentColor + '15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            fontSize: 20,
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: font.sizes.sm, color: colors.text.secondary, textTransform: 'uppercase' }}>
          {label}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: font.sizes['2xl'], fontWeight: font.weights.bold, color: colors.text.primary }}>
          {value}
        </p>
        {subtext && (
          <p style={{ margin: '4px 0 0', fontSize: font.sizes.xs, color: colors.text.tertiary }}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
