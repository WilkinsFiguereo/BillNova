"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '../../admin/dashboard/ui/AdminSidebar';
import { ADMIN_NAV_ITEMS } from '../../admin/dashboard/data/adminNavigation.data';
import { Sidebar } from '../../seller/dashboard/dashboards';
import { dashboardTheme as t, globalStyles } from '../../seller/dashboard/theme/dashboard.theme';
import { MODERATOR_NAV_ITEMS } from '../moderationNav';
import { colors } from './theme/estadisticas.theme';
import { useEstadisticas } from './hooks/useEstadisticas';
import { EstadisticasHeader } from './sections/EstadisticasHeader';
import { Top3Podio, EmpresasFilters } from './sections/Top3yFiltros';
import { EmpresasTable } from './sections/EmpresasTable';
import { EmpresaDetailModal } from './sections/EmpresaDetailModal';
import { exportModeratorDatasetToExcel, exportModeratorDatasetToPdf } from '../report_moderation/reportExport';

const exportButtonStyle: React.CSSProperties = {
  height: 38,
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  background: colors.bg.secondary,
  color: colors.text.primary,
  fontSize: 12.5,
  fontWeight: 700,
  padding: '0 14px',
  cursor: 'pointer',
};

export function EstadisticasEmpresasPage() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/navigation/admin/');
  const {
    empresas, empresaSeleccionada, filtros, globales,
    loading,
    modalAbierto, top3,
    setFiltros, seleccionarEmpresa, cerrarModal,
  } = useEstadisticas();

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: colors.bg.primary,
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <style>{globalStyles(t)}</style>

      {isAdminRoute ? (
        <AdminSidebar navItems={ADMIN_NAV_ITEMS} />
      ) : (
        <Sidebar navItems={MODERATOR_NAV_ITEMS} />
      )}

      <main style={{ flex: 1, overflow: 'auto', padding: '32px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <EstadisticasHeader globales={globales} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              style={exportButtonStyle}
              onClick={() => exportModeratorDatasetToPdf(
                'Estadisticas de empresas',
                `estadisticas-empresas-${filtros.periodo}.pdf`,
                empresas.map((empresa) => ({
                  Empresa: empresa.nombre,
                  Categoria: empresa.categoria,
                  Estado: empresa.estado,
                  Ventas: empresa.totalVentas,
                  Ingresos: empresa.totalIngresos,
                  Productos: empresa.totalProductos,
                  Clientes: empresa.clientesUnicos ?? 0,
                  Calificacion: empresa.calificacion ?? 'N/D',
                  Resenas: empresa.totalResenas,
                  Devolucion: empresa.tasaDevolucion ?? 0,
                  Crecimiento: empresa.crecimiento ?? 'N/D',
                  Registro: empresa.fechaRegistro,
                })),
              )}
            >
              Exportar PDF
            </button>
            <button
              type="button"
              style={exportButtonStyle}
              onClick={() => exportModeratorDatasetToExcel(
                'Estadisticas de empresas',
                `estadisticas-empresas-${filtros.periodo}.xlsx`,
                empresas.map((empresa) => ({
                  Empresa: empresa.nombre,
                  Categoria: empresa.categoria,
                  Estado: empresa.estado,
                  Ventas: empresa.totalVentas,
                  Ingresos: empresa.totalIngresos,
                  Productos: empresa.totalProductos,
                  Clientes: empresa.clientesUnicos ?? 0,
                  Calificacion: empresa.calificacion ?? 'N/D',
                  Resenas: empresa.totalResenas,
                  Devolucion: empresa.tasaDevolucion ?? 0,
                  Crecimiento: empresa.crecimiento ?? 'N/D',
                  Registro: empresa.fechaRegistro,
                })),
              )}
            >
              Exportar Excel
            </button>
          </div>
          <Top3Podio empresas={top3} onClick={seleccionarEmpresa} />
          <EmpresasFilters filtros={filtros} onChange={setFiltros} total={empresas.length} />
          <EmpresasTable empresas={empresas} loading={loading} onSelect={seleccionarEmpresa} />
        </div>
      </main>

      <EmpresaDetailModal
        empresa={empresaSeleccionada}
        isOpen={modalAbierto}
        onClose={cerrarModal}
      />
    </div>
  );
}
