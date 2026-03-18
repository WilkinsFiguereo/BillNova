"use client";

import React from 'react';
import { colors } from './theme/estadisticas.theme';
import { useEstadisticas } from './hooks/useEstadisticas';
import { EstadisticasHeader } from './sections/EstadisticasHeader';
import { Top3Podio, EmpresasFilters } from './sections/Top3yFiltros';
import { EmpresasTable } from './sections/EmpresasTable';
import { EmpresaDetailModal } from './sections/EmpresaDetailModal';

export function EstadisticasEmpresasPage() {
  const {
    empresas, empresaSeleccionada, filtros, globales,
    modalAbierto, top3,
    setFiltros, seleccionarEmpresa, cerrarModal,
  } = useEstadisticas();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.bg.primary,
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '32px 28px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <EstadisticasHeader globales={globales} />
        <Top3Podio empresas={top3} onClick={seleccionarEmpresa} />
        <EmpresasFilters filtros={filtros} onChange={setFiltros} total={empresas.length} />
        <EmpresasTable empresas={empresas} onSelect={seleccionarEmpresa} />
      </div>

      <EmpresaDetailModal
        empresa={empresaSeleccionada}
        isOpen={modalAbierto}
        onClose={cerrarModal}
      />
    </div>
  );
}