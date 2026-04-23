"use client";

import React from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { facturasTheme as t } from "../theme/facturas.theme";

interface FacturasHeaderSectionProps {
  total: number;
  onExportarPDF: () => void;
  onExportarExcel: () => void;
}

export function FacturasHeaderSection({
  total,
  onExportarPDF,
  onExportarExcel,
}: FacturasHeaderSectionProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 28,
        animation: "slideIn 0.4s ease",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: t.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          Facturas
        </h1>
        <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 4 }}>
          Gestion de cobros ·{" "}
          <span style={{ color: t.brand400, fontWeight: 600 }}>{total} facturas</span>
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn-secondary" onClick={onExportarPDF}>
          <Download size={15} /> Exportar PDF
        </button>
        <button className="btn-secondary" onClick={onExportarExcel}>
          <FileSpreadsheet size={15} /> Exportar Excel
        </button>
      </div>
    </div>
  );
}
