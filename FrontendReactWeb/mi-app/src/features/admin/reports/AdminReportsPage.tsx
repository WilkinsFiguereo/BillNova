"use client";

import React from "react";
import { dashboardTheme as t, globalStyles } from "@/features/seller/dashboard/theme/dashboard.theme";
import { AdminSidebar } from "../dashboard/ui/AdminSidebar";
import { ADMIN_NAV_ITEMS } from "../dashboard/data/adminNavigation.data";
import { useAnalyticsReports } from "@/features/moderator/report_moderation/hooks/useAnalyticsReports";
import {
  exportModeratorDatasetToExcel,
  exportModeratorDatasetToPdf,
} from "@/features/moderator/report_moderation/reportExport";

const colors = {
  bg: "#F6F8FC",
  card: "#FFFFFF",
  text: "#0F172A",
  subtext: "#64748B",
  border: "#DCE6F2",
  brand: "#0F172A",
};

function formatCurrencyCompact(value: number): string {
  if (value >= 1000000) return `RD$ ${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `RD$ ${(value / 1000).toFixed(1)}k`;
  return `RD$ ${value.toLocaleString()}`;
}

function cardStyle(accent?: string): React.CSSProperties {
  return {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
    ...(accent
      ? {
          backgroundImage: `linear-gradient(135deg, ${accent}14, transparent 60%)`,
        }
      : {}),
  };
}

function DataTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
        <thead>
          <tr style={{ background: "#F8FAFC" }}>
            {columns.map((column) => (
              <th
                key={column}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  fontSize: 11,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: colors.subtext,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 28, textAlign: "center", color: colors.subtext }}>
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={`${row.join("-")}-${rowIndex}`} style={{ borderBottom: `1px solid ${colors.border}` }}>
                {row.map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`} style={{ padding: "13px 14px", fontSize: 13, color: colors.text }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ExportPanel({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: Array<Record<string, unknown>>;
}) {
  const safeName = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <div style={cardStyle()}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, color: colors.text }}>{title}</h3>
          <p style={{ margin: "6px 0 0", color: colors.subtext, fontSize: 13 }}>{description}</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => exportModeratorDatasetToPdf(title, `${safeName}.pdf`, rows)}
            style={{
              border: `1px solid ${colors.border}`,
              background: colors.card,
              color: colors.text,
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Exportar PDF
          </button>
          <button
            type="button"
            onClick={() => exportModeratorDatasetToExcel(title, `${safeName}.xlsx`, rows)}
            style={{
              border: "none",
              background: colors.brand,
              color: "#fff",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminReportsPage() {
  const { companies, products, users, sales, summary, loading, period, setPeriod } = useAnalyticsReports();

  const companyExportRows = companies.map((row) => ({
    Empresa: row.nombre,
    Estado: row.estado,
    Categoria: row.categoria,
    Productos: row.productos,
    Ventas: row.ventas,
    Ingresos: row.ingresos,
    Clientes: row.clientes,
    Calificacion: row.calificacion ?? "N/D",
  }));

  const productExportRows = products.map((row) => ({
    Producto: row.nombre,
    Empresa: row.empresa,
    Tipo: row.tipo === "service" ? "Servicio" : "Producto",
    Estado: row.estado,
    Precio: row.precio,
    Ventas: row.ventas,
    Ingresos: row.ingresos,
    Resenas: row.resenas,
    Calificacion: row.calificacion ?? "N/D",
  }));

  const userExportRows = users.map((row) => ({
    Usuario: row.nombre,
    Email: row.email,
    Rol: row.rol,
    Compras: row.compras,
    Gasto: row.gasto,
  }));

  const salesExportRows = sales.map((row) => ({
    Referencia: row.referencia,
    Fecha: row.fecha,
    Estado: row.estado,
    Cliente: row.cliente,
    Items: row.items,
    Total: row.total,
  }));

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: colors.bg,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{globalStyles(t)}</style>
      <AdminSidebar navItems={ADMIN_NAV_ITEMS} />

      <main style={{ flex: 1, overflow: "auto", padding: "32px 28px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gap: 18 }}>
          <section style={{ ...cardStyle("#0F172A"), padding: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, color: "#334155", fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>
                  Panel administrativo
                </p>
                <h1 style={{ margin: "8px 0 6px", color: colors.text, fontSize: 32, lineHeight: 1.1 }}>
                  Reportes de Aplicacion
                </h1>
                <p style={{ margin: 0, maxWidth: 760, color: colors.subtext, fontSize: 14 }}>
                  Exporta reportes PDF y Excel de empresas, productos, ventas y usuarios desde la vista administrativa.
                </p>
              </div>

              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as typeof period)}
                style={{
                  height: 44,
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  background: "#fff",
                  padding: "0 14px",
                  fontSize: 14,
                  color: colors.text,
                  fontWeight: 600,
                }}
              >
                <option value="7d">Ultimos 7 dias</option>
                <option value="30d">Ultimos 30 dias</option>
                <option value="90d">Ultimos 90 dias</option>
                <option value="1y">Ultimo ano</option>
              </select>
            </div>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { label: "Empresas", value: summary.totalEmpresas.toLocaleString(), accent: "#1D4ED8" },
              { label: "Productos y servicios", value: summary.totalProductos.toLocaleString(), accent: "#7C3AED" },
              { label: "Usuarios", value: summary.totalUsuarios.toLocaleString(), accent: "#0F766E" },
              { label: "Ventas", value: summary.totalVentas.toLocaleString(), accent: "#D97706" },
              { label: "Ingresos", value: formatCurrencyCompact(summary.totalIngresos), accent: "#059669" },
            ].map((item) => (
              <div key={item.label} style={cardStyle(item.accent)}>
                <p style={{ margin: 0, color: colors.subtext, fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>{item.label}</p>
                <h2 style={{ margin: "12px 0 0", fontSize: 28, color: colors.text }}>{loading ? "..." : item.value}</h2>
              </div>
            ))}
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <ExportPanel title="Reporte de Empresas" description="Estado, ventas, ingresos, clientes y calificacion." rows={companyExportRows} />
            <ExportPanel title="Reporte de Productos" description="Catalogo, tipo, precio, ventas e ingresos por item." rows={productExportRows} />
            <ExportPanel title="Reporte de Ventas" description="Ordenes POS, estado, cliente, items y totales." rows={salesExportRows} />
            <ExportPanel title="Reporte de Usuarios" description="Usuarios, rol, compras y gasto acumulado." rows={userExportRows} />
          </section>

          <section style={cardStyle()}>
            <h2 style={{ margin: "0 0 16px", fontSize: 20, color: colors.text }}>Top empresas por ingresos</h2>
            <DataTable
              columns={["Empresa", "Estado", "Categoria", "Productos", "Ventas", "Ingresos", "Clientes", "Calificacion"]}
              rows={companies.slice(0, 8).map((row) => [
                row.nombre,
                row.estado,
                row.categoria,
                row.productos.toLocaleString(),
                row.ventas.toLocaleString(),
                formatCurrencyCompact(row.ingresos),
                row.clientes.toLocaleString(),
                row.calificacion === null ? "N/D" : row.calificacion.toFixed(1),
              ])}
            />
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
            <div style={cardStyle()}>
              <h2 style={{ margin: "0 0 16px", fontSize: 20, color: colors.text }}>Productos con mejor rendimiento</h2>
              <DataTable
                columns={["Producto", "Empresa", "Tipo", "Ventas", "Ingresos", "Calificacion"]}
                rows={products.slice(0, 8).map((row) => [
                  row.nombre,
                  row.empresa,
                  row.tipo === "service" ? "Servicio" : "Producto",
                  row.ventas.toLocaleString(),
                  formatCurrencyCompact(row.ingresos),
                  row.calificacion === null ? "N/D" : row.calificacion.toFixed(1),
                ])}
              />
            </div>

            <div style={cardStyle()}>
              <h2 style={{ margin: "0 0 16px", fontSize: 20, color: colors.text }}>Usuarios con mayor gasto</h2>
              <DataTable
                columns={["Usuario", "Rol", "Compras", "Gasto"]}
                rows={users.slice(0, 8).map((row) => [
                  row.nombre,
                  row.rol,
                  row.compras.toLocaleString(),
                  formatCurrencyCompact(row.gasto),
                ])}
              />
            </div>
          </section>

          <section style={cardStyle()}>
            <h2 style={{ margin: "0 0 16px", fontSize: 20, color: colors.text }}>Ultimas ventas registradas</h2>
            <DataTable
              columns={["Referencia", "Fecha", "Estado", "Cliente", "Items", "Total"]}
              rows={sales.slice(0, 10).map((row) => [
                row.referencia,
                new Date(row.fecha).toLocaleDateString("es-DO"),
                row.estado,
                row.cliente,
                row.items.toLocaleString(),
                formatCurrencyCompact(row.total),
              ])}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
