// src/features/seller/category/sections/CategoriaHeader.tsx

'use client';

import React from 'react';
import { Plus, Package, CheckCircle2, XCircle, ShoppingCart, Search } from 'lucide-react';
import { dashboardTheme as t } from '../theme/dashboard.theme';
import { CategoryStats } from '../types';

interface CategoriaHeaderProps {
  stats: CategoryStats;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onCreateNew: () => void;
}

export function CategoriaHeader({
  stats,
  searchTerm,
  setSearchTerm,
  onCreateNew,
}: CategoriaHeaderProps) {
  return (
    <div style={{ animation: 'slideIn 0.4s ease' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 28,
      }}>
        <div>
          <h1 style={{
            fontSize: 26,
            fontWeight: 700,
            color: t.textPrimary,
            letterSpacing: '-0.02em',
          }}>
            Categorías de Productos
          </h1>
          <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 4 }}>
            Gestión de categorías ·{' '}
            <span style={{ color: t.brand400, fontWeight: 600 }}>
              {stats.total} categorías
            </span>
          </p>
        </div>

        <button className="btn-primary" onClick={onCreateNew}>
          <Plus size={15} /> Nueva Categoría
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 28,
      }}>
        <div style={{
          background: t.bgCard,
          borderRadius: 16,
          padding: 20,
          border: `1px solid ${t.border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: t.textSecondary }}>Total Categorías</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: t.textPrimary, marginTop: 4 }}>
                {stats.total}
              </p>
            </div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: t.brand100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: t.brand600,
            }}>
              <Package size={24} />
            </div>
          </div>
        </div>

        <div style={{
          background: t.bgCard,
          borderRadius: 16,
          padding: 20,
          border: `1px solid ${t.border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: t.textSecondary }}>Categorías Activas</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: t.success, marginTop: 4 }}>
                {stats.active}
              </p>
            </div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: t.successBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: t.success,
            }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div style={{
          background: t.bgCard,
          borderRadius: 16,
          padding: 20,
          border: `1px solid ${t.border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: t.textSecondary }}>Categorías Inactivas</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: t.textSecondary, marginTop: 4 }}>
                {stats.inactive}
              </p>
            </div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: t.bgAlt,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: t.textSecondary,
            }}>
              <XCircle size={24} />
            </div>
          </div>
        </div>

        <div style={{
          background: t.bgCard,
          borderRadius: 16,
          padding: 20,
          border: `1px solid ${t.border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: t.textSecondary }}>Total Productos</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: t.textPrimary, marginTop: 4 }}>
                {stats.totalProducts}
              </p>
            </div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: t.brand100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: t.brand600,
            }}>
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: 400 }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: t.textSecondary,
          }}
        />
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 12px 12px 44px',
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            fontSize: 14,
            color: t.textPrimary,
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}