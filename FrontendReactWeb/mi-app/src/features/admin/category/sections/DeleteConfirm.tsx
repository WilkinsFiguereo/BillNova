// src/features/seller/category/sections/DeleteConfirm.tsx

'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { dashboardTheme as t } from '../theme/dashboard.theme';

interface DeleteConfirmProps {
  isOpen: boolean;
  categoryName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirm({
  isOpen,
  categoryName,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#00000088',
          zIndex: 50,
        }}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 51,
        width: '100%',
        maxWidth: 420,
        background: t.bgCard,
        borderRadius: 16,
        border: `1px solid ${t.border}`,
        boxShadow: '0 24px 64px #00000055',
        padding: '28px 28px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            background: t.errorBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: t.error,
          }}>
            <AlertTriangle size={36} />
          </div>
        </div>

        <h3 style={{
          textAlign: 'center',
          fontSize: 18,
          fontWeight: 600,
          color: t.textPrimary,
          marginBottom: 8,
        }}>
          ¿Estás seguro?
        </h3>

        <p style={{
          textAlign: 'center',
          fontSize: 14,
          color: t.textSecondary,
          marginBottom: 24,
        }}>
          ¿Deseas eliminar la categoría <strong>"{categoryName}"</strong>?
          <br />
          Esta acción no se puede deshacer.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              background: t.error,
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
          </button>
        </div>
      </div>
    </>
  );
}