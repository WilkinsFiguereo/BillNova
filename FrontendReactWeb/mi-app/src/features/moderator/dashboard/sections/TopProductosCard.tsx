import React from "react";
import { colors } from "../theme/dashboard.theme";
import { ProductoTop } from "../types/dashboard.types";

export function TopProductosCard({ productos }: { productos: ProductoTop[] }) {
  return (
    <div style={s.card}>
      <div style={s.title}>Top productos</div>
      <div style={s.list}>
        {productos.map((product) => (
          <div key={product.id} style={s.row}>
            <div style={s.info}>
              <div style={s.name}>{product.nombre}</div>
              <div style={s.meta}>{product.empresa}</div>
            </div>
            <div style={s.score}>{product.calificacion === null ? "N/D" : product.calificacion.toFixed(1)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  card: { background: colors.bg.secondary, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, boxShadow: `0 1px 4px ${colors.shadow}` },
  title: { fontSize: 14, fontWeight: 700, color: colors.text.primary, marginBottom: 12 },
  list: { display: "flex", flexDirection: "column" as const, gap: 10 },
  row: { display: "flex", alignItems: "center", gap: 10 },
  info: { flex: 1 },
  name: { fontSize: 12.5, fontWeight: 600, color: colors.text.primary },
  meta: { fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  score: { fontSize: 12, fontWeight: 700, color: colors.estado.warning.main },
} as const;
