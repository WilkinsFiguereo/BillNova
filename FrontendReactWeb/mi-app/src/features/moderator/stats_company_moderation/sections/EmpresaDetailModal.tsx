"use client";

import React, { useState } from "react";
import { colors, categoriaConfig } from "../theme/estadisticas.theme";
import { Empresa } from "../types/estadisticas.types";
import { CrecimientoBadge, EmpresaAvatar, EstadoBadge, StarRating } from "../ui/EmpresaUI";

const CloseIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

type TabId = "resumen" | "ventas" | "productos";

const tabs: { id: TabId; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "ventas", label: "Ventas" },
  { id: "productos", label: "Top Productos" },
];

function MetricRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 13px", background: colors.bg.secondary, borderRadius: 8, border: `1px solid ${colors.border}`, marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: colors.text.secondary }}>{label}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: colors.text.primary }}>{value}</span>
        {sub && <p style={{ margin: 0, fontSize: 10.5, color: colors.text.disabled }}>{sub}</p>}
      </div>
    </div>
  );
}

export function EmpresaDetailModal({ empresa, isOpen, onClose }: { empresa: Empresa | null; isOpen: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<TabId>("resumen");
  if (!isOpen || !empresa) return null;
  const e = empresa;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)", zIndex: 50, backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "90%", maxWidth: 640, maxHeight: "90vh", backgroundColor: colors.bg.secondary, borderRadius: 16, zIndex: 51, display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ padding: "20px 22px 14px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <EmpresaAvatar iniciales={e.iniciales} color={e.colorAvatar} size={50} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: colors.text.primary }}>{e.nombre}</h2>
                  <EstadoBadge estado={e.estado} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: colors.text.secondary, backgroundColor: colors.bg.alt, padding: "2px 8px", borderRadius: 6, border: `1px solid ${colors.border}` }}>{categoriaConfig[e.categoria].label}</span>
                  <StarRating valor={e.calificacion} />
                  <CrecimientoBadge valor={e.crecimiento} />
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors.text.secondary, padding: 4, borderRadius: 6, display: "flex" }}><CloseIcon /></button>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { label: "Ventas", val: e.totalVentas.toLocaleString(), color: colors.brand[600] },
              { label: "Ingresos", val: `RD$ ${(e.totalIngresos / 1000000).toFixed(2)}M`, color: "#10B981" },
              { label: "Clientes", val: e.clientesUnicos === null ? "N/D" : e.clientesUnicos.toLocaleString(), color: colors.brand[400] },
              { label: "Productos", val: String(e.totalProductos), color: "#F59E0B" },
            ].map((item) => (
              <div key={item.label} style={{ background: colors.bg.alt, borderRadius: 8, padding: "8px 14px", border: `1px solid ${colors.border}`, flex: 1, minWidth: 90 }}>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: item.color }}>{item.val}</p>
                <p style={{ margin: "2px 0 0", fontSize: 10.5, color: colors.text.secondary }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)} style={{ padding: "5px 13px", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all .14s", backgroundColor: tab === item.id ? colors.brand[600] : "transparent", color: tab === item.id ? "#fff" : colors.text.secondary }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
          {tab === "resumen" && (
            <div>
              <MetricRow label="Fecha de registro" value={new Date(e.fechaRegistro).toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric" })} />
              <MetricRow label="Total reseñas" value={e.totalResenas.toLocaleString()} />
              <MetricRow label="Tasa de devolución" value={e.tasaDevolucion === null ? "N/D" : `${e.tasaDevolucion}%`} sub={e.tasaDevolucion === null ? "Sin dato en backend" : e.tasaDevolucion > 5 ? "Alta - revisar" : "Normal"} />
              <MetricRow label="Crecimiento periodo" value={e.crecimiento === null ? "N/D" : `${e.crecimiento > 0 ? "+" : ""}${e.crecimiento}%`} />
              <MetricRow label="Promedio por venta" value={e.totalVentas > 0 ? `RD$ ${Math.round(e.totalIngresos / e.totalVentas).toLocaleString()}` : "N/D"} />
              <MetricRow label="Ingresos por cliente" value={e.clientesUnicos && e.clientesUnicos > 0 ? `RD$ ${Math.round(e.totalIngresos / e.clientesUnicos).toLocaleString()}` : "N/D"} />
            </div>
          )}

          {tab === "ventas" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {e.ventasMensuales.length === 0 ? (
                <MetricRow label="Ventas" value="Sin ventas registradas en el periodo" />
              ) : (
                e.ventasMensuales.map((mes) => (
                  <MetricRow key={mes.mes} label={mes.mes} value={`${mes.ventas.toLocaleString()} uds · RD$ ${(mes.ingresos / 1000).toFixed(0)}k`} />
                ))
              )}
            </div>
          )}

          {tab === "productos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {e.productosTop.length === 0 ? (
                <MetricRow label="Productos" value="Sin productos vendidos en el periodo" />
              ) : (
                e.productosTop.map((producto, index) => (
                  <MetricRow key={producto.id} label={`#${index + 1} ${producto.nombre}`} value={`${producto.unidades.toLocaleString()} uds · RD$ ${(producto.ingresos / 1000).toFixed(0)}k`} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
