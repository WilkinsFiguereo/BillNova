"use client";

import React from "react";
import { Sidebar } from "../../dashboard/dashboards";
import { NAV_ITEMS } from "../../dashboard/data/chart.data";
import { useFacturasOdoo } from "../hooks/useFacturas";
import { FacturasHeaderSection } from "../sections/FacturasHeaderSection";
import { FacturasStatsSection } from "../sections/FacturasStatsSection";
import { FacturasTableSection } from "../sections/FacturasTableSection";
import { facturasTheme as t, globalStyles } from "../theme/facturas.theme";
import { getActiveCompanyId } from "@/features/seller/shared/companySession";

function Toast({
  message,
  visible,
  type = "info",
}: {
  message: string;
  visible: boolean;
  type?: "success" | "error" | "info";
}) {
  if (!visible) return null;

  const colors: Record<string, { bg: string; shadow: string }> = {
    success: { bg: "#059669", shadow: "rgba(5,150,105,0.3)" },
    error: { bg: "#DC2626", shadow: "rgba(220,38,38,0.3)" },
    info: { bg: t.brand600, shadow: "rgba(30,58,138,0.3)" },
  };
  const c = colors[type];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: c.bg,
        color: "white",
        padding: "12px 20px",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 500,
        boxShadow: `0 8px 24px ${c.shadow}`,
        animation: "toastIn 0.3s ease",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        maxWidth: 360,
      }}
    >
      {message}
    </div>
  );
}

function ErrorBanner({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div
      style={{
        background: "#FEF2F2",
        border: "1px solid #FECACA",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>Aviso</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#991B1B" }}>Error conectando con Odoo</div>
          <div style={{ fontSize: 12, color: "#DC2626", marginTop: 2 }}>{error}</div>
        </div>
      </div>
      <button
        onClick={onRetry}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          background: "#DC2626",
          color: "white",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Reintentar
      </button>
    </div>
  );
}

export default function FacturasPage() {
  const companyId = typeof window !== "undefined" ? getActiveCompanyId() ?? undefined : undefined;

  const {
    facturasFiltradas,
    stats,
    search,
    filtroActivo,
    vistaMode,
    ordenCampo,
    ordenDir,
    loading,
    error,
    toastVisible,
    toastMsg,
    toastType,
    setSearch,
    setFiltroActivo,
    setVistaMode,
    toggleOrden,
    refetch,
    changeInvoiceState,
    sendInvoiceEmail,
    downloadInvoicePDF,
    exportFacturasPDF,
    exportFacturasExcel,
    facturas,
  } = useFacturasOdoo(companyId);

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
        <FacturasHeaderSection
          total={facturasFiltradas.length}
          onExportarPDF={exportFacturasPDF}
          onExportarExcel={exportFacturasExcel}
        />

        {error && <ErrorBanner error={error} onRetry={refetch} />}

        <FacturasStatsSection stats={stats} />

        <FacturasTableSection
          facturas={facturasFiltradas}
          search={search}
          filtroActivo={filtroActivo}
          vistaMode={vistaMode}
          ordenCampo={ordenCampo}
          ordenDir={ordenDir}
          totalCount={facturas.length}
          loading={loading}
          onSearchChange={setSearch}
          onFiltroChange={setFiltroActivo}
          onVistaModeChange={setVistaMode}
          onToggleOrden={toggleOrden}
          onChangeState={changeInvoiceState}
          onSendEmail={sendInvoiceEmail}
          onDownloadPDF={downloadInvoicePDF}
        />
      </main>

      <Toast message={toastMsg} visible={toastVisible} type={toastType} />
    </div>
  );
}
