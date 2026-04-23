"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ODOO_URL, odooGet, odooPost } from "@/lib/odooApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TipoImpuesto =
  | "itbis" | "isr" | "isc" | "retencion" | "exento"
  | "selectivo" | "decoracion" | "otro";

export type AplicacionTipo = "producto" | "servicio" | "ambos";

export interface Impuesto {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoImpuesto;
  tasa: number;
  aplicacion: AplicacionTipo;
  afectaprecio: boolean;
  aplicaitbis: boolean;
  cuenta_contable: string;
  activo: boolean;
  descripcion?: string;
  // Campos adicionales del servidor Odoo
  amount_type?: string;       // 'percent' | 'fixed' | 'group'
  type_tax_use?: string;      // 'sale' | 'purchase' | 'all'
  is_retention?: boolean;
}

export interface CalcPreview {
  base: number;
  itbis: number;
  impuesto: number;
  total: number;
  desglose: Array<{ id: number; name: string; amount: number }>;
}

export interface ImpuestosStats {
  total: number;
  activos: number;
  retenciones: number;
  exentos: number;
}

export interface FormData {
  nombre: string;
  codigo: string;
  tipo: TipoImpuesto;
  tasa: number;
  aplicacion: AplicacionTipo;
  afectaprecio: boolean;
  aplicaitbis: boolean;
  cuenta_contable: string;
  descripcion: string;
  activo: boolean;
}

// ─── Odoo → Impuesto mapper ───────────────────────────────────────────────────

/** Mapea un registro de account.tax (Odoo) al tipo Impuesto del frontend. */
function odooTaxToImpuesto(tax: {
  id: number;
  name: string;
  description?: string;
  amount: number;
  amount_type: string;
  price_include: boolean;
  type_tax_use: string;
  active: boolean;
  account?: string;
  is_retention?: boolean;
}): Impuesto {
  const name = tax.name || "";
  const nameLower = name.toLowerCase();

  // ── Inferir tipo de impuesto dominicano ──
  let tipo: TipoImpuesto = "otro";
  if (nameLower.includes("itbis")) tipo = "itbis";
  else if (nameLower.includes("isr")) tipo = "isr";
  else if (nameLower.includes("isc") || nameLower.includes("selectivo")) tipo = "isc";
  else if (tax.is_retention || nameLower.includes("retenci") || nameLower.includes("ret.")) tipo = "retencion";
  else if (nameLower.includes("exento") || tax.amount === 0) tipo = "exento";
  else if (nameLower.includes("decor")) tipo = "decoracion";

  // ── Inferir aplicación ──
  let aplicacion: AplicacionTipo = "ambos";
  if (tax.type_tax_use === "sale") aplicacion = "ambos";
  else if (tax.type_tax_use === "purchase") aplicacion = "producto";
  else if (tax.type_tax_use === "all") aplicacion = "ambos";

  // ── Código legible ──
  const codigo =
    name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9%-]/g, "")
      .toUpperCase()
      .slice(0, 20) || `TAX-${tax.id}`;

  return {
    id: String(tax.id),
    codigo,
    nombre: name,
    tipo,
    tasa: tax.amount ?? 0,
    aplicacion,
    afectaprecio: tax.price_include,
    aplicaitbis: false,
    cuenta_contable: tax.account || "",
    activo: tax.active,
    descripcion: tax.description || name,
    amount_type: tax.amount_type,
    type_tax_use: tax.type_tax_use,
    is_retention: tax.is_retention,
  };
}

// ─── calcularImpuesto (local, sin Odoo) ──────────────────────────────────────

export function calcularImpuesto(
  base: number,
  tasa: number,
  aplicaItbis: boolean
): CalcPreview {
  const itbis = aplicaItbis ? +(base * 0.18).toFixed(2) : 0;
  const impuesto = +(base * (tasa / 100)).toFixed(2);
  return {
    base,
    itbis,
    impuesto,
    total: +(base + itbis + impuesto).toFixed(2),
    desglose: [],
  };
}

// ─── Valores por defecto del formulario ──────────────────────────────────────

