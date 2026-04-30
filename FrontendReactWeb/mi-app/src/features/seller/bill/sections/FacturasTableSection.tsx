"use client";

import React, { useState } from "react";
import {
  Search, LayoutList, Columns,
  ArrowUpDown, ArrowUp, ArrowDown,
  FileText, Download, Send, ChevronDown,
  Loader2, X, CheckCircle, XCircle,
  RotateCcw, Mail, Package, User,
  Phone, MapPin, Calendar, Hash,
  Receipt, CreditCard, Clock,
} from "lucide-react";
import { OrdenCampo, OrdenDir, VistaMode } from "../types/facturas.types";
import { OdooFactura } from "../hooks/useFacturas";
import { facturasTheme as t } from "../theme/facturas.theme";
import { STATUS_FILTERS } from "../data/facturas.data";

// ─── Status styles ──────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pagada:    { label: "Pagada",    color: "#065F46", bg: "#D1FAE5", border: "#6EE7B7" },
  pendiente: { label: "Pendiente", color: "#92400E", bg: "#FEF3C7", border: "#FCD34D" },
  vencida:   { label: "Vencida",   color: "#991B1B", bg: "#FEE2E2", border: "#FCA5A5" },
  borrador:  { label: "Borrador",  color: "#374151", bg: "#F3F4F6", border: "#D1D5DB" },
  cancelada: { label: "Cancelada", color: "#4C1D95", bg: "#EDE9FE", border: "#C4B5FD" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.borrador;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      whiteSpace: "nowrap", display: "inline-block",
    }}>
      {s.label}
    </span>
  );
}

// ─── Icono de orden ──────────────────────────────────────────────────────
function OrdenIcon({ campo, activo, dir }: { campo: OrdenCampo; activo: OrdenCampo; dir: OrdenDir }) {
  if (campo !== activo) return <ArrowUpDown size={11} style={{ opacity: 0.3 }} />;
  return dir === "asc"
    ? <ArrowUp size={11} style={{ color: t.brand400 }} />
    : <ArrowDown size={11} style={{ color: t.brand400 }} />;
}

