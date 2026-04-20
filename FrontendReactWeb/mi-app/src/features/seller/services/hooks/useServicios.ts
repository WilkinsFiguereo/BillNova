"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OrdenCampo, OrdenDir, Servicio, VistaMode } from "../types/servicios.types";
import * as serviciosApi from "../data/serviciosApi";

interface UseServiciosReturn {
  servicios: Servicio[];
  loading: boolean;
  error: string | null;
  search: string;
  frecuenciaActiva: string;
  vistaMode: VistaMode;
  ordenCampo: OrdenCampo;
  ordenDir: OrdenDir;
  toastVisible: boolean;
  toastMsg: string;

  serviciosFiltrados: Servicio[];

  setSearch: (v: string) => void;
  setFrecuenciaActiva: (v: string) => void;
  setVistaMode: (v: VistaMode) => void;
  toggleOrden: (campo: OrdenCampo) => void;
  showToast: (msg: string) => void;

  refreshServicios: () => Promise<void>;
  crearServicio: (s: Partial<Servicio>) => Promise<void>;
  actualizarServicio: (id: string, s: Partial<Servicio>) => Promise<void>;
  eliminarServicio: (id: string) => Promise<void>;
}

export function useServicios(): UseServiciosReturn {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [frecuenciaActiva, setFrecuenciaActiva] = useState("Todas");
  const [vistaMode, setVistaMode] = useState<VistaMode>("tabla");
  const [ordenCampo, setOrdenCampo] = useState<OrdenCampo>("nombre");
  const [ordenDir, setOrdenDir] = useState<OrdenDir>("asc");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);

  const toggleOrden = useCallback(
    (campo: OrdenCampo) => {
      if (ordenCampo === campo) {
        setOrdenDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setOrdenCampo(campo);
        setOrdenDir("asc");
      }
    },
    [ordenCampo],
  );

  const refreshServicios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviciosApi.apiListServicios();
      setServicios(data);
    } catch (e: any) {
      const msg = e?.message ?? "Error al cargar servicios";
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void refreshServicios();
  }, [refreshServicios]);

  const crearServicio = useCallback(
    async (s: Partial<Servicio>) => {
      try {
        await serviciosApi.apiCreateServicio(s);
        showToast("Servicio creado");
        await refreshServicios();
      } catch (e: any) {
        showToast(e?.message ?? "Error al crear servicio");
      }
    },
    [refreshServicios, showToast],
  );

  const actualizarServicio = useCallback(
    async (id: string, s: Partial<Servicio>) => {
      try {
        await serviciosApi.apiUpdateServicio(id, s);
        showToast("Servicio actualizado");
        await refreshServicios();
      } catch (e: any) {
        showToast(e?.message ?? "Error al actualizar servicio");
      }
    },
    [refreshServicios, showToast],
  );

  const eliminarServicio = useCallback(
    async (id: string) => {
      try {
        await serviciosApi.apiDeleteServicio(id);
        showToast("Servicio eliminado");
        await refreshServicios();
      } catch (e: any) {
        showToast(e?.message ?? "Error al eliminar servicio");
      }
    },
    [refreshServicios, showToast],
  );

  const serviciosFiltrados = useMemo(() => {
    let lista = [...servicios];

    if (search) {
      const q = search.toLowerCase();
      lista = lista.filter(
        (s) => s.nombre.toLowerCase().includes(q) || s.descripcion.toLowerCase().includes(q),
      );
    }

    if (frecuenciaActiva !== "Todas") {
      lista = lista.filter((s) => s.pagoFrecuencia === frecuenciaActiva);
    }

    lista.sort((a, b) => {
      let valA: string | number = a[ordenCampo];
      let valB: string | number = b[ordenCampo];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return ordenDir === "asc" ? -1 : 1;
      if (valA > valB) return ordenDir === "asc" ? 1 : -1;
      return 0;
    });

    return lista;
  }, [servicios, search, frecuenciaActiva, ordenCampo, ordenDir]);

  return {
    servicios,
    loading,
    error,
    search,
    frecuenciaActiva,
    vistaMode,
    ordenCampo,
    ordenDir,
    toastVisible,
    toastMsg,
    serviciosFiltrados,
    setSearch,
    setFrecuenciaActiva,
    setVistaMode,
    toggleOrden,
    showToast,
    refreshServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
  };
}