const EMPTY_FORM: FormData = {
  nombre: "",
  codigo: "",
  tipo: "itbis",
  tasa: 18,
  aplicacion: "ambos",
  afectaprecio: false,
  aplicaitbis: false,
  cuenta_contable: "",
  descripcion: "",
  activo: true,
};

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useImpuestos(companyId?: number) {
  // ── Estado de datos ──
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Filtros y ordenamiento ──
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroAlcance, setFiltroAlcance] = useState("Todos");
  const [vistaMode, setVistaMode] = useState<"tabla" | "tarjetas">("tabla");
  const [ordenCampo, setOrdenCampo] = useState<keyof Impuesto>("nombre");
  const [ordenDir, setOrdenDir] = useState<"asc" | "desc">("asc");

  // ── Modal CRUD ──
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Impuesto | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // ── Calculadora ──
  const [calcBase, setCalcBase] = useState(0);
  const [calcSelected, setCalcSelected] = useState<string[]>([]);
  const [calcPreviewState, setCalcPreviewState] = useState<CalcPreview>({
    base: 0, itbis: 0, impuesto: 0, total: 0, desglose: [],
  });

  // ── Toast ──
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

  // ─── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: "success" | "error" | "info" = "info") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }, []);

  // ─── Fetch desde Odoo ──────────────────────────────────────────────────────
  const fetchImpuestos = useCallback(async () => {
    setLoading(true);
    try {
      const qs = companyId ? `?company_id=${companyId}` : "";
      const res = await odooGet<{ ok: boolean; data: unknown[]; error?: string }>(
        `/api/taxes${qs}`
      );

      if (!res.ok) {
        throw new Error(res.error || "Error obteniendo impuestos");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = (res.data as any[]).map(odooTaxToImpuesto);
      setImpuestos(mapped);
    } catch (err) {
      console.error("fetchImpuestos:", err);
      showToast("Error al cargar impuestos desde Odoo", "error");
    } finally {
      setLoading(false);
    }
  }, [companyId, showToast]);

  // Cargar al montar
  useEffect(() => {
    fetchImpuestos();
  }, [fetchImpuestos]);

  // ─── Calcular con Odoo (compute_all) ──────────────────────────────────────
  const computeOdoo = useCallback(async (
    base: number,
    taxIds: string[],
  ): Promise<CalcPreview> => {
    if (!base || taxIds.length === 0) {
      return { base, itbis: 0, impuesto: 0, total: base, desglose: [] };
    }
    try {
      const res = await odooPost<{
        ok: boolean;
        base: number;
        total: number;
        total_excluded: number;
        total_included: number;
        taxes: Array<{ id: number; name: string; amount: number }>;
        error?: string;
      }>("/api/taxes/compute", {
        tax_ids: taxIds.map(Number),
        base,
        company_id: companyId,
      });

      if (!res.ok) throw new Error(res.error);

      const totalImpuestos = res.total_included - res.total_excluded;
      const itbisEntry = res.taxes.find(t =>
        t.name.toLowerCase().includes("itbis")
      );
      const itbis = itbisEntry?.amount ?? 0;
      const otrosImpuestos = totalImpuestos - itbis;

      return {
        base: res.total_excluded,
        itbis: +itbis.toFixed(2),
        impuesto: +otrosImpuestos.toFixed(2),
        total: res.total_included,
        desglose: res.taxes,
      };
    } catch (err) {
      console.error("computeOdoo:", err);
      // Fallback local
      return calcularImpuesto(base, 18, true);
    }
  }, [companyId]);

  // Recalcular preview cuando cambian base o selección
  useEffect(() => {
    let cancelled = false;
    computeOdoo(calcBase, calcSelected).then(preview => {
      if (!cancelled) setCalcPreviewState(preview);
    });
    return () => { cancelled = true; };
  }, [calcBase, calcSelected, computeOdoo]);

  // ─── Filtrado y ordenamiento ───────────────────────────────────────────────
  const impuestosFiltrados = useMemo(() => {
    let result = [...impuestos];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.nombre.toLowerCase().includes(q) ||
        i.codigo.toLowerCase().includes(q) ||
        (i.descripcion || "").toLowerCase().includes(q)
      );
    }

    if (filtroTipo !== "Todos") {
      result = result.filter(i => i.tipo === filtroTipo);
    }

    if (filtroAlcance !== "Todos") {
      result = result.filter(i => i.aplicacion === filtroAlcance);
    }

    result.sort((a, b) => {
      const va = a[ordenCampo] ?? "";
      const vb = b[ordenCampo] ?? "";
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return ordenDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [impuestos, search, filtroTipo, filtroAlcance, ordenCampo, ordenDir]);

  const toggleOrden = useCallback((campo: keyof Impuesto) => {
    setOrdenCampo(prev => {
      if (prev === campo) {
        setOrdenDir(d => d === "asc" ? "desc" : "asc");
        return campo;
      }
      setOrdenDir("asc");
      return campo;
    });
  }, []);

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats: ImpuestosStats = useMemo(() => ({
    total: impuestos.length,
    activos: impuestos.filter(i => i.activo).length,
    retenciones: impuestos.filter(i => i.tipo === "retencion").length,
    exentos: impuestos.filter(i => i.tipo === "exento").length,
  }), [impuestos]);

  // ─── Modal helpers ─────────────────────────────────────────────────────────
  const abrirCrear = useCallback(() => {
    setEditando(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  }, []);

  const abrirEditar = useCallback((id: string) => {
    const imp = impuestos.find(i => i.id === id);
    if (!imp) return;
    setEditando(imp);
    setFormData({
      nombre: imp.nombre,
      codigo: imp.codigo,
      tipo: imp.tipo,
      tasa: imp.tasa,
      aplicacion: imp.aplicacion,
      afectaprecio: imp.afectaprecio,
      aplicaitbis: imp.aplicaitbis,
      cuenta_contable: imp.cuenta_contable,
      descripcion: imp.descripcion || "",
      activo: imp.activo,
    });
    setModalOpen(true);
  }, [impuestos]);

  const cerrarModal = useCallback(() => {
    setModalOpen(false);
    setEditando(null);
    setFormData(EMPTY_FORM);
  }, []);

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const guardar = useCallback(async () => {
    if (!formData.nombre.trim()) {
      showToast("El nombre es requerido", "error");
      return;
    }
    setSaving(true);

    // Mapear tipo → amount_type Odoo
    const amountTypeMap: Record<TipoImpuesto, string> = {
      itbis: "percent", isr: "percent", isc: "percent",
      retencion: "percent", exento: "percent",
      selectivo: "percent", decoracion: "percent", otro: "percent",
    };

    // Mapear aplicacion → type_tax_use Odoo
    const taxUseMap: Record<AplicacionTipo, string> = {
      producto: "purchase",
      servicio: "sale",
      ambos: "all",
    };

    const payload = {
      name: formData.nombre,
      description: formData.descripcion || formData.nombre,
      amount: formData.tasa,
      amount_type: amountTypeMap[formData.tipo],
      price_include: formData.afectaprecio,
      type_tax_use: taxUseMap[formData.aplicacion],
      active: formData.activo,
      company_id: companyId,
    };

    try {
      if (editando) {
        // ── UPDATE ──
        const res = await fetch(`${ODOO_URL}/api/taxes/${editando.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);

        setImpuestos(prev =>
          prev.map(i => i.id === editando.id ? odooTaxToImpuesto(data.data) : i)
        );
        showToast("Impuesto actualizado correctamente", "success");
      } else {
        // ── CREATE ──
        const res = await fetch(`${ODOO_URL}/api/taxes/create`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);

        setImpuestos(prev => [odooTaxToImpuesto(data.data), ...prev]);
        showToast("Impuesto creado correctamente", "success");
      }
      cerrarModal();
    } catch (err) {
      console.error("guardar:", err);
      showToast(`Error al guardar: ${err instanceof Error ? err.message : "desconocido"}`, "error");
    } finally {
      setSaving(false);
    }
  }, [formData, editando, companyId, cerrarModal, showToast]);

  const eliminar = useCallback(async (id: string) => {
    if (!confirm("¿Archivar este impuesto en Odoo?")) return;
    try {
      const res = await fetch(`${ODOO_URL}/api/taxes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      // El backend lo marca como inactive → lo eliminamos de la lista local
      setImpuestos(prev => prev.filter(i => i.id !== id));
      showToast("Impuesto archivado", "success");
    } catch (err) {
      console.error("eliminar:", err);
      showToast("Error al archivar el impuesto", "error");
    }
  }, [showToast]);

  const toggleActivo = useCallback(async (id: string) => {
    const imp = impuestos.find(i => i.id === id);
    if (!imp) return;
    try {
      const res = await fetch(`${ODOO_URL}/api/taxes/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !imp.activo }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      setImpuestos(prev =>
        prev.map(i => i.id === id ? { ...i, activo: !i.activo } : i)
      );
      showToast(
        `Impuesto ${!imp.activo ? "activado" : "desactivado"}`,
        "success"
      );
    } catch (err) {
      console.error("toggleActivo:", err);
      showToast("Error al cambiar estado", "error");
    }
  }, [impuestos, showToast]);

  // ─── Return ───────────────────────────────────────────────────────────────
  return {
    // Datos
    impuestos,
    impuestosFiltrados,
    stats,
    loading,

    // Filtros
    search, setSearch,
    filtroTipo, setFiltroTipo,
    filtroAlcance, setFiltroAlcance,
    vistaMode, setVistaMode,
    ordenCampo, ordenDir, toggleOrden,

    // Modal
    modalOpen, editando, formData, setFormData, saving,
    abrirCrear, abrirEditar, cerrarModal, guardar, eliminar, toggleActivo,

    // Calculadora
    calcBase, setCalcBase,
    calcSelected, setCalcSelected,
    calcPreview: calcPreviewState,

    // Toast
    toastVisible, toastMsg, toastType,
    showToast,
    fetchImpuestos,
  };
}