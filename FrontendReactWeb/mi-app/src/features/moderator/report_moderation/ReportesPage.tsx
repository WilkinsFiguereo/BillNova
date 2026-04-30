"use client";

import React from 'react';
import { useReportes } from './hooks/useReportes';
import { ReportesHeader } from './sections/ReportesHeader';
import { ReportesFilters } from './sections/ReportesFilters';
import { ReportesTable } from './sections/ReportesTable';
import { ReporteDetailModal } from './sections/ReporteDetailModal';
import { colors } from './theme/reportes.theme';

export function ReportesPage() {
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
        minHeight: '100vh',
        backgroundColor: colors.background.primary,
        color: colors.text.primary,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <ReportesHeader estadisticas={estadisticas} />

        <div style={{ marginTop: 16 }}>
          <ReportesFilters filtros={filtros} onChange={setFiltros} totalResultados={reportes.length} />
        </div>

        <div style={{ marginTop: 16 }}>
          <ReportesTable reportes={reportes} isLoading={isLoading} onSelectReporte={seleccionarReporte} />
        </div>

        <ReporteDetailModal
          reporte={reporteSeleccionado}
          isOpen={modalAbierto}
          onClose={cerrarModal}
          onCambiarEstado={cambiarEstado}
          onGuardarNota={guardarNota}
        />
      </main>
    </div>
  );
}