// ─── Modal: Cambiar Estado ────────────────────────────────────────────────
function ChangeStateModal({
  factura, onClose, onConfirmInvoice, onCreateInvoice,
}: {
  factura: OdooFactura;
  onClose: () => void;
  onConfirmInvoice: (id: string, state: "posted" | "cancel" | "draft") => Promise<void>;
  onCreateInvoice: (orderId: string) => Promise<{ invoiceId: string } | null>;
}) {
  const [loading, setLoading] = useState(false);

  const options: {
    label: string; value: "posted" | "cancel" | "draft";
    desc: string; color: string; Icon: React.ElementType;
  }[] = factura.invoice ? [
    { label: "Confirmar", value: "posted",  desc: "Publicar y confirmar la factura",              color: "#059669", Icon: CheckCircle },
    { label: "Cancelar",  value: "cancel",  desc: "Anular esta factura",                           color: "#DC2626", Icon: XCircle    },
    { label: "Borrador",  value: "draft",   desc: "Regresar a borrador (solo desde cancelada)",    color: "#6B7280", Icon: RotateCcw  },
  ] : [
    { label: "Confirmar", value: "posted",  desc: "Crear y confirmar la factura",                  color: "#059669", Icon: CheckCircle },
  ];

  const handle = async (val: "posted" | "cancel" | "draft") => {
    setLoading(true);
    if (factura.invoice) {
      await onConfirmInvoice(factura.invoice.id, val);
    } else if (val === "posted") {
      await onCreateInvoice(factura.id);
    }
    setLoading(false);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10001,
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "white", borderRadius: 20, padding: 28, width: 360,
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: t.textPrimary }}>Cambiar estado</div>
            <div style={{ fontSize: 11, color: t.textDisabled, marginTop: 3 }}>
              {factura.numero} · actual: <strong>{factura.invoice?.state || "—"}</strong>
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: t.textDisabled }}>
            <X size={17} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map(({ label, value, desc, color, Icon }) => (
            <button key={value} disabled={loading} onClick={() => handle(value)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "13px 15px", borderRadius: 12,
              border: `1.5px solid ${t.border}`, background: "white",
              cursor: loading ? "wait" : "pointer", textAlign: "left",
              opacity: loading ? 0.6 : 1, transition: "border-color 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = t.border)}
            >
              <Icon size={16} style={{ color, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: t.textPrimary }}>{label}</div>
                <div style={{ fontSize: 11, color: t.textDisabled }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Compartir por correo ───────────────────────────────────────────
function SendEmailModal({
  factura, onClose, onSend,
}: {
  factura: OdooFactura;
  onClose: () => void;
  onSend: (id: string, email?: string) => Promise<void>;
}) {
  const [email, setEmail] = useState(factura.clienteEmail || "");
  const [loading, setLoading] = useState(false);
  const canSend = factura.invoice?.state === "posted";

  const handle = async () => {
    if (!factura.invoice) return;
    setLoading(true);
    await onSend(factura.invoice.id, email || undefined);
    setLoading(false);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10001,
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "white", borderRadius: 20, padding: 28, width: 400,
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: t.textPrimary }}>Compartir por correo</div>
            <div style={{ fontSize: 11, color: t.textDisabled, marginTop: 3 }}>{factura.numero}</div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: t.textDisabled }}>
            <X size={17} />
          </button>
        </div>

        {!canSend && (
          <div style={{
            background: "#FEF3C7", border: "1px solid #FCD34D",
            borderRadius: 10, padding: "10px 13px", marginBottom: 16,
            fontSize: 12, color: "#92400E",
          }}>
            Solo se pueden enviar facturas confirmadas.
          </div>
        )}

        <label style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, display: "block", marginBottom: 6 }}>
          Destinatario
        </label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="cliente@empresa.com"
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 13px", borderRadius: 10,
            border: `1.5px solid ${t.border}`,
            fontSize: 13, fontFamily: "inherit", color: t.textPrimary, outline: "none", marginBottom: 4,
          }} />
        <div style={{ fontSize: 11, color: t.textDisabled, marginBottom: 20 }}>
          Vacío = usa el email del partner en Odoo
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "9px 16px", borderRadius: 9, border: `1px solid ${t.border}`,
            background: "white", fontSize: 13, cursor: "pointer", color: t.textSecondary,
          }}>Cancelar</button>
          <button onClick={handle} disabled={loading || !canSend} style={{
            padding: "9px 16px", borderRadius: 9, border: "none", background: t.brand600,
            fontSize: 13, cursor: (loading || !canSend) ? "not-allowed" : "pointer",
            color: "white", fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
            opacity: (loading || !canSend) ? 0.6 : 1,
          }}>
            {loading
              ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
              : <Mail size={13} />}
            Compartir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Panel lateral de detalles ────────────────────────────────────────────
