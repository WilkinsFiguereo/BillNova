"use client";

import React from "react";
import { Check, Eye, Package, Search, X } from "lucide-react";
import { FILTROS_STATUS } from "../data/moderation.data";
import { moderationTheme as t } from "../theme/moderation.theme";
import { FiltroStatus, ProductoPendiente } from "../types/moderation.types";
import { StatusBadge } from "../ui/ModerationUI";

interface ModerationListaSectionProps {
  productos: ProductoPendiente[];
  search: string;
  filtroActivo: FiltroStatus;
  contadores: Record<string, number>;
  onSearchChange: (v: string) => void;
  onFiltroChange: (v: FiltroStatus) => void;
  onVerDetalle: (p: ProductoPendiente) => void;
  onAprobar: (id: string) => void;
  onRechazar: (p: ProductoPendiente) => void;
}

export function ModerationListaSection({
  productos,
  search,
  filtroActivo,
  contadores,
  onSearchChange,
  onFiltroChange,
  onVerDetalle,
  onAprobar,
  onRechazar,
}: ModerationListaSectionProps) {
  return (
    <div style={{ background: "white", borderRadius: 16, border: `1px solid ${t.border}`, animation: "slideIn 0.5s ease 0.2s both" }}>
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTROS_STATUS.map((filtro) => (
            <button key={filtro.key} onClick={() => onFiltroChange(filtro.key as FiltroStatus)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: filtroActivo === filtro.key ? t.brand600 : t.bgAlt, color: filtroActivo === filtro.key ? "white" : t.textSecondary, display: "flex", alignItems: "center", gap: 6 }}>
              {filtro.label}
              <span style={{ background: filtroActivo === filtro.key ? "rgba(255,255,255,0.25)" : t.border, color: filtroActivo === filtro.key ? "white" : t.textDisabled, borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
                {contadores[filtro.key]}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.bgAlt, border: `1px solid ${t.border}`, borderRadius: 10, padding: "8px 14px" }}>
          <Search size={14} style={{ color: t.textDisabled }} />
          <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Buscar producto o vendedor..." style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: t.textPrimary, width: 200, fontFamily: "inherit" }} />
        </div>
      </div>

      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {productos.length === 0 && <div style={{ padding: "48px", textAlign: "center", color: t.textDisabled, fontSize: 13 }}>No hay productos en este estado.</div>}

        {productos.map((producto) => {
          const margen = producto.precio > 0 ? (((producto.precio - producto.costo) / producto.precio) * 100).toFixed(0) : "0";
          const isPending = producto.status === "pending";

          return (
            <div key={producto.id} style={{ border: `1.5px solid ${isPending ? t.warningBg : t.border}`, borderRadius: 14, padding: "18px 20px", background: isPending ? `${t.warningBg}33` : "white", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: `${producto.imagenColor}22`, border: `2px solid ${producto.imagenColor}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Package size={24} style={{ color: producto.imagenColor }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary }}>{producto.nombre}</span>
                  <StatusBadge status={producto.status} />
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: t.textDisabled, fontFamily: "'DM Mono', monospace" }}>{producto.sku || "N/D"}</span>
                  <span style={{ fontSize: 11, color: t.textSecondary }}>{producto.categoria || "N/D"}</span>
                  <span style={{ fontSize: 11, color: t.textSecondary }}>Vendedor: <strong>{producto.vendedor || "N/D"}</strong></span>
                  <span style={{ fontSize: 11, color: t.textDisabled }}>{producto.fechaSubida || "N/D"}</span>
                </div>

                {producto.status === "rejected" && producto.motivoRechazo && (
                  <div style={{ marginTop: 8, padding: "8px 12px", background: t.errorBg, borderRadius: 8, fontSize: 11, color: t.error, fontWeight: 500, borderLeft: `3px solid ${t.error}` }}>
                    Motivo: {producto.motivoRechazo}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 20, alignItems: "center", flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, fontFamily: "'DM Mono', monospace" }}>${producto.precio.toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: t.textDisabled }}>Costo: ${producto.costo.toFixed(2)}</div>
                </div>
                <span style={{ background: Number(margen) >= 30 ? t.successBg : t.warningBg, color: Number(margen) >= 30 ? t.success : t.warning, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                  {margen}% margen
                </span>
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => onVerDetalle(producto)} title="Ver detalle" style={{ border: `1px solid ${t.border}`, background: "white", color: t.brand400, borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, transition: "all 0.15s" }}>
                  <Eye size={14} /> Ver
                </button>
                {isPending && (
                  <>
                    <button onClick={() => onAprobar(producto.id)} style={{ border: "none", background: t.success, color: "white", borderRadius: 10, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
                      <Check size={14} /> Aprobar
                    </button>
                    <button onClick={() => onRechazar(producto)} style={{ border: "none", background: t.errorBg, color: t.error, borderRadius: 10, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
                      <X size={14} /> Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
