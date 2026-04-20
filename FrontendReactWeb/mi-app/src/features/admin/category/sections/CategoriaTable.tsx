// src/features/seller/category/sections/CategoriaTable.tsx

'use client';

import React from 'react';
import { Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Category } from '../types';
import { dashboardTheme as t } from '../theme/dashboard.theme';

interface CategoriaTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const getIcon = (iconName: string) => {
  const icons: Record<string, string> = {
    Laptop: '💻',
    Shirt: '👕',
    Home: '🏠',
    Sparkles: '✨',
    Dumbbell: '🏋️',
  };
  return icons[iconName] || '📦';
};

export function CategoriaTable({
  categories,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive,
}: CategoriaTableProps) {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: t.textSecondary }}>
        Cargando categorías...
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
          No hay categorías
        </h3>
        <p style={{ color: t.textSecondary, fontSize: 14 }}>
          Crea tu primera categoría para comenzar
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: t.bgCard,
      borderRadius: 16,
      border: `1px solid ${t.border}`,
      overflow: 'hidden',
    }}>
      <table style={{ width: '100%' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${t.border}`, background: t.bgAlt }}>
            <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: t.textSecondary }}>Categoría</th>
            <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: t.textSecondary }}>Descripción</th>
            <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: t.textSecondary }}>Productos</th>
            <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: t.textSecondary }}>Estado</th>
            <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: t.textSecondary }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr
              key={category.id}
              style={{ borderBottom: `1px solid ${t.border}` }}
              className="table-row"
            >
              <td style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: category.color,
                      color: 'white',
                      fontSize: 18,
                    }}
                  >
                    {category.icon ? getIcon(category.icon) : '📦'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, color: t.textPrimary }}>{category.name}</div>
                    <div style={{ fontSize: 11, color: t.textSecondary }}>ID: {category.id}</div>
                  </div>
                </div>
              </td>

              <td style={{ padding: '16px 20px', color: t.textSecondary, fontSize: 14, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {category.description || 'Sin descripción'}
              </td>

              <td style={{ padding: '16px 20px', fontWeight: 600, color: t.textPrimary }}>
                {category.productCount}
              </td>

              <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 20,
                  background: category.isActive ? t.successBg : t.errorBg,
                  color: category.isActive ? t.success : t.error,
                }}>
                  {category.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </td>

              <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    className="action-btn"
                    onClick={() => onToggleActive(category.id)}
                    style={{ color: t.textSecondary }}
                  >
                    {category.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>

                  <button
                    className="action-btn"
                    onClick={() => onEdit(category)}
                    style={{ color: t.textSecondary }}
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    className="action-btn"
                    onClick={() => onDelete(category.id)}
                    style={{ color: t.error }}
                    disabled={category.productCount > 0}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}