function InvoiceDetailPanel({
  factura, onClose, onChangeState, onSendEmail, onDownloadPDF,
}: {
  factura: OdooFactura;
  onClose: () => void;
  onChangeState: (f: OdooFactura) => void;
  onSendEmail: (f: OdooFactura) => void;
  onDownloadPDF: (f: OdooFactura) => void;
}) {
  const status = STATUS_STYLES[factura.status] || STATUS_STYLES.borrador;

  function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
      <div style={{
        display: "flex", gap: 11, alignItems: "flex-start",
        padding: "9px 0", borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7, flexShrink: 0,
          background: t.bgAlt, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={13} style={{ color: t.textDisabled }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: t.textDisabled,
            textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2,
          }}>
            {label}
          </div>
          <div style={{ fontSize: 13, color: t.textPrimary, fontWeight: 500, wordBreak: "break-word" }}>
            {value || "—"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.18)",
      }} onClick={onClose} />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 9001,
        width: 430, background: "white",
        boxShadow: "-6px 0 28px rgba(0,0,0,0.10)",
        display: "flex", flexDirection: "column",
        animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
      }}>

        {/* Header del panel */}
        <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 11,
                background: t.brand100, color: t.brand600,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Receipt size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: t.brand400, fontWeight: 700, marginBottom: 1 }}>
                  {factura.numero}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, lineHeight: 1.2 }}>
                  Detalle de factura
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 30, height: 30, borderRadius: 7,
              border: `1px solid ${t.border}`, background: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: t.textDisabled, flexShrink: 0,
            }}>
              <X size={14} />
            </button>
          </div>

          {/* Chip estado + total */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 14, padding: "11px 14px",
            background: status.bg, borderRadius: 12, border: `1px solid ${status.border}`,
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: status.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Estado
              </div>
              <StatusBadge status={factura.status} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: status.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                Total
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary, fontFamily: "monospace" }}>
                ${factura.total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Acciones del panel */}
          <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
            {[
              { label: "Descargar PDF", Icon: Download, color: "#7C3AED", hover: "#F5F3FF", action: () => onDownloadPDF(factura) },
              { label: "Cambiar estado", Icon: ChevronDown, color: "#059669", hover: "#F0FDF4", action: () => onChangeState(factura) },
              ...(factura.invoice ? [
                { label: "Compartir correo", Icon: Send,      color: "#2563EB", hover: "#EFF6FF", action: () => onSendEmail(factura)   },
              ] : []),
            ].map(({ label, Icon, color, hover, action }) => (
              <button key={label} onClick={action} style={{
                flex: 1, padding: "8px 4px", borderRadius: 9,
                border: `1px solid ${t.border}`, background: "white",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                cursor: "pointer", transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = hover; e.currentTarget.style.borderColor = color; }}
                onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = t.border; }}
              >
                <Icon size={14} style={{ color }} />
                <span style={{ fontSize: 10, fontWeight: 600, color, whiteSpace: "nowrap" }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 22px 28px" }}>

          {/* Comprador */}
          <div style={{ fontSize: 10, fontWeight: 700, color: t.textDisabled, textTransform: "uppercase", letterSpacing: "0.08em", padding: "16px 0 2px" }}>
            Comprador
          </div>
          <InfoRow icon={User}     label="Nombre"    value={factura.cliente} />
          <InfoRow icon={Mail}     label="Email"     value={factura.clienteEmail} />
          <InfoRow icon={Phone}    label="Teléfono"  value={factura.phone} />
          <InfoRow icon={MapPin}   label="Dirección" value={factura.address} />

          {/* Datos de factura */}
          <div style={{ fontSize: 10, fontWeight: 700, color: t.textDisabled, textTransform: "uppercase", letterSpacing: "0.08em", padding: "16px 0 2px" }}>
            Datos de factura
          </div>
          <InfoRow icon={Hash}       label="Referencia"    value={factura.numero} />
          <InfoRow icon={Calendar}   label="Fecha emisión" value={factura.fecha} />
          <InfoRow icon={Clock}      label="Vencimiento"   value={factura.fechaVencimiento} />
          {factura.invoice?.state && (
            <InfoRow icon={CreditCard} label="Estado Odoo" value={factura.invoice.state} />
          )}

          {/* Líneas de productos */}
          <div style={{ fontSize: 10, fontWeight: 700, color: t.textDisabled, textTransform: "uppercase", letterSpacing: "0.08em", padding: "16px 0 8px" }}>
            Productos ({factura.items})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {factura.lines.length === 0 ? (
              <div style={{ fontSize: 13, color: t.textDisabled, padding: "4px 0" }}>Sin líneas registradas</div>
            ) : factura.lines.map((line) => (
              <div key={line.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10,
                background: t.bgAlt, border: `1px solid ${t.border}`,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                  background: t.brand100, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Package size={13} style={{ color: t.brand600 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: t.textPrimary,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {line.productName}
                  </div>
                  <div style={{ fontSize: 11, color: t.textDisabled }}>
                    {line.quantity} × ${line.priceUnit.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary, fontFamily: "monospace", flexShrink: 0 }}>
                  ${(line.quantity * line.priceUnit).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div style={{ marginTop: 16, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            {[
              { label: "Subtotal", value: factura.subtotal, bold: false },
              { label: "Impuesto", value: factura.impuesto, bold: false },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 15px", borderBottom: `1px solid ${t.border}`,
              }}>
                <span style={{ fontSize: 13, color: t.textSecondary }}>{label}</span>
                <span style={{ fontSize: 13, fontFamily: "monospace", color: t.textSecondary }}>
                  ${value.toFixed(2)}
                </span>
              </div>
            ))}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "13px 15px", background: t.brand600,
            }}>
              <span style={{ fontSize: 14, color: "white", fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: 16, fontFamily: "monospace", color: "white", fontWeight: 700 }}>
                ${factura.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ─── Botón de acción ────────────────────────────────────────────────────
function ActionBtn({
  onClick, title, color, hoverBg, children,
}: {
  onClick: () => void; title: string;
  color: string; hoverBg: string; children: React.ReactNode;
}) {
  return (
    <button title={title} onClick={onClick} style={{
      width: 28, height: 28, borderRadius: 7,
      border: `1px solid ${t.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color, background: "white", cursor: "pointer", transition: "all 0.12s", flexShrink: 0,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.borderColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = t.border; }}
    >
      {children}
    </button>
  );
}

// ─── Vista Tabla ────────────────────────────────────────────────────────
function VistaTabla({
  facturas, ordenCampo, ordenDir, onToggleOrden,
  onView, onChangeState, onSendEmail, onDownloadPDF,
}: {
  facturas: OdooFactura[];
  ordenCampo: OrdenCampo; ordenDir: OrdenDir;
  onToggleOrden: (c: OrdenCampo) => void;
  onView: (f: OdooFactura) => void;
  onChangeState: (f: OdooFactura) => void;
  onSendEmail: (f: OdooFactura) => void;
  onDownloadPDF: (f: OdooFactura) => void;
}) {
  const headers: { label: string; campo?: OrdenCampo }[] = [
    { label: "Factura",    campo: "numero"  },
    { label: "Cliente",    campo: "cliente" },
    { label: "Fecha",      campo: "fecha"   },
    { label: "Vencimiento"                  },
    { label: "Total",      campo: "total"   },
    { label: "Estado",     campo: "status"  },
    { label: "Acciones"                     },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: t.bgAlt }}>
            {headers.map(({ label, campo }) => (
              <th key={label} onClick={() => campo && onToggleOrden(campo)} style={{
                padding: "10px 16px", textAlign: "left",
                fontSize: 10, fontWeight: 700, color: t.textDisabled,
                letterSpacing: "0.07em", textTransform: "uppercase",
                whiteSpace: "nowrap", cursor: campo ? "pointer" : "default", userSelect: "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {label}
                  {campo && <OrdenIcon campo={campo} activo={ordenCampo} dir={ordenDir} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {facturas.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "52px", color: t.textDisabled, fontSize: 13 }}>
                No hay facturas para mostrar
              </td>
            </tr>
          ) : facturas.map((f) => (
            <tr key={f.id} style={{ borderTop: `1px solid ${t.border}` }}
              onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
              onMouseLeave={e => (e.currentTarget.style.background = "white")}
            >
              <td style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: t.brand100, color: t.brand600,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <FileText size={14} />
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: t.brand400, fontWeight: 600 }}>
                    {f.numero}
                  </span>
                </div>
              </td>

              <td style={{ padding: "12px 16px" }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: t.textPrimary }}>{f.cliente || "—"}</div>
                <div style={{ fontSize: 11, color: t.textDisabled }}>{f.clienteEmail || "sin email"}</div>
              </td>

              <td style={{ padding: "12px 16px", fontSize: 12, color: t.textSecondary }}>{f.fecha}</td>

              <td style={{ padding: "12px 16px" }}>
                <span style={{
                  fontSize: 12,
                  color: f.status === "vencida" ? "#DC2626" : t.textSecondary,
                  fontWeight: f.status === "vencida" ? 700 : 400,
                }}>
                  {f.fechaVencimiento || "—"}
                </span>
              </td>

              <td style={{ padding: "12px 16px" }}>
                <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: t.textPrimary }}>
                  ${f.total.toFixed(2)}
                </div>
                <div style={{ fontSize: 10, color: t.textDisabled }}>IVA ${f.impuesto.toFixed(2)}</div>
              </td>

              <td style={{ padding: "12px 16px" }}>
                <StatusBadge status={f.status} />
              </td>

              <td style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", gap: 5 }}>
                  <ActionBtn title="Ver detalles"   onClick={() => onView(f)}        color={t.brand400} hoverBg="#EEF2FF">
                    <FileText size={13} />
                  </ActionBtn>
                  <ActionBtn title="Descargar PDF"  onClick={() => onDownloadPDF(f)} color="#7C3AED"  hoverBg="#F5F3FF">
                    <Download size={13} />
                  </ActionBtn>
                  <ActionBtn title="Cambiar estado" onClick={() => onChangeState(f)} color="#059669" hoverBg="#F0FDF4">
                    <ChevronDown size={13} />
                  </ActionBtn>
                  {f.invoice && (
                    <ActionBtn title="Compartir por correo" onClick={() => onSendEmail(f)} color="#2563EB" hoverBg="#EFF6FF">
                      <Send size={13} />
                    </ActionBtn>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Vista Kanban ─────────────────────────────────────────────────────────
function VistaKanban({
  facturas, onView, onDownloadPDF,
}: {
  facturas: OdooFactura[];
  onView: (f: OdooFactura) => void;
  onDownloadPDF: (f: OdooFactura) => void;
}) {
  const columnas = Object.entries(STATUS_STYLES)
    .filter(([key]) => key !== "cancelada")
    .map(([key, s]) => ({ key, ...s }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, padding: "18px 22px" }}>
      {columnas.map((col) => {
        const items = facturas.filter(f => f.status === col.key);
        const totalCol = items.reduce((s, f) => s + f.total, 0);
        return (
          <div key={col.key}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 10, padding: "7px 11px",
              background: col.bg, borderRadius: 9, border: `1px solid ${col.border}`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: col.color }}>{col.label}</span>
              <span style={{ background: "white", color: col.color, borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
                {items.length}
              </span>
            </div>
            <div style={{ fontSize: 10, color: t.textDisabled, fontFamily: "monospace", marginBottom: 8, paddingLeft: 3 }}>
              ${totalCol.toFixed(2)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map(f => (
                <div key={f.id} style={{
                  borderRadius: 11, background: "white",
                  border: `1px solid ${t.border}`, padding: "12px",
                  cursor: "pointer",
                }} onClick={() => onView(f)}>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: t.brand400, fontWeight: 700, marginBottom: 5 }}>
                    {f.numero}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: t.textPrimary, marginBottom: 2 }}>
                    {f.cliente || "Sin cliente"}
                  </div>
                  <div style={{ fontSize: 10, color: t.textDisabled, marginBottom: 10 }}>
                    {f.fechaVencimiento ? `Vence: ${f.fechaVencimiento}` : "Sin vencimiento"}
                  </div>
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderTop: `1px solid ${t.border}`, paddingTop: 9,
                  }} onClick={e => e.stopPropagation()}>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: t.textPrimary }}>
                      ${f.total.toFixed(2)}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <ActionBtn title="Ver detalles"  onClick={() => onView(f)}        color={t.brand400} hoverBg="#EEF2FF">
                        <FileText size={11} />
                      </ActionBtn>
                      <ActionBtn title="Descargar PDF" onClick={() => onDownloadPDF(f)} color="#7C3AED"  hoverBg="#F5F3FF">
                        <Download size={11} />
                      </ActionBtn>
                    </div>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div style={{
                  padding: "22px", textAlign: "center", color: t.textDisabled,
                  fontSize: 12, border: `2px dashed ${t.border}`, borderRadius: 11,
                }}>
                  Sin facturas
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Props del componente principal ──────────────────────────────────────
interface FacturasTableSectionProps {
  facturas: OdooFactura[];
  search: string;
  filtroActivo: string;
  vistaMode: VistaMode;
  ordenCampo: OrdenCampo;
  ordenDir: OrdenDir;
  totalCount: number;
  loading?: boolean;
  onSearchChange: (v: string) => void;
  onFiltroChange: (v: string) => void;
  onVistaModeChange: (v: VistaMode) => void;
  onToggleOrden: (campo: OrdenCampo) => void;
  onChangeState: (invoiceId: string, state: "posted" | "cancel" | "draft") => Promise<void>;
  onCreateInvoice: (orderId: string) => Promise<{ invoiceId: string } | null>;
  onSendEmail: (invoiceId: string, email?: string) => Promise<void>;
  onDownloadPDF: (params: { orderId?: string; invoiceId?: string; invoiceName?: string }) => Promise<void>;
}

// ─── Componente principal ─────────────────────────────────────────────────
export function FacturasTableSection({
  facturas, search, filtroActivo, vistaMode,
  ordenCampo, ordenDir, totalCount, loading = false,
  onSearchChange, onFiltroChange, onVistaModeChange,
  onToggleOrden, onChangeState, onCreateInvoice, onSendEmail, onDownloadPDF,
}: FacturasTableSectionProps) {
  const [panelFactura,      setPanelFactura]      = useState<OdooFactura | null>(null);
  const [changeStateTarget, setChangeStateTarget] = useState<OdooFactura | null>(null);
  const [sendEmailTarget,   setSendEmailTarget]   = useState<OdooFactura | null>(null);

  // Al abrir modales desde el panel, cerramos el panel primero
  const openChangeState = (f: OdooFactura) => { setPanelFactura(null); setChangeStateTarget(f); };
  const openSendEmail   = (f: OdooFactura) => { setPanelFactura(null); setSendEmailTarget(f);   };

  return (
    <>
      {panelFactura && (
        <InvoiceDetailPanel
          factura={panelFactura}
          onClose={() => setPanelFactura(null)}
          onChangeState={openChangeState}
          onSendEmail={openSendEmail}
          onDownloadPDF={(f) => onDownloadPDF({ orderId: f.id, invoiceId: f.invoice?.id, invoiceName: f.invoice?.reference })}
        />
      )}

      {changeStateTarget && (
        <ChangeStateModal
          factura={changeStateTarget}
          onClose={() => setChangeStateTarget(null)}
          onConfirmInvoice={onChangeState}
          onCreateInvoice={onCreateInvoice}
        />
      )}

      {sendEmailTarget && (
        <SendEmailModal
          factura={sendEmailTarget}
          onClose={() => setSendEmailTarget(null)}
          onSend={onSendEmail}
        />
      )}

      <div style={{
        background: "white", borderRadius: 16, border: `1px solid ${t.border}`,
        animation: "slideIn 0.5s ease 0.2s both",
      }}>
        {/* Toolbar */}
        <div style={{
          padding: "14px 22px", borderBottom: `1px solid ${t.border}`,
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 10,
        }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {STATUS_FILTERS.map((f) => (
              <button key={f} onClick={() => onFiltroChange(f)} style={{
                padding: "5px 13px", borderRadius: 20, border: "none",
                fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                background: filtroActivo === f ? t.brand600 : t.bgAlt,
                color: filtroActivo === f ? "white" : t.textSecondary,
              }}>
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              background: t.bgAlt, border: `1px solid ${t.border}`,
              borderRadius: 10, padding: "7px 12px",
            }}>
              <Search size={13} style={{ color: t.textDisabled }} />
              <input value={search} onChange={e => onSearchChange(e.target.value)}
                placeholder="Buscar factura o cliente..."
                style={{
                  border: "none", background: "transparent", outline: "none",
                  fontSize: 13, color: t.textPrimary, width: 180, fontFamily: "inherit",
                }} />
            </div>

            <div style={{ display: "flex", border: `1px solid ${t.border}`, borderRadius: 9, overflow: "hidden" }}>
              {(["tabla", "kanban"] as VistaMode[]).map((mode) => (
                <button key={mode} onClick={() => onVistaModeChange(mode)} style={{
                  padding: "7px 11px", border: "none", cursor: "pointer",
                  background: vistaMode === mode ? t.brand600 : "white",
                  color: vistaMode === mode ? "white" : t.textSecondary,
                  transition: "all 0.15s", display: "flex", alignItems: "center",
                }}>
                  {mode === "tabla" ? <LayoutList size={14} /> : <Columns size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div style={{
            padding: "56px", textAlign: "center", color: t.textDisabled,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            <Loader2 size={19} style={{ animation: "spin 1s linear infinite", color: t.brand400 }} />
            <span style={{ fontSize: 13 }}>Cargando facturas desde Odoo...</span>
          </div>
        ) : vistaMode === "tabla" ? (
          <VistaTabla
            facturas={facturas} ordenCampo={ordenCampo} ordenDir={ordenDir}
            onToggleOrden={onToggleOrden}
            onView={setPanelFactura}
            onChangeState={openChangeState}
            onSendEmail={openSendEmail}
            onDownloadPDF={(f) => onDownloadPDF({ orderId: f.id, invoiceId: f.invoice?.id, invoiceName: f.invoice?.reference })}
          />
        ) : (
          <VistaKanban
            facturas={facturas}
            onView={setPanelFactura}
            onDownloadPDF={(f) => onDownloadPDF({ orderId: f.id, invoiceId: f.invoice?.id, invoiceName: f.invoice?.reference })}
          />
        )}

        {/* Footer */}
        <div style={{
          padding: "12px 22px", borderTop: `1px solid ${t.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 12, color: t.textDisabled }}>
            Mostrando {facturas.length} de {totalCount} facturas
          </span>
          <div style={{ display: "flex", gap: 5 }}>
            {[1, 2, 3].map((n) => (
              <button key={n} style={{
                width: 28, height: 28, borderRadius: 7,
                border: `1px solid ${n === 1 ? t.brand600 : t.border}`,
                background: n === 1 ? t.brand600 : "white",
                color: n === 1 ? "white" : t.textSecondary,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
