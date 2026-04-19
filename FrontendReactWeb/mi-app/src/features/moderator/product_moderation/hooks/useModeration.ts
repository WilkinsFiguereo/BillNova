"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiListModeratorProducts, apiSetProductModerationStatus } from "../../data/moderatorApi";
import {
  AccionModeration,
  FiltroStatus,
  ProductoPendiente,
  ProductoStatus,
} from "../types/moderation.types";

function colorFromId(id: string): string {
  const colors = ["#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED", "#0F766E"];
  const num = Number(String(id).replace(/\D/g, "")) || 0;
  return colors[num % colors.length];
}

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
  aprobar: (id: string) => void;
  abrirModalRechazar: (p: ProductoPendiente) => void;
  cerrarModalRechazar: () => void;
  confirmarRechazo: () => void;
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

  const showToast = useCallback((msg: string, tipo: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastTipo(tipo);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await apiListModeratorProducts();
        if (!mounted) return;
        setProductos(
          rows.map((product) => ({
            id: product.id,
            nombre: product.name,
            sku: product.sku,
            categoria: product.categoryName || null,
            precio: product.price,
            costo: product.cost,
            stock: product.stock,
            descripcion: product.description,
            vendedor: product.companyName,
            vendedorEmail: product.companyEmail || null,
            fechaSubida: product.updatedAt,
            imagenColor: colorFromId(product.id),
            status: product.moderationStatus,
            motivoRechazo: product.moderationReason,
          })),
        );
      } catch {
        if (mounted) showToast("No se pudieron cargar productos para moderacion", "error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [showToast]);

  const cambiarStatus = useCallback((accion: AccionModeration) => {
    setProductos((prev) =>
      prev.map((product) =>
        product.id === accion.productoId
          ? { ...product, status: accion.status, motivoRechazo: accion.motivo }
          : product,
      ),
    );
  }, []);

  const aprobar = useCallback(
    (id: string) => {
      (async () => {
        try {
          await apiSetProductModerationStatus(id, "approved");
          cambiarStatus({ productoId: id, status: "approved" });
          setProductoDetalle((prev) => (prev?.id === id ? { ...prev, status: "approved" } : prev));
          showToast("Producto aprobado y publicado correctamente", "success");
        } catch {
          showToast("No se pudo aprobar el producto", "error");
        }
      })();
    },
    [cambiarStatus, showToast],
  );

  const abrirModalRechazar = useCallback((product: ProductoPendiente) => {
    setProductoARechazar(product);
    setMotivoRechazo("");
    setModalRechazarVisible(true);
  }, []);

  const cerrarModalRechazar = useCallback(() => {
    setModalRechazarVisible(false);
    setProductoARechazar(null);
    setMotivoRechazo("");
  }, []);

  const confirmarRechazo = useCallback(() => {
    if (!productoARechazar) return;
    (async () => {
      try {
        const reason = motivoRechazo || "Sin motivo especificado";
        await apiSetProductModerationStatus(productoARechazar.id, "rejected", reason);
        cambiarStatus({
          productoId: productoARechazar.id,
          status: "rejected",
          motivo: reason,
        });
        setProductoDetalle((prev) =>
          prev?.id === productoARechazar.id ? { ...prev, status: "rejected", motivoRechazo: reason } : prev,
        );
        cerrarModalRechazar();
        showToast("Producto rechazado.", "error");
      } catch {
        showToast("No se pudo rechazar el producto", "error");
      }
    })();
  }, [productoARechazar, motivoRechazo, cambiarStatus, cerrarModalRechazar, showToast]);

  const contadores = useMemo(
    () => ({
      todos: productos.length,
      pending: productos.filter((product) => product.status === "pending").length,
      approved: productos.filter((product) => product.status === "approved").length,
      rejected: productos.filter((product) => product.status === "rejected").length,
    }),
    [productos],
  );

  const productosFiltrados = useMemo(() => {
    let lista = [...productos];
    if (filtroActivo !== "todos") {
      lista = lista.filter((product) => product.status === filtroActivo);
    }
    if (search) {
      const q = search.toLowerCase();
      lista = lista.filter(
        (product) =>
          product.nombre.toLowerCase().includes(q) ||
          product.sku.toLowerCase().includes(q) ||
          product.vendedor.toLowerCase().includes(q),
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
