"use client";

import React from "react";
import { Search, Edit, Trash2, ToggleLeft, ToggleRight, Plus, X, Save, Grid, List } from "lucide-react";
import type { Impuesto, FormData, TipoImpuesto, AplicacionTipo } from "../hooks/useImpuestos";
import { impuestosTheme as t } from "../theme/impuestos.theme";
import { TIPO_IMPUESTO_LABELS, APLICACION_LABELS } from "../data/impuestos.data";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ImpuestosTableSectionProps {
  impuestos: Impuesto[];
  search: string;
  filtroTipo: string;
  filtroAlcance: string;
  vistaMode: "tabla" | "tarjetas";
  ordenCampo: keyof Impuesto;
  ordenDir: "asc" | "desc";
  totalCount: number;

  modalOpen: boolean;
  editando: Impuesto | null;
  formData: FormData;
  saving: boolean;

  onSearchChange: (v: string) => void;
  onFiltroTipoChange: (v: string) => void;
  onFiltroAlcanceChange: (v: string) => void;
  onVistaModeChange: (v: "tabla" | "tarjetas") => void;
  onToggleOrden: (campo: keyof Impuesto) => void;
  onEditar: (id: string) => void;
  onEliminar: (id: string) => void;
  onToggleActivo: (id: string) => void;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onGuardar: () => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  canManage?: boolean;
}

// ─── Opciones de filtros ──────────────────────────────────────────────────────

const TIPO_OPTIONS = ["Todos", "itbis", "isr", "isc", "retencion", "exento", "selectivo", "decoracion", "otro"];
const ALCANCE_OPTIONS = [
  { value: "Todos", label: "Todos" },
  { value: "producto", label: "Producto" },
  { value: "servicio", label: "Servicio" },
  { value: "ambos", label: "Ambos" },
];

// ─── Badge de tipo ────────────────────────────────────────────────────────────

const TIPO_COLORS: Record<TipoImpuesto, { bg: string; color: string }> = {
  itbis:      { bg: "#DBEAFE", color: "#1D4ED8" },
  isr:        { bg: "#FEF3C7", color: "#92400E" },
  isc:        { bg: "#FCE7F3", color: "#9D174D" },
  retencion:  { bg: "#FEE2E2", color: "#991B1B" },
  exento:     { bg: "#D1FAE5", color: "#065F46" },
  selectivo:  { bg: "#EDE9FE", color: "#5B21B6" },
  decoracion: { bg: "#FEF9C3", color: "#713F12" },
  otro:       { bg: "#F3F4F6", color: "#374151" },
};

function TipoBadge({ tipo }: { tipo: TipoImpuesto }) {
  const c = TIPO_COLORS[tipo] || TIPO_COLORS.otro;
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: "3px 9px", borderRadius: 20,
      fontSize: 11, fontWeight: 700,
    }}>
      {TIPO_IMPUESTO_LABELS[tipo] || tipo}
    </span>
  );
}

// ─── Modal CRUD ───────────────────────────────────────────────────────────────

