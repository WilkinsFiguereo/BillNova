'use client';

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useReports } from './hooks/useReports';
import { useCurrentUser } from '@/features/admin/profile/hooks/useCurrentUser';
import { UsersSidebar } from '@/features/admin/users/ui/UsersSidebar';
import { USERS_NAV_ITEMS } from '@/features/admin/users/data/usersNavigation.data';
import { colors, font } from '@/features/admin/users/theme/tokens';
import type { CreateReportPayload } from './types/report.types';

export function ReportProblemsPage() {
  const { reports, loading, creating, error, submitReport } = useReports();
  const { user } = useCurrentUser();
  const [formData, setFormData] = useState<CreateReportPayload>({
    title: '',
    description: '',
    category: 'damaged',
    severity: 'medium',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Determinar si es cliente, moderador o admin
  const isClient = user?.role?.toLowerCase().includes('cliente') || user?.role?.toLowerCase().includes('user');
  const isModerator = user?.role?.toLowerCase().includes('moderador');
  const isAdmin = user?.role?.toLowerCase().includes('admin');

  // Opciones de categoría para clientes (reportes de envío/producto)
  const categoryOptions = [
    { value: 'damaged', label: '📦 Producto llegó dañado' },
    { value: 'not-received', label: '❌ Producto no me llegó' },
    { value: 'late', label: '⏱️ Llegó tarde' },
    { value: 'wrong-item', label: '🔄 Producto equivocado' },
    { value: 'quality-issue', label: '⚠️ Problemas de calidad' },
    { value: 'other', label: '📝 Otro' },
  ];

  const severityOptions = [
    { value: 'low', label: 'Bajo', color: '#10B981' },
    { value: 'medium', label: 'Medio', color: '#F59E0B' },
    { value: 'high', label: 'Alto', color: '#EF4444' },
    { value: 'critical', label: 'Crítico', color: '#DC2626' },
  ];

  const statusConfig = {
    open: { label: 'Abierto', color: colors.primaryLight, bg: colors.primarySoft, icon: AlertCircle },
    'in-progress': { label: 'En Proceso', color: colors.warning, bg: colors.warningSoft, icon: Clock },
    resolved: { label: 'Resuelto', color: colors.success, bg: colors.successSoft, icon: CheckCircle },
    closed: { label: 'Cerrado', color: colors.text.tertiary, bg: colors.bg.alt, icon: AlertTriangle },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!formData.title.trim() || !formData.description.trim()) {
      setSubmitError('Por favor completa el título y descripción');
      return;
    }

    try {
      await submitReport(formData);
      setFormData({
        title: '',
        description: '',
        category: 'damaged',
        severity: 'medium',
      });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al reportar problema');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg.primary, fontFamily: font.family }}>
      {/* Sidebar solo para Moderador y Admin */}
      {(isModerator || isAdmin) && <UsersSidebar navItems={USERS_NAV_ITEMS} />}

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <div style={{
          background: colors.bg.secondary,
          borderBottom: `1px solid ${colors.border}`,
          padding: '24px',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, margin: '0 0 8px 0' }}>
              {isClient ? 'Reportar un Problema' : 'Centro de Moderación - Reportes'}
            </h1>
            <p style={{ fontSize: 14, color: colors.text.secondary, margin: 0 }}>
              {isClient 
                ? 'Cuéntanos qué pasó con tu pedido para poder ayudarte'
                : 'Revisa y gestiona los reportes de los clientes'}
            </p>
          </div>
        </div>

        {/* Contenido - Mostrar diferente según rol */}
        {isClient ? (
          // VER CLIENTE - Solo formulario
          <div style={{ maxWidth: 700, margin: '32px auto', padding: '0 24px' }}>
            <div style={{
              background: colors.bg.secondary,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: 24,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text.primary, margin: '0 0 20px 0' }}>
                Enviar Reporte
              </h2>

              {submitError && (
                <div style={{
                  padding: 12,
                  background: colors.errorSoft,
                  border: `1px solid ${colors.error}`,
                  borderRadius: 8,
                  color: colors.error,
                  fontSize: 13,
                  marginBottom: 16,
                }}>
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div style={{
                  padding: 12,
                  background: colors.successSoft,
                  border: `1px solid ${colors.success}`,
                  borderRadius: 8,
                  color: colors.success,
                  fontSize: 13,
                  marginBottom: 16,
                }}>
                  ✓ Reporte enviado correctamente. Te contactaremos pronto.
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Categoría */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.text.primary, marginBottom: 6 }}>
                    ¿Cuál es el problema? *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      color: colors.text.primary,
                      background: colors.bg.primary,
                      boxSizing: 'border-box',
                    }}
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.text.primary, marginBottom: 6 }}>
                    Detalles del problema *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Cuéntanos qué pasó, qué esperabas y qué pasó en su lugar..."
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      color: colors.text.primary,
                      background: colors.bg.primary,
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Severidad */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.text.primary, marginBottom: 6 }}>
                    Nivel de urgencia
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {severityOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, severity: opt.value as any }))}
                        style={{
                          padding: '10px 12px',
                          border: `2px solid ${formData.severity === opt.value ? opt.color : colors.border}`,
                          borderRadius: 8,
                          background: formData.severity === opt.value ? opt.color + '20' : colors.bg.primary,
                          color: formData.severity === opt.value ? opt.color : colors.text.secondary,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botón */}
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: '12px 24px',
                    background: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: creating ? 'not-allowed' : 'pointer',
                    opacity: creating ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Send size={16} />
                  {creating ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          // VER MODERADOR/ADMIN - Solo lista de reportes
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text.primary, margin: '0 0 20px 0' }}>
              Reportes Activos ({reports.length})
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ width: 40, height: 40, border: `3px solid ${colors.primarySoft}`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
                {reports.map(report => {
                  const config = statusConfig[report.status];
                  const Icon = config.icon;
                  const category = categoryOptions.find(c => c.value === report.category)?.label || report.category;

                  return (
                    <div
                      key={report.id}
                      style={{
                        background: colors.bg.secondary,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 12,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.text.primary, margin: '0 0 4px 0' }}>
                            {report.title}
                          </h3>
                          <p style={{ fontSize: 11, color: colors.text.secondary, margin: 0 }}>
                            Por {report.reporter.name}
                          </p>
                        </div>
                        <Icon size={18} color={config.color} />
                      </div>

                      <p style={{ fontSize: 12, color: colors.text.secondary, margin: 0, lineHeight: 1.5 }}>
                        {report.description.substring(0, 120)}...
                      </p>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 10,
                          padding: '4px 8px',
                          background: colors.bg.alt,
                          borderRadius: 4,
                          color: colors.text.secondary,
                        }}>
                          {category}
                        </span>

                        <span style={{
                          fontSize: 10,
                          padding: '4px 8px',
                          background: `${severityOptions.find(s => s.value === report.severity)?.color}20` || colors.bg.alt,
                          color: severityOptions.find(s => s.value === report.severity)?.color || colors.text.secondary,
                          borderRadius: 4,
                          fontWeight: 700,
                        }}>
                          {severityOptions.find(s => s.value === report.severity)?.label}
                        </span>

                        <span style={{
                          fontSize: 10,
                          padding: '4px 8px',
                          background: config.bg,
                          color: config.color,
                          borderRadius: 4,
                          fontWeight: 700,
                        }}>
                          {config.label}
                        </span>
                      </div>

                      <div style={{ fontSize: 10, color: colors.text.tertiary }}>
                        {new Date(report.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
