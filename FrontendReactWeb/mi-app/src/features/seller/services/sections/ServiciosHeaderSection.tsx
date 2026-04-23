"use client";

import React from "react";
import { Download, Plus } from "lucide-react";
import { serviciosTheme as t } from "../theme/servicios.theme";

export function ServiciosHeaderSection({
  totalFiltrados,
  onAgregar,
  onExportar,
}: {
  totalFiltrados: number;
  onAgregar: () => void;
  onExportar: () => void;
}) {
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
        <h1 style={{ fontSize: 26, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.02em" }}>
          Servicios
        </h1>
        <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 4 }}>
          Catálogo de servicios ·{" "}
          <span style={{ color: t.brand400, fontWeight: 600 }}>{totalFiltrados} servicios</span>
        </p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn-secondary" onClick={onExportar}>
          <Download size={15} /> Exportar
        </button>
        <button className="btn-primary" onClick={onAgregar}>
          <Plus size={15} /> Nuevo Servicio
        </button>
      </div>
    </div>
  );
}

