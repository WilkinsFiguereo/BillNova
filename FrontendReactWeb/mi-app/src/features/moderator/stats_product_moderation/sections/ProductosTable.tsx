"use client";

import React from "react";
import { colors } from "../theme/productos.theme";
import { Producto } from "../types/productos.types";
import { CategoriaBadge, CrecimientoBadge, EstadoBadge, MiniSparkline, StarRating, StockIndicator } from "../ui/ProductoUI";

const cols = ["#", "Producto", "Empresa", "Ventas", "Ingresos", "Tendencia", "Precio", "Stock", "Calif.", "Conversión", "Devol.", "Estado"];

export function ProductosTable({ productos, onSelect }: { productos: Producto[]; onSelect: (p: Producto) => void }) {
  return (
    <div style={{ background: colors.bg.secondary, border: `1px solid ${colors.border}`, borderRadius: 12, overflow: "hidden", boxShadow: `0 1px 4px ${colors.shadow}` }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1060 }}>
          <thead>
            <tr style={{ backgroundColor: colors.bg.alt, borderBottom: `2px solid ${colors.border}` }}>
              {cols.map((col) => (
                <th key={col} style={{ padding: "10px 13px", textAlign: "left", fontSize: 10, fontWeight: 700, color: colors.text.secondary, letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ padding: 48, textAlign: "center", color: colors.text.disabled, fontSize: 14 }}>No se encontraron productos</td>
              </tr>
            ) : (
              productos.map((producto, index) => <ProductoRow key={producto.id} producto={producto} rank={index + 1} onClick={onSelect} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductoRow({ producto: p, rank, onClick }: { producto: Producto; rank: number; onClick: (p: Producto) => void }) {
  const [hov, setHov] = React.useState(false);
  const sparkData = p.ventasMensuales.slice(-6).map((item) => item.ventas);
  const sparkColor = (p.crecimiento ?? 0) >= 0 ? "#10B981" : "#EF4444";
  const convColor = p.tasaConversion === null ? colors.text.disabled : p.tasaConversion >= 6 ? "#10B981" : p.tasaConversion >= 4 ? "#F59E0B" : "#EF4444";
  const devolColor = p.tasaDevolucion === null ? colors.text.disabled : p.tasaDevolucion > 8 ? "#EF4444" : p.tasaDevolucion > 4 ? "#F59E0B" : "#10B981";

  return (
    <tr onClick={() => onClick(p)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ cursor: "pointer", backgroundColor: hov ? colors.bg.alt : colors.bg.secondary, transition: "background .12s", borderBottom: `1px solid ${colors.border}` }}>
      <td style={{ padding: "12px 13px" }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: rank <= 3 ? "#F59E0B" : colors.text.disabled, display: "inline-block", width: 22, textAlign: "center" }}>#{rank}</span>
      </td>
      <td style={{ padding: "12px 13px", minWidth: 200 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: colors.text.primary, lineHeight: 1.3 }}>{p.nombre}</p>
        <div style={{ marginTop: 3 }}><CategoriaBadge cat={p.categoria} /></div>
      </td>
      <td style={{ padding: "12px 13px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: p.empresaColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            {(p.empresa || "ND").slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: 12, color: colors.text.secondary, fontWeight: 500 }}>{p.empresa || "N/D"}</span>
        </div>
      </td>
      <td style={{ padding: "12px 13px", whiteSpace: "nowrap" }}>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: colors.text.primary }}>{p.totalVentas.toLocaleString()}</p>
        <CrecimientoBadge valor={p.crecimiento} />
      </td>
      <td style={{ padding: "12px 13px", whiteSpace: "nowrap" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#10B981" }}>
          RD$ {p.totalIngresos >= 1000000 ? `${(p.totalIngresos / 1000000).toFixed(1)}M` : `${(p.totalIngresos / 1000).toFixed(0)}k`}
        </p>
      </td>
      <td style={{ padding: "12px 13px" }}>
        <MiniSparkline data={sparkData} color={sparkColor} />
      </td>
      <td style={{ padding: "12px 13px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary }}>RD$ {p.precio.toLocaleString()}</span>
      </td>
      <td style={{ padding: "12px 13px" }}>
        <StockIndicator stock={p.stock} />
      </td>
      <td style={{ padding: "12px 13px" }}>
        <StarRating valor={p.calificacion} small />
        <p style={{ margin: "1px 0 0", fontSize: 10, color: colors.text.disabled }}>{p.totalResenas.toLocaleString()} reseñas</p>
      </td>
      <td style={{ padding: "12px 13px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: convColor }}>{p.tasaConversion === null ? "N/D" : `${p.tasaConversion}%`}</span>
      </td>
      <td style={{ padding: "12px 13px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: devolColor }}>{p.tasaDevolucion === null ? "N/D" : `${p.tasaDevolucion}%`}</span>
      </td>
      <td style={{ padding: "12px 13px" }}>
        <EstadoBadge estado={p.estado} />
      </td>
    </tr>
  );
}
