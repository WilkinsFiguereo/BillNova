'use client';

import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Power, Save, SquarePen, X } from 'lucide-react';
import { colors, font, radius } from '../../users/theme/tokens';
import { Badge } from './Badge';
import type { Company } from '../types/company.types';

interface CompanyDetailSidebarProps {
  company: Company | null;
  isOpen: boolean;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (updates: Partial<Company>) => Promise<void>;
  onToggleStatus: () => Promise<void>;
}

function fieldStyle(disabled: boolean): React.CSSProperties {
  return {
    width: '100%',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    background: disabled ? colors.bg.primary : '#fff',
    color: colors.text.primary,
    fontSize: font.sizes.sm,
    padding: '10px 12px',
    outline: 'none',
  };
}

export function CompanyDetailSidebar({
  company,
  isOpen,
  isSaving,
  error,
  onClose,
  onSave,
  onToggleStatus,
}: CompanyDetailSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Company>>({});

  useEffect(() => {
    if (!company) {
      setDraft({});
      setIsEditing(false);
      return;
    }

    setDraft({
      name: company.name,
      ruc: company.ruc ?? '',
      sector: company.sector ?? '',
      website: company.website ?? '',
      contact_name: company.contact_name ?? '',
      contact_email: company.contact_email ?? company.email ?? '',
      contact_phone: company.contact_phone ?? '',
      city: company.city ?? '',
      address: company.address ?? '',
    });
    setIsEditing(false);
  }, [company]);

  if (!company) return null;

  const disabled = !isEditing || isSaving;
  const isActive = company.status === 'Activa';
  const statusActionLabel = isActive ? 'Deshabilitar empresa' : 'Habilitar empresa';

  async function handleSave() {
    await onSave(draft);
    setIsEditing(false);
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.36)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
          zIndex: 40,
        }}
      />

      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 'min(440px, 100vw)',
          height: '100vh',
          background: colors.bg.secondary,
          borderLeft: `1px solid ${colors.border}`,
          boxShadow: '-24px 0 60px rgba(15, 23, 42, 0.16)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.24s ease',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '22px 22px 18px',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div>
            <div style={{ fontSize: font.sizes.xs, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Empresa
            </div>
            <h3 style={{ margin: '6px 0 0', fontSize: font.sizes.xl, fontWeight: font.weights.bold }}>
              Ver detalles
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.full,
              border: `1px solid ${colors.border}`,
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 22, overflowY: 'auto', flex: 1 }}>
          <div
            style={{
              padding: 18,
              borderRadius: radius.lg,
              background: 'linear-gradient(180deg, #F8FBFF 0%, #EEF4FF 100%)',
              border: `1px solid ${colors.border}`,
              marginBottom: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: font.sizes.lg, fontWeight: font.weights.bold }}>
                  {company.name}
                </h4>
                <p style={{ margin: '6px 0 0', fontSize: font.sizes.sm, color: colors.text.secondary }}>
                  {company.contact_email || 'Sin correo de contacto'}
                </p>
              </div>
              <Badge status={company.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
              <div style={{ padding: 12, borderRadius: radius.md, background: '#fff', border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: font.sizes.xs, color: colors.text.tertiary }}>Plan</div>
                <div style={{ marginTop: 4 }}><Badge plan={company.plan} /></div>
              </div>
              <div style={{ padding: 12, borderRadius: radius.md, background: '#fff', border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: font.sizes.xs, color: colors.text.tertiary }}>Ingresos</div>
                <div style={{ marginTop: 4, fontWeight: font.weights.bold }}>
                  ${(company.revenue || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <label>
              <div style={{ marginBottom: 6, fontSize: font.sizes.xs, color: colors.text.tertiary }}>Nombre</div>
              <input
                value={draft.name ?? ''}
                disabled={disabled}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                style={fieldStyle(disabled)}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>
                <div style={{ marginBottom: 6, fontSize: font.sizes.xs, color: colors.text.tertiary }}>RUC</div>
                <input
                  value={draft.ruc ?? ''}
                  disabled={disabled}
                  onChange={(e) => setDraft((prev) => ({ ...prev, ruc: e.target.value }))}
                  style={fieldStyle(disabled)}
                />
              </label>
              <label>
                <div style={{ marginBottom: 6, fontSize: font.sizes.xs, color: colors.text.tertiary }}>Sector</div>
                <input
                  value={draft.sector ?? ''}
                  disabled={disabled}
                  onChange={(e) => setDraft((prev) => ({ ...prev, sector: e.target.value }))}
                  style={fieldStyle(disabled)}
                />
              </label>
            </div>

            <label>
              <div style={{ marginBottom: 6, fontSize: font.sizes.xs, color: colors.text.tertiary }}>Sitio web</div>
              <input
                value={draft.website ?? ''}
                disabled={disabled}
                onChange={(e) => setDraft((prev) => ({ ...prev, website: e.target.value }))}
                style={fieldStyle(disabled)}
              />
            </label>

            <div style={{ padding: 14, borderRadius: radius.lg, border: `1px solid ${colors.border}`, background: colors.bg.primary }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: colors.text.primary, fontWeight: font.weights.semibold }}>
                <Mail size={15} />
                Contacto principal
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <label>
                  <div style={{ marginBottom: 6, fontSize: font.sizes.xs, color: colors.text.tertiary }}>Responsable</div>
                  <input
                    value={draft.contact_name ?? ''}
                    disabled={disabled}
                    onChange={(e) => setDraft((prev) => ({ ...prev, contact_name: e.target.value }))}
                    style={fieldStyle(disabled)}
                  />
                </label>
                <label>
                  <div style={{ marginBottom: 6, fontSize: font.sizes.xs, color: colors.text.tertiary }}>Email</div>
                  <input
                    value={draft.contact_email ?? ''}
                    disabled={disabled}
                    onChange={(e) => setDraft((prev) => ({ ...prev, contact_email: e.target.value }))}
                    style={fieldStyle(disabled)}
                  />
                </label>
                <label>
                  <div style={{ marginBottom: 6, fontSize: font.sizes.xs, color: colors.text.tertiary }}>Teléfono</div>
                  <input
                    value={draft.contact_phone ?? ''}
                    disabled={disabled}
                    onChange={(e) => setDraft((prev) => ({ ...prev, contact_phone: e.target.value }))}
                    style={fieldStyle(disabled)}
                  />
                </label>
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: radius.lg, border: `1px solid ${colors.border}`, background: colors.bg.primary }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: colors.text.primary, fontWeight: font.weights.semibold }}>
                <MapPin size={15} />
                Ubicación
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <label>
                  <div style={{ marginBottom: 6, fontSize: font.sizes.xs, color: colors.text.tertiary }}>Ciudad</div>
                  <input
                    value={draft.city ?? ''}
                    disabled={disabled}
                    onChange={(e) => setDraft((prev) => ({ ...prev, city: e.target.value }))}
                    style={fieldStyle(disabled)}
                  />
                </label>
                <label>
                  <div style={{ marginBottom: 6, fontSize: font.sizes.xs, color: colors.text.tertiary }}>Dirección</div>
                  <textarea
                    value={draft.address ?? ''}
                    disabled={disabled}
                    onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    style={{ ...fieldStyle(disabled), resize: 'vertical' }}
                  />
                </label>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: radius.md,
                  background: colors.error + '14',
                  border: `1px solid ${colors.error}`,
                  color: colors.error,
                  fontSize: font.sizes.sm,
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            padding: 22,
            borderTop: `1px solid ${colors.border}`,
            display: 'grid',
            gap: 10,
            background: colors.bg.secondary,
          }}
        >
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: radius.md,
              border: 'none',
              background: colors.accent,
              color: '#fff',
              fontWeight: font.weights.semibold,
              cursor: isSaving ? 'wait' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isEditing ? <Save size={16} /> : <SquarePen size={16} />}
            {isEditing ? 'Guardar cambios' : 'Editar empresa'}
          </button>

          <button
            onClick={onToggleStatus}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: radius.md,
              border: `1px solid ${isActive ? '#FCA5A5' : '#A7F3D0'}`,
              background: isActive ? '#FEF2F2' : '#ECFDF5',
              color: isActive ? '#B91C1C' : '#047857',
              fontWeight: font.weights.semibold,
              cursor: isSaving ? 'wait' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            <Power size={16} />
            {statusActionLabel}
          </button>
        </div>
      </aside>
    </>
  );
}
