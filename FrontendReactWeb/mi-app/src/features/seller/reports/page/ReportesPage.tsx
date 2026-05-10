"use client";

import React from "react";
import { useReportes } from "../hooks/useReportes";
import { reportesTheme as t, globalStyles } from "../theme/reportes.theme";
import { Toast } from "../ui/ReporteUI";
import { ReportesHeaderSection } from "../sections/ReportesHeaderSection";
import { ReportesStatsSection } from "../sections/ReportesStatsSection";
import { ReportesGraficaSection } from "../sections/ReportesGraficaSection";
import { ReportesTablesSection } from "../sections/ReportesTablesSection";
import { Sidebar } from "../../dashboard/dashboards";
import { NAV_ITEMS } from "../../dashboard/data/chart.data";

export default function ReportesPage() {
  const {
    periodo,
    loading,
    error,
    resumen,
    toastVisible,
    toastMsg,
    setPeriodo,
    showToast,
  } = useReportes();

  const exportCSV = () => {
    const rows = [
      ["BillNova", "Reporte comercial"],
      ["Generado", new Date().toLocaleString("es-DO")],
      ["Periodo", periodo],
      [],
      ["Metrica", "Valor"],
      ...resumen.stats.map((stat) => [stat.label, stat.value]),
      [],
      ["Periodo", "Ventas", "Cobros", "Gastos"],
      ...resumen.chart.map((item) => [item.label, item.ventas, item.cobros, item.gastos]),
    ];

    const content = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reportes-seller-${periodo}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Reporte exportado correctamente");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: t.bgMain,
        color: t.textPrimary,
      }}
    >
      <style>{globalStyles(t)}</style>

      <Sidebar navItems={NAV_ITEMS} />

      <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
        <ReportesHeaderSection
          periodo={periodo}
          onPeriodoChange={setPeriodo}
          onExportar={exportCSV}
        />
        {loading && <p>Cargando reportes...</p>}
        {error && <p style={{ color: t.error }}>{error}</p>}
        <ReportesStatsSection stats={resumen.stats} />
        <ReportesGraficaSection datos={resumen.chart} distribucion={resumen.distribucion} />
        <ReportesTablesSection productos={resumen.productosTop} clientes={resumen.clientesTop} />
      </main>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
