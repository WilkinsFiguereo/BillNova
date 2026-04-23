"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ODOO_URL } from "@/lib/odooApi";
import {
  EstadoReporte,
  EstadisticasReportes,
  FiltrosReporte,
  Reporte,
} from "../types/reportes.types";

interface UseReportesReturn {
  reportes: Reporte[];
  reporteSeleccionado: Reporte | null;
  filtros: FiltrosReporte;
  estadisticas: EstadisticasReportes;
  isLoading: boolean;
  modalAbierto: boolean;
  setFiltros: (filtros: Partial<FiltrosReporte>) => void;
  seleccionarReporte: (reporte: Reporte) => void;
  cerrarModal: () => void;
  cambiarEstado: (reporteId: string, nuevoEstado: EstadoReporte, nota: string) => Promise<void>;
  guardarNota: (reporteId: string, nota: string) => Promise<void>;
}

const filtrosIniciales: FiltrosReporte = {
  busqueda: "",
  estado: "todos",
  categoria: "todos",
  prioridad: "todos",
};

async function fetchReports(): Promise<Reporte[]> {
  const response = await fetch(`${ODOO_URL}/api/moderation/reports`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as { data?: Reporte[] };
  return payload.data || [];
}

async function updateReport(reportId: string, body: Partial<Reporte> & { estado?: EstadoReporte; nota?: string; notasModerador?: string }) {
  const response = await fetch(`${ODOO_URL}/api/moderation/reports/${reportId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as { data?: Reporte };
  return payload.data;
}

export function useReportes(): UseReportesReturn {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  const [filtros, setFiltrosState] = useState<FiltrosReporte>(filtrosIniciales);
  const [isLoading, setIsLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextReports = await fetchReports();
      setReportes(nextReports);
      setReporteSeleccionado((prev) =>
        prev ? nextReports.find((report) => report.id === prev.id) || null : null,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const estadisticas = useMemo<EstadisticasReportes>(
    () => ({
      total: reportes.length,
      pendientes: reportes.filter((r) => r.estado === "pendiente").length,
      enProceso: reportes.filter((r) => r.estado === "en_proceso").length,
      solucionados: reportes.filter((r) => r.estado === "solucionado").length,
      rechazados: reportes.filter((r) => r.estado === "rechazado").length,
    }),
    [reportes],
  );

  const reportesFiltrados = useMemo(
    () =>
      reportes.filter((reporte) => {
        const matchBusqueda =
          !filtros.busqueda ||
          reporte.codigo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
          reporte.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
          reporte.usuario.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase());

        const matchEstado = filtros.estado === "todos" || reporte.estado === filtros.estado;
        const matchCategoria = filtros.categoria === "todos" || reporte.categoria === filtros.categoria;
        const matchPrioridad = filtros.prioridad === "todos" || reporte.prioridad === filtros.prioridad;

        return matchBusqueda && matchEstado && matchCategoria && matchPrioridad;
      }),
    [reportes, filtros],
  );

  const setFiltros = useCallback((nuevosFiltros: Partial<FiltrosReporte>) => {
    setFiltrosState((prev) => ({ ...prev, ...nuevosFiltros }));
  }, []);

  const seleccionarReporte = useCallback((reporte: Reporte) => {
    setReporteSeleccionado(reporte);
    setModalAbierto(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setModalAbierto(false);
    setReporteSeleccionado(null);
  }, []);

  const applyUpdatedReport = useCallback((updatedReport?: Reporte | null) => {
    if (!updatedReport) return;
    setReportes((prev) => prev.map((item) => (item.id === updatedReport.id ? updatedReport : item)));
    setReporteSeleccionado((prev) => (prev?.id === updatedReport.id ? updatedReport : prev));
  }, []);

  const cambiarEstado = useCallback(
    async (reporteId: string, nuevoEstado: EstadoReporte, nota: string) => {
      const updated = await updateReport(reporteId, { estado: nuevoEstado, nota });
      applyUpdatedReport(updated);
    },
    [applyUpdatedReport],
  );

  const guardarNota = useCallback(
    async (reporteId: string, nota: string) => {
      const updated = await updateReport(reporteId, { notasModerador: nota });
      applyUpdatedReport(updated);
    },
    [applyUpdatedReport],
  );

  return {
    reportes: reportesFiltrados,
    reporteSeleccionado,
    filtros,
    estadisticas,
    isLoading,
    modalAbierto,
    setFiltros,
    seleccionarReporte,
    cerrarModal,
    cambiarEstado,
    guardarNota,
  };
}
