'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useReports } from './hooks/useReports';
import { useCurrentUser } from '@/features/admin/profile/hooks/useCurrentUser';
import { UsersSidebar } from '@/features/admin/users/ui/UsersSidebar';
import { USERS_NAV_ITEMS } from '@/features/admin/users/data/usersNavigation.data';
import { colors, font } from '@/features/admin/users/theme/tokens';
import type { CreateReportPayload } from './types/report.types';

const categoryOptions: Array<{ value: CreateReportPayload['category']; label: string }> = [
  { value: 'bug', label: 'Problema del pedido o producto' },
  { value: 'ui', label: 'Algo llego mal o diferente' },
  { value: 'performance', label: 'Demora o lentitud' },
  { value: 'feature', label: 'Solicitud o mejora' },
  { value: 'other', label: 'Otro' },
];

export function ReportProblemsPage() {
  const { reports, loading, creating, submitReport } = useReports();
  const { user } = useCurrentUser();
  const [formData, setFormData] = useState<CreateReportPayload>({
    title: '',
    description: '',
    category: 'other',
    severity: 'medium',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isClient = user?.role?.toLowerCase().includes('usuario');
  const isModerator = user?.role?.toLowerCase().includes('moderacion');
  const isAdmin = user?.role?.toLowerCase().includes('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!formData.title.trim() || !formData.description.trim()) {
      setSubmitError('Completa el titulo y la descripcion.');
      return;
    }

    try {
      await submitReport(formData);
      setFormData({
        title: '',
        description: '',
        category: 'other',
        severity: 'medium',
      });
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo enviar el reporte.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg.primary, fontFamily: font.family }}>
      {(isModerator || isAdmin) && <UsersSidebar navItems={USERS_NAV_ITEMS} />}

      <main style={{ flex: 1, padding: 24 }}>
        {isClient ? (
          <div style={{ maxWidth: 720, margin: '0 auto', background: colors.bg.secondary, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 24 }}>
            <h1 style={{ marginTop: 0 }}>Reportar problema</h1>
            {submitError && <p style={{ color: colors.error }}>{submitError}</p>}
            {submitSuccess && <p style={{ color: colors.success }}>Reporte enviado correctamente.</p>}
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
              <input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Titulo"
                style={{ padding: 12, borderRadius: 8, border: `1px solid ${colors.border}` }}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as CreateReportPayload['category'] }))}
                style={{ padding: 12, borderRadius: 8, border: `1px solid ${colors.border}` }}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el problema"
                rows={5}
                style={{ padding: 12, borderRadius: 8, border: `1px solid ${colors.border}` }}
              />
              <button type="submit" disabled={creating} style={{ padding: 12, borderRadius: 8, border: 'none', background: colors.primary, color: '#fff' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Send size={16} />
                  {creating ? 'Enviando...' : 'Enviar reporte'}
                </span>
              </button>
            </form>
          </div>
        ) : (
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <h1 style={{ marginTop: 0 }}>Reportes</h1>
            {loading ? <p>Cargando...</p> : <p>Total reportes: {reports.length}</p>}
          </div>
        )}
      </main>
    </div>
  );
}
