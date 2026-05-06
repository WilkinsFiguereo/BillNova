"use client";

import React from 'react';
import { Sidebar } from '../../seller/dashboard/dashboards';
import { dashboardTheme as t, globalStyles } from '../../seller/dashboard/theme/dashboard.theme';
import { MODERATOR_NAV_ITEMS } from '../moderationNav';
import { colors } from './theme/productos.theme';
import { useProductos } from './hooks/useProductos';
import { ProductosHeader } from './sections/ProductosHeader';
import { Top3Podio, ProductosFilters } from './sections/Top3yFiltros';
import { ProductosTable } from './sections/ProductosTable';
import { ProductoDetailModal } from './sections/ProductoDetailModal';
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

export function EstadisticasProductosPage() {
  const {
    productos, productoSeleccionado, filtros, globales,
    loading,
    modalAbierto, top3,
    setFiltros, seleccionarProducto, cerrarModal,
  } = useProductos();

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: colors.bg.primary,
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <style>{globalStyles(t)}</style>

      <Sidebar navItems={MODERATOR_NAV_ITEMS} />

      <main style={{ flex: 1, overflow: 'auto', padding: '32px 28px' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <ProductosHeader globales={globales} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              style={exportButtonStyle}
              onClick={() => exportModeratorDatasetToPdf(
                'Estadisticas de productos',
                `estadisticas-productos-${filtros.periodo}.pdf`,
                productos.map((producto) => ({
                  Producto: producto.nombre,
                  Empresa: producto.empresa,
                  Categoria: producto.categoria,
                  Estado: producto.estado,
                  Precio: producto.precio,
                  Ventas: producto.totalVentas,
                  Ingresos: producto.totalIngresos,
                  Vistas: producto.totalVistas ?? 0,
                  Calificacion: producto.calificacion ?? 'N/D',
                  Resenas: producto.totalResenas,
                  Stock: producto.stock,
                  Devolucion: producto.tasaDevolucion ?? 0,
                  Crecimiento: producto.crecimiento ?? 'N/D',
                  Fecha: producto.fechaLanzamiento,
                })),
              )}
            >
              Exportar PDF
            </button>
            <button
              type="button"
              style={exportButtonStyle}
              onClick={() => exportModeratorDatasetToExcel(
                'Estadisticas de productos',
                `estadisticas-productos-${filtros.periodo}.xlsx`,
                productos.map((producto) => ({
                  Producto: producto.nombre,
                  Empresa: producto.empresa,
                  Categoria: producto.categoria,
                  Estado: producto.estado,
                  Precio: producto.precio,
                  Ventas: producto.totalVentas,
                  Ingresos: producto.totalIngresos,
                  Vistas: producto.totalVistas ?? 0,
                  Calificacion: producto.calificacion ?? 'N/D',
                  Resenas: producto.totalResenas,
                  Stock: producto.stock,
                  Devolucion: producto.tasaDevolucion ?? 0,
                  Crecimiento: producto.crecimiento ?? 'N/D',
                  Fecha: producto.fechaLanzamiento,
                })),
              )}
            >
              Exportar Excel
            </button>
          </div>
          <Top3Podio productos={top3} onClick={seleccionarProducto} />
          <ProductosFilters filtros={filtros} onChange={setFiltros} total={productos.length} />
          <ProductosTable productos={productos} loading={loading} onSelect={seleccionarProducto} />
        </div>
      </main>

      <ProductoDetailModal producto={productoSeleccionado} isOpen={modalAbierto} onClose={cerrarModal} />
    </div>
  );
}
