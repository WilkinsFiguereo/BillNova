'use client';

import React from 'react';
import { colors, font, radius } from '../../users/theme/tokens';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export function FilterBar({ searchQuery, onSearchChange, placeholder = 'Buscar empresa, email, RUC...' }: FilterBarProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <input
        type="search"
        placeholder={placeholder}
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: colors.bg.secondary,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.md,
          color: colors.text.primary,
          fontSize: font.sizes.base,
          fontFamily: font.family,
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = colors.accent;
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = colors.border;
        }}
      />
    </div>
  );
}
