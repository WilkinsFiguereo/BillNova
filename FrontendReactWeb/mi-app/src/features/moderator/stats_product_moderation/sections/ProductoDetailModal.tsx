"use client";

import React, { useState } from "react";
import { categoriaConfig, colors } from "../theme/productos.theme";
import { Producto } from "../types/productos.types";
import { CategoriaBadge, CrecimientoBadge, EstadoBadge, StarRating } from "../ui/ProductoUI";

const CloseIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

type TabId = "resumen" | "ventas" | "resenas";

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 13px", background: colors.bg.secondary, borderRadius: 8, border: `1px solid ${colors.border}`, marginBottom: 5 }}>
      <span style={{ fontSize: 13, color: colors.text.secondary }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: valueColor || colors.text.primary }}>{value}</span>
    </div>
  );
}

export function ProductoDetailModal({ producto, isOpen, onClose }: { producto: Producto | null; isOpen: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<TabId>("resumen");
  if (!isOpen || !producto) return null;
  const p = producto;
  const catColor = categoriaConfig[p.categoria].color;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)", zIndex: 50, backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "90%", maxWidth: 640, maxHeight: "90vh", backgroundColor: colors.bg.secondary, borderRadius: 16, zIndex: 51, display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ padding: "20px 22px 14px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 13 }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
                <CategoriaBadge cat={p.categoria} />
                <EstadoBadge estado={p.estado} />
                <CrecimientoBadge valor={p.crecimiento} />
              </div>
              <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: colors.text.primary, lineHeight: 1.3 }}>{p.nombre}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: p.empresaColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7.5, fontWeight: 800, color: "#fff" }}>{(p.empresa || "ND").slice(0, 2).toUpperCase()}</div>
                <span style={{ fontSize: 12.5, color: colors.text.secondary }}>{p.empresa || "N/D"}</span>
                <span style={{ fontSize: 12, color: colors.text.disabled }}>·</span>
                <StarRating valor={p.calificacion} small />
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors.text.secondary, padding: 4, borderRadius: 6, display: "flex", flexShrink: 0 }}><CloseIcon /></button>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 13 }}>
            {[
              { label: "Ventas", value: p.totalVentas.toLocaleString(), color: colors.brand[600] },
              { label: "Ingresos", value: `RD$ ${p.totalIngresos >= 1000000 ? `${(p.totalIngresos / 1000000).toFixed(2)}M` : `${(p.totalIngresos / 1000).toFixed(0)}k`}`, color: "#10B981" },
              { label: "Precio", value: `RD$ ${p.precio.toLocaleString()}`, color: colors.text.primary },
              { label: "Vistas", value: p.totalVistas === null ? "N/D" : p.totalVistas >= 1000 ? `${(p.totalVistas / 1000).toFixed(0)}k` : String(p.totalVistas), color: colors.brand[400] },
            ].map((item) => (
              <div key={item.label} style={{ background: colors.bg.alt, borderRadius: 8, padding: "8px 13px", border: `1px solid ${colors.border}`, flex: 1, minWidth: 90 }}>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: item.color }}>{item.value}</p>
                <p style={{ margin: "2px 0 0", fontSize: 10.5, color: colors.text.secondary }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {(["resumen", "ventas", "resenas"] as TabId[]).map((item) => (
              <button key={item} onClick={() => setTab(item)} style={{ padding: "5px 14px", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all .14s", backgroundColor: tab === item ? colors.brand[600] : "transparent", color: tab === item ? "#fff" : colors.text.secondary }}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
          {tab === "resumen" && (
            <div>
              <InfoRow label="Tasa de conversión" value={p.tasaConversion === null ? "N/D" : `${p.tasaConversion}%`} valueColor={p.tasaConversion === null ? colors.text.disabled : undefined} />
              <InfoRow label="Tasa de devolución" value={p.tasaDevolucion === null ? "N/D" : `${p.tasaDevolucion}%`} valueColor={p.tasaDevolucion === null ? colors.text.disabled : undefined} />
              <InfoRow label="Stock disponible" value={p.stock === 0 ? "Sin stock" : `${p.stock} unidades`} valueColor={p.stock === 0 ? "#EF4444" : p.stock < 50 ? "#F59E0B" : "#10B981"} />
              <InfoRow label="Total vistas" value={p.totalVistas === null ? "N/D" : p.totalVistas.toLocaleString()} />
              <InfoRow label="Ingreso por unidad" value={`RD$ ${p.precio.toLocaleString()}`} />
              <InfoRow label="Total reseñas" value={p.totalResenas.toLocaleString()} />
              <InfoRow label="Fecha de actualización" value={p.fechaLanzamiento ? new Date(p.fechaLanzamiento).toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric" }) : "N/D"} />
            </div>
          )}

          {tab === "ventas" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {p.ventasMensuales.length === 0 ? (
                <InfoRow label="Ventas" value="Sin ventas registradas en el periodo" />
              ) : (
                p.ventasMensuales.map((mes) => (
                  <InfoRow key={mes.mes} label={mes.mes} value={`${mes.ventas.toLocaleString()} uds · RD$ ${(mes.ingresos / 1000).toFixed(0)}k`} />
                ))
              )}
            </div>
          )}

          {tab === "resenas" && (
            <div>
              <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "16px 18px", background: colors.bg.alt, borderRadius: 12, border: `1px solid ${colors.border}`, marginBottom: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 42, fontWeight: 800, color: colors.text.primary, lineHeight: 1 }}>{p.calificacion === null ? "N/D" : p.calificacion.toFixed(1)}</p>
                  <p style={{ margin: "6px 0 4px", fontSize: 11, color: colors.text.disabled }}>{p.totalResenas.toLocaleString()} reseñas</p>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  {p.resenasDist.length === 0 ? (
                    <InfoRow label="Reseñas" value="Sin reseñas registradas" />
                  ) : (
                    p.resenasDist.map((item) => (
                      <InfoRow key={item.estrellas} label={`${item.estrellas} estrellas`} value={item.cantidad.toLocaleString()} valueColor={catColor} />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
