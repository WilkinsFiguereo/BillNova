"use client";

import React from 'react';
import { colors } from '@/features/moderator/report_moderation/theme/reportes.theme';
import { dashboardTheme as t, globalStyles } from '@/features/seller/dashboard/theme/dashboard.theme';
import { useReportes } from '@/features/moderator/report_moderation/hooks/useReportes';
import { ReportesHeader } from '@/features/moderator/report_moderation/sections/ReportesHeader';
import { ReportesFilters } from '@/features/moderator/report_moderation/sections/ReportesFilters';
import { ReportesTable } from '@/features/moderator/report_moderation/sections/ReportesTable';
import { ReporteDetailModal } from '@/features/moderator/report_moderation/sections/ReporteDetailModal';

interface SharedReportsPageProps {
  sidebar: React.ReactNode;
}

export function SharedReportsPage({ sidebar }: SharedReportsPageProps) {
  const {
    reportes,
    reporteSeleccionado,
    filtros,
    estadisticas,
    isLoading,
    modalAbierto,
    setFiltros,
    seleccionarReporte,
    cerrarModal,
    cambiarEstado,
    guardarNota,
  } = useReportes();

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily:
          "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: colors.background.primary,
      }}
    >
      <style>{globalStyles(t)}</style>

      {sidebar}

      <main style={{
        flex: 1,
        overflow: 'auto',
        padding: '32px 28px',
        marginLeft: '280px' // Ajuste para el sidebar fijo
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ReportesHeader estadisticas={estadisticas} />
          <ReportesFilters
            filtros={filtros}
            onChange={setFiltros}
            totalResultados={reportes.length}
          />
          <ReportesTable
            reportes={reportes}
            isLoading={isLoading}
            onSelectReporte={seleccionarReporte}
          />
        </div>
      </main>

      {modalAbierto && reporteSeleccionado && (
        <ReporteDetailModal
          reporte={reporteSeleccionado}
          isOpen={modalAbierto}
          onClose={cerrarModal}
          onCambiarEstado={cambiarEstado}
          onGuardarNota={guardarNota}
        />
      )}
    </div>
  );
}