function ImpuestoModal({
  open, editando, formData, saving, onClose, onGuardar, setFormData,
}: {
  open: boolean;
  editando: Impuesto | null;
  formData: FormData;
  saving: boolean;
  onClose: () => void;
  onGuardar: () => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  if (!open) return null;

  const field = <K extends keyof FormData>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const val = e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setFormData(prev => ({ ...prev, [key]: val }));
    };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "white", borderRadius: 20,
        width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px", borderBottom: `1px solid ${t.border}`,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: t.textPrimary, margin: 0 }}>
            {editando ? "Editar Impuesto" : "Nuevo Impuesto"}
          </h2>
          <button onClick={onClose} style={{
            border: "none", background: "none", cursor: "pointer", color: t.textSecondary, padding: 4,
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Nombre */}
          <FormField label="Nombre *">
            <input
              type="text"
              value={formData.nombre}
              onChange={field("nombre")}
              placeholder="Ej: ITBIS 18%"
              style={inputStyle}
            />
          </FormField>

          {/* Tipo + Tasa */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Tipo">
              <select value={formData.tipo} onChange={field("tipo")} style={inputStyle}>
                {(Object.keys(TIPO_IMPUESTO_LABELS) as TipoImpuesto[]).map(k => (
                  <option key={k} value={k}>{TIPO_IMPUESTO_LABELS[k]}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Tasa (%)">
              <input
                type="number"
                value={formData.tasa}
                onChange={e => setFormData(prev => ({ ...prev, tasa: Number(e.target.value) }))}
                min={0} max={100} step={0.01}
                style={inputStyle}
              />
            </FormField>
          </div>

          {/* Aplicacion */}
          <FormField label="Aplicación">
            <select value={formData.aplicacion} onChange={field("aplicacion")} style={inputStyle}>
              {(Object.keys(APLICACION_LABELS) as AplicacionTipo[]).map(k => (
                <option key={k} value={k}>{APLICACION_LABELS[k]}</option>
              ))}
            </select>
          </FormField>

          {/* Cuenta contable */}
          <FormField label="Cuenta Contable">
            <input
              type="text"
              value={formData.cuenta_contable}
              onChange={field("cuenta_contable")}
              placeholder="Ej: 2.1.1.01"
              style={inputStyle}
            />
          </FormField>

          {/* Descripción */}
          <FormField label="Descripción">
            <textarea
              value={formData.descripcion}
              onChange={field("descripcion")}
              rows={2}
              placeholder="Descripción del impuesto..."
              style={{ ...inputStyle, resize: "vertical", minHeight: 64 }}
            />
          </FormField>

          {/* Checkboxes */}
          <div style={{ display: "flex", gap: 20 }}>
            <CheckboxField
              label="Incluido en precio"
              checked={formData.afectaprecio}
              onChange={v => setFormData(p => ({ ...p, afectaprecio: v }))}
            />
            <CheckboxField
              label="Aplica ITBIS"
              checked={formData.aplicaitbis}
              onChange={v => setFormData(p => ({ ...p, aplicaitbis: v }))}
            />
            <CheckboxField
              label="Activo"
              checked={formData.activo}
              onChange={v => setFormData(p => ({ ...p, activo: v }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${t.border}`,
          display: "flex", justifyContent: "flex-end", gap: 10,
        }}>
          <button onClick={onClose} style={{
            padding: "9px 18px", borderRadius: 9,
            border: `1px solid ${t.border}`, background: "white",
            fontSize: 13, fontWeight: 600, cursor: "pointer", color: t.textSecondary,
          }}>
            Cancelar
          </button>
          <button
            onClick={onGuardar}
            disabled={saving}
            style={{
              padding: "9px 20px", borderRadius: 9,
              background: saving ? "#93C5FD" : t.brand600,
              color: "white", border: "none",
              fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 7,
            }}
          >
            <Save size={14} />
            {saving ? "Guardando..." : editando ? "Actualizar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 9,
  border: `1.5px solid #E2E8F0`,
  fontSize: 13,
  color: "#1E293B",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        fontSize: 11, fontWeight: 700, color: "#6B7280",
        display: "block", marginBottom: 6,
        textTransform: "uppercase", letterSpacing: "0.05em",
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function CheckboxField({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: "#2563EB", width: 14, height: 14 }}
      />
      <span style={{ color: "#374151", fontWeight: 500 }}>{label}</span>
    </label>
  );
}

// ─── Vista Tarjetas ───────────────────────────────────────────────────────────

function TarjetaImpuesto({
  imp, onEditar, onEliminar, onToggleActivo, canManage,
}: {
  imp: Impuesto;
  onEditar: (id: string) => void;
  onEliminar: (id: string) => void;
  onToggleActivo: (id: string) => void;
  canManage: boolean;
}) {
  return (
    <div style={{
      background: "white",
      borderRadius: 14,
      border: `1px solid ${t.border}`,
      padding: 18,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <TipoBadge tipo={imp.tipo} />
        {canManage ? (
          <button
            onClick={() => onToggleActivo(imp.id)}
            title={imp.activo ? "Desactivar" : "Activar"}
            style={{ border: "none", background: "none", cursor: "pointer", color: imp.activo ? "#10B981" : "#9CA3AF" }}
          >
            {imp.activo ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
        ) : null}
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: t.textPrimary }}>{imp.nombre}</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: t.textSecondary, marginTop: 2 }}>
          {imp.codigo}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: 24, fontWeight: 800, fontFamily: "'DM Mono', monospace",
          color: t.brand600,
        }}>
          {imp.tasa}%
        </span>
        <span style={{ fontSize: 11, color: t.textSecondary }}>
          {APLICACION_LABELS[imp.aplicacion]}
        </span>
      </div>

      {canManage ? (
        <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${t.border}`, paddingTop: 12 }}>
          <button
            onClick={() => onEditar(imp.id)}
            style={{
              flex: 1, padding: "7px 0", borderRadius: 8,
              border: `1px solid ${t.border}`, background: "white",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              color: t.textSecondary,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}
          >
            <Edit size={13} /> Editar
          </button>
          <button
            onClick={() => onEliminar(imp.id)}
            style={{
              flex: 1, padding: "7px 0", borderRadius: 8,
              border: `1px solid #FEE2E2`, background: "#FFF5F5",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              color: "#DC2626",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}
          >
            <Trash2 size={13} /> Archivar
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ImpuestosTableSection({
  impuestos, search, filtroTipo, filtroAlcance, vistaMode,
  ordenCampo, ordenDir, totalCount,
  modalOpen, editando, formData, saving,
  onSearchChange, onFiltroTipoChange, onFiltroAlcanceChange,
  onVistaModeChange, onToggleOrden,
  onEditar, onEliminar, onToggleActivo,
  onOpenModal, onCloseModal, onGuardar, setFormData, canManage = true,
}: ImpuestosTableSectionProps) {

  const thStyle = (campo?: keyof Impuesto): React.CSSProperties => ({
    padding: "11px 14px",
    textAlign: "left",
    fontSize: 11, fontWeight: 700,
    color: t.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: `1px solid ${t.border}`,
    cursor: campo ? "pointer" : "default",
    userSelect: "none",
    whiteSpace: "nowrap",
  });

  const sortIcon = (campo: keyof Impuesto) =>
    ordenCampo === campo ? (ordenDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <>
      <div style={{
        background: "white",
        borderRadius: 16,
        border: `1px solid ${t.border}`,
        overflow: "hidden",
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          borderBottom: `1px solid ${t.border}`,
          gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={14} style={{
                position: "absolute", left: 10, top: "50%",
                transform: "translateY(-50%)", color: t.textSecondary,
              }} />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                style={{
                  padding: "7px 10px 7px 30px",
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  fontSize: 13, width: 200,
                }}
              />
            </div>

            {/* Filtro tipo */}
            <select
              value={filtroTipo}
              onChange={e => onFiltroTipoChange(e.target.value)}
              style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${t.border}`, fontSize: 13 }}
            >
              {TIPO_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt === "Todos" ? "Todos los tipos" : TIPO_IMPUESTO_LABELS[opt as TipoImpuesto] || opt}
                </option>
              ))}
            </select>

            {/* Filtro alcance */}
            <select
              value={filtroAlcance}
              onChange={e => onFiltroAlcanceChange(e.target.value)}
              style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${t.border}`, fontSize: 13 }}
            >
              {ALCANCE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: t.textSecondary }}>
              {impuestos.length} / {totalCount}
            </span>

            {/* Vista toggle */}
            <button
              onClick={() => onVistaModeChange(vistaMode === "tabla" ? "tarjetas" : "tabla")}
              title="Cambiar vista"
              style={{
                padding: "6px 10px", borderRadius: 7,
                border: `1px solid ${t.border}`, background: "white",
                cursor: "pointer", color: t.textSecondary,
              }}
            >
              {vistaMode === "tabla" ? <Grid size={15} /> : <List size={15} />}
            </button>

            {canManage ? (
              <button
                onClick={onOpenModal}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 8,
                  background: t.brand600, color: "white",
                  border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}
              >
                <Plus size={14} /> Nuevo
              </button>
            ) : null}
          </div>
        </div>

        {/* Vista tabla */}
        {vistaMode === "tabla" ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: t.bgAlt }}>
                <th style={thStyle("codigo")} onClick={() => onToggleOrden("codigo")}>
                  Código{sortIcon("codigo")}
                </th>
                <th style={thStyle("nombre")} onClick={() => onToggleOrden("nombre")}>
                  Nombre{sortIcon("nombre")}
                </th>
                <th style={thStyle("tipo")} onClick={() => onToggleOrden("tipo")}>
                  Tipo{sortIcon("tipo")}
                </th>
                <th style={thStyle("tasa")} onClick={() => onToggleOrden("tasa")}>
                  Tasa{sortIcon("tasa")}
                </th>
                <th style={thStyle("aplicacion")}>Aplicación</th>
                <th style={{ ...thStyle(), textAlign: "center" }}>Estado</th>
                <th style={{ ...thStyle(), textAlign: "center" }}>{canManage ? "Acciones" : "Acceso"}</th>
              </tr>
            </thead>
            <tbody>
              {impuestos.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{
                    padding: 48, textAlign: "center", color: t.textSecondary,
                    fontSize: 14,
                  }}>
                    No se encontraron impuestos
                  </td>
                </tr>
              ) : impuestos.map(imp => (
                <tr
                  key={imp.id}
                  style={{ borderBottom: `1px solid ${t.border}` }}
                  className="table-row-hover"
                >
                  <td style={{ padding: "13px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: t.textSecondary }}>
                    {imp.codigo}
                  </td>
                  <td style={{ padding: "13px 14px", fontWeight: 600, fontSize: 13, color: t.textPrimary }}>
                    {imp.nombre}
                    {imp.descripcion && imp.descripcion !== imp.nombre && (
                      <div style={{ fontSize: 11, color: t.textSecondary, fontWeight: 400, marginTop: 1 }}>
                        {imp.descripcion}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "13px 14px" }}>
                    <TipoBadge tipo={imp.tipo} />
                  </td>
                  <td style={{ padding: "13px 14px", fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 13, color: t.brand600 }}>
                    {imp.tasa}%
                  </td>
                  <td style={{ padding: "13px 14px", fontSize: 12, color: t.textSecondary }}>
                    {APLICACION_LABELS[imp.aplicacion]}
                  </td>
                  <td style={{ padding: "13px 14px", textAlign: "center" }}>
                    {canManage ? (
                      <button
                        onClick={() => onToggleActivo(imp.id)}
                        title={imp.activo ? "Desactivar" : "Activar"}
                        style={{ border: "none", background: "none", cursor: "pointer" }}
                      >
                        <span style={{
                          background: imp.activo ? "#D1FAE5" : "#FEE2E2",
                          color: imp.activo ? "#065F46" : "#991B1B",
                          padding: "3px 10px", borderRadius: 20,
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {imp.activo ? "Activo" : "Inactivo"}
                        </span>
                      </button>
                    ) : (
                      <span style={{
                        background: imp.activo ? "#D1FAE5" : "#FEE2E2",
                        color: imp.activo ? "#065F46" : "#991B1B",
                        padding: "3px 10px", borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {imp.activo ? "Activo" : "Inactivo"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "13px 14px", textAlign: "center" }}>
                    {canManage ? (
                      <>
                        <button
                          onClick={() => onEditar(imp.id)}
                          title="Editar"
                          style={{
                            border: "none", background: "none", cursor: "pointer",
                            color: t.textSecondary, padding: "4px 6px", borderRadius: 6,
                          }}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => onEliminar(imp.id)}
                          title="Archivar"
                          style={{
                            border: "none", background: "none", cursor: "pointer",
                            color: "#DC2626", padding: "4px 6px", borderRadius: 6, marginLeft: 4,
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: 12, color: t.textSecondary }}>Solo lectura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Vista tarjetas */
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
            padding: 20,
          }}>
            {impuestos.length === 0 ? (
              <div style={{ gridColumn: "1/-1", padding: 48, textAlign: "center", color: t.textSecondary }}>
                No se encontraron impuestos
              </div>
            ) : impuestos.map(imp => (
              <TarjetaImpuesto
                key={imp.id}
                imp={imp}
                onEditar={onEditar}
                onEliminar={onEliminar}
                onToggleActivo={onToggleActivo}
                canManage={canManage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal CRUD */}
      {canManage ? (
        <ImpuestoModal
          open={modalOpen}
          editando={editando}
          formData={formData}
          saving={saving}
          onClose={onCloseModal}
          onGuardar={onGuardar}
          setFormData={setFormData}
        />
      ) : null}
    </>
  );
}
