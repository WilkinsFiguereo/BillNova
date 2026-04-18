"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Factura, OrdenCampo, OrdenDir, VistaMode } from "../types/facturas.types";
import { STATUS_MAP } from "../data/facturas.data";

// ─── Config ────────────────────────────────────────────────────────────
const ODOO_BASE_URL = process.env.NEXT_PUBLIC_ODOO_URL || "http://localhost:8079";

// ─── Types ─────────────────────────────────────────────────────────────
export interface OdooFactura {
  id: string;
  numero: string;
  reference: string;
  fecha: string;
  fechaVencimiento: string;
  status: "pagada" | "pendiente" | "vencida" | "borrador" | "cancelada";
  total: number;
  subtotal: number;
  impuesto: number;
  items: number;
  company_id: number | null;
  cliente: string;
  clienteEmail: string;
  phone: string;
  address: string;
  lines: { id: string; productName: string; quantity: number; priceUnit: number }[];
  invoice: {
    id: string;
    reference: string;
    state: string;
    payment_state: string;
    url: string;
  } | null;
}

export interface OdooStats {
  totalFacturado: number;
  pagadas:   { count: number; amount: number };
  pendientes: { count: number; amount: number };
  vencidas:  { count: number; amount: number };
  borradores: { count: number; amount: number };
}

interface UseFacturasOdooReturn {
  // Data
  facturas: OdooFactura[];
  facturasFiltradas: OdooFactura[];
  stats: OdooStats | null;
  // UI state
  search: string;
  filtroActivo: string;
  vistaMode: VistaMode;
  ordenCampo: OrdenCampo;
  ordenDir: OrdenDir;
  // Loading / error
  loading: boolean;
  error: string | null;
  // Toast
  toastVisible: boolean;
  toastMsg: string;
  toastType: "success" | "error" | "info";
  // Actions
  setSearch: (v: string) => void;
  setFiltroActivo: (v: string) => void;
  setVistaMode: (v: VistaMode) => void;
  toggleOrden: (campo: OrdenCampo) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  refetch: () => void;
  // Invoice actions
  changeInvoiceState: (invoiceId: string, newState: "posted" | "cancel" | "draft") => Promise<void>;
  sendInvoiceEmail: (invoiceId: string, email?: string) => Promise<void>;
  downloadInvoicePDF: (orderId: string, invoiceName?: string) => void;
}

// ─── Hook ──────────────────────────────────────────────────────────────
export function useFacturasOdoo(companyId?: number): UseFacturasOdooReturn {
  const [facturas, setFacturas] = useState<OdooFactura[]>([]);
  const [stats, setStats] = useState<OdooStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("Todas");
  const [vistaMode, setVistaMode] = useState<VistaMode>("tabla");
  const [ordenCampo, setOrdenCampo] = useState<OrdenCampo>("fecha");
  const [ordenDir, setOrdenDir] = useState<OrdenDir>("desc");

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

  const showToast = useCallback((msg: string, type: "success" | "error" | "info" = "info") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }, []);

  // ── Fetch desde Odoo ─────────────────────────────────────────────
  const fetchFacturas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = companyId ? `?company_id=${companyId}` : "";
      const res = await fetch(`${ODOO_BASE_URL}/api/pos/orders${params}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error desconocido");

      setFacturas(json.data || []);
      setStats(json.stats || null);
    } catch (err: any) {
      const msg = err?.message || "Error conectando con Odoo";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [companyId, showToast]);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  // ── Filtrado y ordenamiento ──────────────────────────────────────
  const facturasFiltradas = useMemo(() => {
    let lista = [...facturas];

    if (search) {
      const q = search.toLowerCase();
      lista = lista.filter(
        (f) =>
          f.numero.toLowerCase().includes(q) ||
          f.cliente.toLowerCase().includes(q) ||
          f.clienteEmail.toLowerCase().includes(q)
      );
    }

    if (filtroActivo !== "Todas") {
      const statusKey = STATUS_MAP[filtroActivo];
      lista = lista.filter((f) => f.status === statusKey);
    }

    lista.sort((a, b) => {
      // Mapear campo del frontend al campo del objeto OdooFactura
      const campo = ordenCampo === "numero" ? "numero"
        : ordenCampo === "cliente" ? "cliente"
        : ordenCampo === "fecha" ? "fecha"
        : ordenCampo === "total" ? "total"
        : ordenCampo === "status" ? "status"
        : "fecha";

      let valA: string | number = (a as any)[campo];
      let valB: string | number = (b as any)[campo];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return ordenDir === "asc" ? -1 : 1;
      if (valA > valB) return ordenDir === "asc" ? 1 : -1;
      return 0;
    });

    return lista;
  }, [facturas, search, filtroActivo, ordenCampo, ordenDir]);

  // ── Toggle orden ─────────────────────────────────────────────────
  const toggleOrden = useCallback((campo: OrdenCampo) => {
    if (ordenCampo === campo) {
      setOrdenDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setOrdenCampo(campo);
      setOrdenDir("asc");
    }
  }, [ordenCampo]);

  // ── Cambiar estado de factura ────────────────────────────────────
  const changeInvoiceState = useCallback(async (
    invoiceId: string,
    newState: "posted" | "cancel" | "draft"
  ) => {
    try {
      const res = await fetch(`${ODOO_BASE_URL}/api/pos/invoice/${invoiceId}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ state: newState }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error cambiando estado");

      const stateLabels: Record<string, string> = {
        posted: "confirmada",
        cancel: "cancelada",
        draft: "borrador",
      };
      showToast(`Factura ${stateLabels[newState] || newState}`, "success");
      await fetchFacturas(); // Refrescar lista
    } catch (err: any) {
      showToast(err?.message || "Error cambiando estado", "error");
    }
  }, [fetchFacturas, showToast]);

  // ── Enviar email ─────────────────────────────────────────────────
  const sendInvoiceEmail = useCallback(async (invoiceId: string, email?: string) => {
    try {
      const body: Record<string, string> = {};
      if (email) body.email = email;

      const res = await fetch(`${ODOO_BASE_URL}/api/pos/invoice/${invoiceId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error enviando email");

      showToast(`Factura enviada a ${json.sent_to}`, "success");
    } catch (err: any) {
      showToast(err?.message || "Error enviando email", "error");
    }
  }, [showToast]);

  // ── Descargar PDF ────────────────────────────────────────────────
  const downloadInvoicePDF = useCallback((orderId: string, invoiceName?: string) => {
    const url = `${ODOO_BASE_URL}/api/pos/order/${orderId}/invoice`;
    const link = document.createElement("a");
    link.href = url;
    link.download = invoiceName ? `factura-${invoiceName}.pdf` : `factura-${orderId}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Descargando PDF...", "info");
  }, [showToast]);

  return {
    facturas,
    facturasFiltradas,
    stats,
    search,
    filtroActivo,
    vistaMode,
    ordenCampo,
    ordenDir,
    loading,
    error,
    toastVisible,
    toastMsg,
    toastType,
    setSearch,
    setFiltroActivo,
    setVistaMode,
    toggleOrden,
    showToast,
    refetch: fetchFacturas,
    changeInvoiceState,
    sendInvoiceEmail,
    downloadInvoicePDF,
  };
}