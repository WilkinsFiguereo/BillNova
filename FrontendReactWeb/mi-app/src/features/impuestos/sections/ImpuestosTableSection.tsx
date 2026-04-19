"use client";

import React from "react";
import { Search, Edit, Trash2 } from "lucide-react";
import type { Impuesto } from "../../types/impuestos.types";
import { dashboardTheme as t } from "../../../seller/dashboard/theme/dashboard.theme";
import { TIPO_IMPUESTO_LABELS, APLICACION_LABELS } from "../../data/impuestos.data";

interface ImpuestosTableSectionProps {
  impuestos: Impuesto[];
  search: string;
  filtroTipo: string;
  onSearchChange: (v: string) => void;
  onFiltroTipoChange: (v: string) => void;
  onCrear: () => void;
  onEditar: (id: string) => void;
  onEliminar: (id: string) => void;
  totalCount: number;
}

export function ImpuestosTableSection({
  impuestos,
  search,
  filtroTipo,
  onSearchChange,
  onFiltroTipoChange,
  onEditar,
  onEliminar,
  totalCount,
}: ImpuestosTableSectionProps) {
  const tipoOptions = ["Todos", "itbis", "isr", "isc", "retencion", "exento", "selectivo", "decoracion", "otro"];

  return (
    <div style={{ background: "white", borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px",
        borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.textDisabled }} />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                padding: "8px 12px 8px 36px",
                borderRadius: 8,
                border: `1px solid ${t.border}`,
                fontSize: 13,
                width: 240,
              }}
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => onFiltroTipoChange(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${t.border}`,
              fontSize: 13,
            }}
          >
            {tipoOptions.map(opt => (
              <option key={opt} value={opt}>
                {opt === "Todos" ? "Todos los tipos" : TIPO_IMPUESTO_LABELS[opt as keyof typeof TIPO_IMPUESTO_LABELS] || opt}
              </option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: 13, color: t.textSecondary }}>
          {impuestos.length} de {totalCount} registros
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: t.bgAlt }}>
            {["Código", "Nombre", "Tipo", "Tasa", "Aplicación", "Estado", "Acciones"].map((header, i) => (
              <th key={header} style={{
                padding: "12px 16px",
                textAlign: i === 5 ? "center" : "left",
                fontSize: 11,
                fontWeight: 600,
                color: t.textSecondary,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderBottom: `1px solid ${t.border}`,
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {impuestos.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: 40, textAlign: "center", color: t.textDisabled }}>
                No hay impuestos configurados
              </td>
            </tr>
          ) : (
            impuestos.map((impuesto) => (
              <tr key={impuesto.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                <td style={{ padding: "14px 16px", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                  {impuesto.codigo}
                </td>
                <td style={{ padding: "14px 16px", fontWeight: 500 }}>
                  {impuesto.nombre}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    background: t.brand100,
                    color: t.brand600,
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    {TIPO_IMPUESTO_LABELS[impuesto.tipo]}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontFamily: "'DM Mono', monospace" }}>
                  {impuesto.tasa}%
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: t.textSecondary }}>
                  {APLICACION_LABELS[impuesto.aplicacion]}
                </td>
                <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <span style={{
                    background: impuesto.activo ? t.successBg : t.errorBg,
                    color: impuesto.activo ? t.success : t.error,
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    {impuesto.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", textAlign: "center" }}>
                  <button
                    onClick={() => onEditar(impuesto.id)}
                    className="action-btn"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onEliminar(impuesto.id)}
                    className="action-btn"
                    title="Eliminar"
                    style={{ marginLeft: 8, color: t.error }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}