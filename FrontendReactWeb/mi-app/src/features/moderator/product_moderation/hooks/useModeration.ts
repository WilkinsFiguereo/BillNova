"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ODOO_URL } from "@/lib/odooApi";
import {
  AccionModeration,
  FiltroStatus,
  ProductoPendiente,
  ProductoStatus,
} from "../types/moderation.types";

interface UseModerationReturn {
  productos: ProductoPendiente[];
  search: string;
  filtroActivo: FiltroStatus;
  productoDetalle: ProductoPendiente | null;
  modalRechazarVisible: boolean;
  productoARechazar: ProductoPendiente | null;
  motivoRechazo: string;
  toastVisible: boolean;
  toastMsg: string;
  toastTipo: "success" | "error";
  productosFiltrados: ProductoPendiente[];
  contadores: Record<ProductoStatus | "todos", number>;
  setSearch: (v: string) => void;
  setFiltroActivo: (v: FiltroStatus) => void;
  setMotivoRechazo: (v: string) => void;
  verDetalle: (p: ProductoPendiente | null) => void;
  aprobar: (id: string) => Promise<void>;
  abrirModalRechazar: (p: ProductoPendiente) => void;
  cerrarModalRechazar: () => void;
  confirmarRechazo: () => Promise<void>;
}

type ProductApi = {
  id: number;
  name: string;
  default_code?: string | null;
  category_name?: string | null;
  list_price?: number;
  standard_price?: number;
  qty_available?: number;
  description?: string;
  company_name?: string | null;
  company_email?: string | null;
  moderation_status?: ProductoStatus;
  rejection_reason?: string;
  created_at?: string | null;
};

async function fetchProducts(): Promise<ProductoPendiente[]> {
  const response = await fetch(`${ODOO_URL}/api/products`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as { data?: ProductApi[] };
  const products = payload.data || [];

  return products.map((product, index) => ({
    id: String(product.id),
    nombre: product.name,
    sku: product.default_code || `SKU-${product.id}`,
    categoria: product.category_name || "Sin categoria",
    precio: Number(product.list_price || 0),
    costo: Number(product.standard_price || 0),
    stock: Number(product.qty_available || 0),
    descripcion: product.description || "Sin descripcion disponible.",
    vendedor: product.company_name || "Sin empresa",
    vendedorEmail: product.company_email || "Sin correo",
    fechaSubida: product.created_at
      ? new Date(product.created_at).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" })
      : "Sin fecha",
    imagenColor: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"][index % 6],
    status: product.moderation_status || "pending",
    motivoRechazo: product.rejection_reason || undefined,
  }));
}

async function updateProductAction(accion: AccionModeration) {
  const response = await fetch(`${ODOO_URL}/api/products/${accion.productoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      moderation_status: accion.status,
      rejection_reason: accion.motivo || "",
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export function useModeration(): UseModerationReturn {
  const [productos, setProductos] = useState<ProductoPendiente[]>([]);
  const [search, setSearch] = useState("");
  const [filtroActivo, setFiltroActivo] = useState<FiltroStatus>("todos");
  const [productoDetalle, setProductoDetalle] = useState<ProductoPendiente | null>(null);
  const [modalRechazarVisible, setModalRechazarVisible] = useState(false);
  const [productoARechazar, setProductoARechazar] = useState<ProductoPendiente | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastTipo, setToastTipo] = useState<"success" | "error">("success");

  useEffect(() => {
    fetchProducts()
      .then(setProductos)
      .catch((error) => {
        setToastMsg(error instanceof Error ? error.message : "No se pudieron cargar los productos.");
        setToastTipo("error");
        setToastVisible(true);
      });
  }, []);

  const showToast = useCallback((msg: string, tipo: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastTipo(tipo);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }, []);

  const cambiarStatus = useCallback((accion: AccionModeration) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === accion.productoId
          ? { ...p, status: accion.status, motivoRechazo: accion.motivo }
          : p,
      ),
    );
  }, []);

  const aprobar = useCallback(
    async (id: string) => {
      try {
        await updateProductAction({ productoId: id, status: "approved" });
        cambiarStatus({ productoId: id, status: "approved" });
        setProductoDetalle((prev) => (prev?.id === id ? { ...prev, status: "approved" } : prev));
        showToast("Producto aprobado correctamente.", "success");
      } catch (error) {
        showToast(error instanceof Error ? error.message : "No se pudo aprobar el producto.", "error");
      }
    },
    [cambiarStatus, showToast],
  );

  const abrirModalRechazar = useCallback((p: ProductoPendiente) => {
    setProductoARechazar(p);
    setMotivoRechazo("");
    setModalRechazarVisible(true);
  }, []);

  const cerrarModalRechazar = useCallback(() => {
    setModalRechazarVisible(false);
    setProductoARechazar(null);
    setMotivoRechazo("");
  }, []);

  const confirmarRechazo = useCallback(async () => {
    if (!productoARechazar) return;

    const motivo = motivoRechazo || "Sin motivo especificado";
    try {
      await updateProductAction({
        productoId: productoARechazar.id,
        status: "rejected",
        motivo,
      });

      cambiarStatus({
        productoId: productoARechazar.id,
        status: "rejected",
        motivo,
      });

      setProductoDetalle((prev) =>
        prev?.id === productoARechazar.id
          ? { ...prev, status: "rejected", motivoRechazo: motivo }
          : prev,
      );
      cerrarModalRechazar();
      showToast("Producto rechazado correctamente.", "error");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "No se pudo rechazar el producto.", "error");
    }
  }, [productoARechazar, motivoRechazo, cambiarStatus, cerrarModalRechazar, showToast]);

  const contadores = useMemo(
    () => ({
      todos: productos.length,
      pending: productos.filter((p) => p.status === "pending").length,
      approved: productos.filter((p) => p.status === "approved").length,
      rejected: productos.filter((p) => p.status === "rejected").length,
    }),
    [productos],
  );

  const productosFiltrados = useMemo(() => {
    let lista = [...productos];
    if (filtroActivo !== "todos") {
      lista = lista.filter((p) => p.status === filtroActivo);
    }
    if (search) {
      const q = search.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.vendedor.toLowerCase().includes(q),
      );
    }
    lista.sort((a, b) => {
      const orden: Record<ProductoStatus, number> = { pending: 0, approved: 1, rejected: 2 };
      return orden[a.status] - orden[b.status];
    });
    return lista;
  }, [productos, filtroActivo, search]);

  return {
    productos,
    search,
    filtroActivo,
    productoDetalle,
    modalRechazarVisible,
    productoARechazar,
    motivoRechazo,
    toastVisible,
    toastMsg,
    toastTipo,
    productosFiltrados,
    contadores,
    setSearch,
    setFiltroActivo,
    setMotivoRechazo,
    verDetalle: setProductoDetalle,
    aprobar,
    abrirModalRechazar,
    cerrarModalRechazar,
    confirmarRechazo,
  };
}
