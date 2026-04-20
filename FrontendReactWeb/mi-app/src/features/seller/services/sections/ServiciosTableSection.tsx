"use client";

import React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  Image as ImageIcon,
  LayoutGrid,
  LayoutList,
  Pencil,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import type { OrdenCampo, OrdenDir, Servicio, VistaMode } from "../types/servicios.types";
import { serviciosTheme as t } from "../theme/servicios.theme";
import { PagoFrecuenciaBadge, StatusBadge } from "../ui/ServicioUI";

function OrdenIcon({ campo, activo, dir }: { campo: OrdenCampo; activo: OrdenCampo; dir: OrdenDir }) {
  if (campo !== activo) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
  return dir === "asc" ? <ArrowUp size={12} style={{ color: t.brand400 }} /> : <ArrowDown size={12} style={{ color: t.brand400 }} />;
}

function money(n: number) {
  try {
    return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(n);
  } catch {
    return `RD$ ${n.toFixed(2)}`;
  }
}

function VistaTabla({
  servicios,
  ordenCampo,
  ordenDir,
  onToggleOrden,
  onView,
  onEdit,
  onDelete,
}: {
  servicios: Servicio[];
  ordenCampo: OrdenCampo;
  ordenDir: OrdenDir;
  onToggleOrden: (c: OrdenCampo) => void;
  onView: (s: Servicio) => void;
  onEdit: (s: Servicio) => void;
  onDelete: (s: Servicio) => void;
}) {
  const headers: { label: string; campo?: OrdenCampo }[] = [
    { label: "Servicio", campo: "nombre" },
    { label: "Frecuencia", campo: "pagoFrecuencia" },
    { label: "Precio", campo: "precio" },
    { label: "Imágenes" },
    { label: "Estado", campo: "status" },
    { label: "Actualización" },
    { label: "Acciones" },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: t.bgAlt }}>
            {headers.map(({ label, campo }) => (
              <th
                key={label}
                onClick={() => campo && onToggleOrden(campo)}
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: 700,
                  color: t.textDisabled,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  cursor: campo ? "pointer" : "default",
                  userSelect: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {label}
                  {campo && <OrdenIcon campo={campo} activo={ordenCampo} dir={ordenDir} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {servicios.map((s) => (
            <tr key={s.id} className="table-row" style={{ borderTop: `1px solid ${t.border}`, transition: "background 0.15s" }}>
              <td style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: t.brand100,
                      color: t.brand600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Wrench size={16} />
                  </div>
                  <div style={{ minWidth: 240 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: t.textPrimary }}>{s.nombre}</div>
                    <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.descripcion}
                    </div>
                  </div>
                </div>
              </td>
              <td style={{ padding: "14px 16px" }}>
                <PagoFrecuenciaBadge frecuencia={s.pagoFrecuencia} />
              </td>
              <td style={{ padding: "14px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{money(s.precio)}</td>
              <td style={{ padding: "14px 16px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.textSecondary, fontSize: 12 }}>
                  <ImageIcon size={14} /> {s.imagenes.length}
                </span>
              </td>
              <td style={{ padding: "14px 16px" }}>
                <StatusBadge status={s.status} />
              </td>
              <td style={{ padding: "14px 16px", color: t.textSecondary, fontSize: 12 }}>{s.ultimaActualizacion}</td>
              <td style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="icon-btn" onClick={() => onView(s)} title="Ver">
                    <Eye size={16} />
                  </button>
                  <button className="icon-btn" onClick={() => onEdit(s)} title="Editar">
                    <Pencil size={16} />
                  </button>
                  <button className="icon-btn danger" onClick={() => onDelete(s)} title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {servicios.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: "18px 16px", color: t.textSecondary, fontSize: 13 }}>
                No hay servicios para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function VistaGrilla({
  servicios,
  onView,
  onEdit,
  onDelete,
}: {
  servicios: Servicio[];
  onView: (s: Servicio) => void;
  onEdit: (s: Servicio) => void;
  onDelete: (s: Servicio) => void;
}) {
  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {servicios.map((s) => {
          const img = s.imagenes[0]?.dataUrl;
          return (
            <div
              key={s.id}
              style={{
                background: "white",
                border: `1px solid ${t.border}`,
                borderRadius: 14,
                overflow: "hidden",
              }}
              className="hover-card"
            >
              <div
                style={{
                  height: 120,
                  background: img ? `url(${img}) center/cover no-repeat` : t.bgAlt,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.textDisabled,
                }}
              >
                {!img && <ImageIcon size={24} />}
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: t.textPrimary, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.nombre}
                    </div>
                    <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 4, minHeight: 34 }}>
                      {s.descripcion}
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                  <PagoFrecuenciaBadge frecuencia={s.pagoFrecuencia} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: t.textPrimary }}>
                    {money(s.precio)}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: t.textDisabled }}>{s.ultimaActualizacion}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="icon-btn" onClick={() => onView(s)} title="Ver">
                      <Eye size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => onEdit(s)} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button className="icon-btn danger" onClick={() => onDelete(s)} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ServiciosTableSection({
  servicios,
  search,
  frecuenciaActiva,
  vistaMode,
  ordenCampo,
  ordenDir,
  totalCount,
  onSearchChange,
  onFrecuenciaChange,
  onVistaModeChange,
  onToggleOrden,
  onView,
  onEdit,
  onDelete,
}: {
  servicios: Servicio[];
  search: string;
  frecuenciaActiva: string;
  vistaMode: VistaMode;
  ordenCampo: OrdenCampo;
  ordenDir: OrdenDir;
  totalCount: number;
  onSearchChange: (v: string) => void;
  onFrecuenciaChange: (v: string) => void;
  onVistaModeChange: (v: VistaMode) => void;
  onToggleOrden: (campo: OrdenCampo) => void;
  onView: (s: Servicio) => void;
  onEdit: (s: Servicio) => void;
  onDelete: (s: Servicio) => void;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: `1px solid ${t.border}`,
        animation: "slideIn 0.5s ease 0.2s both",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {React.useMemo(() => {
            const freqs = ["Todas", ...new Set(servicios.map((s) => s.pagoFrecuencia))];
            return freqs;
          }, [servicios]).map((freq) => (
            <button
              key={freq}
              onClick={() => onFrecuenciaChange(freq)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                background: frecuenciaActiva === freq ? t.brand600 : t.bgAlt,
                color: frecuenciaActiva === freq ? "white" : t.textSecondary,
              }}
            >
              {freq === "quincenal" ? "Cada 15 días" : String(freq)}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: t.bgAlt,
              border: `1px solid ${t.border}`,
              borderRadius: 10,
              padding: "8px 14px",
            }}
          >
            <Search size={14} style={{ color: t.textDisabled }} />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar servicio..."
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 13,
                color: t.textPrimary,
                width: 180,
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ display: "flex", border: `1px solid ${t.border}`, borderRadius: 10, overflow: "hidden" }}>
            <button
              onClick={() => onVistaModeChange("tabla")}
              style={{
                padding: "8px 12px",
                border: "none",
                cursor: "pointer",
                background: vistaMode === "tabla" ? t.brand600 : "white",
                color: vistaMode === "tabla" ? "white" : t.textSecondary,
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LayoutList size={15} />
            </button>
            <button
              onClick={() => onVistaModeChange("grilla")}
              style={{
                padding: "8px 12px",
                border: "none",
                cursor: "pointer",
                background: vistaMode === "grilla" ? t.brand600 : "white",
                color: vistaMode === "grilla" ? "white" : t.textSecondary,
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {vistaMode === "tabla" ? (
        <VistaTabla
          servicios={servicios}
          ordenCampo={ordenCampo}
          ordenDir={ordenDir}
          onToggleOrden={onToggleOrden}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <VistaGrilla servicios={servicios} onView={onView} onEdit={onEdit} onDelete={onDelete} />
      )}

      <div
        style={{
          padding: "14px 24px",
          borderTop: `1px solid ${t.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 12, color: t.textDisabled }}>
          Mostrando {servicios.length} de {totalCount} servicios
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: `1px solid ${n === 1 ? t.brand600 : t.border}`,
                background: n === 1 ? t.brand600 : "white",
                color: n === 1 ? "white" : t.textSecondary,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

