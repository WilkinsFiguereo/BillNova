"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { odooGet, odooPut } from "@/lib/odooApi";
import { mockProductosPendientes } from "../data/mockProducts";
import type {
  ProductoPendiente,
  ProductoStatus,
  FiltroStatus,
  AccionModeration,
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
  aprobar: (id: string) => void;
  abrirModalRechazar: (p: ProductoPendiente) => void;
  cerrarModalRechazar: () => void;
  confirmarRechazo: () => void;
}

type ListEnvelope = { data: ProductoPendiente[] };
type OneEnvelope = { data: ProductoPendiente };

type UseModerationOptions = {
  useMock?: boolean;
};

let mockStore: ProductoPendiente[] | null = null;

function getMockStore() {
  if (!mockStore) mockStore = [...mockProductosPendientes];
  return mockStore;
}

export function useModeration(options: UseModerationOptions = {}): UseModerationReturn {
  const useMock = options.useMock === true;
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

  const load = useCallback(async () => {
    try {
      if (useMock) {
        setProductos(getMockStore());
        return;
      }
      const res = await odooGet<ListEnvelope>("/api/moderation/products");
      setProductos(res?.data ?? []);
    } catch (err) {
      setProductos([]);
      showToast(err instanceof Error ? err.message : "No se pudieron cargar los productos", "error");
    }
  }, [showToast, useMock]);

  useEffect(() => {
    const loadData = async () => {
      await load();
    };
    void loadData();
  }, [load]);

  const cambiarStatus = useCallback(
    async (accion: AccionModeration) => {
      if (useMock) {
        const store = getMockStore();
        const existing = store.find((p) => p.id === accion.productoId);
        if (!existing) {
          showToast("Producto no encontrado", "error");
          return;
        }

        const updated: ProductoPendiente = {
          ...existing,
          status: accion.status,
          motivoRechazo: accion.status === "rejected" ? accion.motivo : undefined,
        };

        mockStore = store.map((p) => (p.id === updated.id ? updated : p));
        setProductos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setProductoDetalle((prev) => (prev?.id === updated.id ? updated : prev));
        return;
      }

      const idNum = Number(accion.productoId);
      if (!Number.isFinite(idNum)) {
        showToast("ID de producto invalido", "error");
        return;
      }

      try {
        const res = await odooPut<OneEnvelope>(`/api/moderation/products/${idNum}`, {
          status: accion.status,
          motivoRechazo: accion.motivo,
        });

        const updated = res.data;
        setProductos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setProductoDetalle((prev) => (prev?.id === updated.id ? updated : prev));
      } catch (err) {
        showToast(err instanceof Error ? err.message : "No se pudo actualizar el producto", "error");
      }
    },
    [showToast, useMock],
  );

  const aprobar = useCallback(
    (id: string) => {
      void cambiarStatus({ productoId: id, status: "approved" });
      showToast("Producto aprobado y publicado correctamente", "success");
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

  const confirmarRechazo = useCallback(() => {
    if (!productoARechazar) return;
    void cambiarStatus({
      productoId: productoARechazar.id,
      status: "rejected",
      motivo: motivoRechazo || "Sin motivo especificado",
    });
    cerrarModalRechazar();
    showToast("Producto rechazado. El vendedor sera notificado.", "error");
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
