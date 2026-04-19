"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Reporte,
  EstadoReporte,
  FiltrosReporte,
  EstadisticasReportes,
  HistorialCambio,
} from '../types/reportes.types';
import { apiListModeratorReports, apiUpdateModeratorReport } from '../../data/moderatorApi';

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
  cambiarEstado: (reporteId: string, nuevoEstado: EstadoReporte, nota: string) => void;
  guardarNota: (reporteId: string, nota: string) => void;
}

const filtrosIniciales: FiltrosReporte = {
  busqueda: '',
  estado: 'todos',
  categoria: 'todos',
  prioridad: 'todos',
};

export function useReportes(): UseReportesReturn {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  const [filtros, setFiltrosState] = useState<FiltrosReporte>(filtrosIniciales);
  const [isLoading, setIsLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await apiListModeratorReports();
        if (mounted) setReportes(rows as Reporte[]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const estadisticas = useMemo<EstadisticasReportes>(() => {
    return {
      total: reportes.length,
      pendientes: reportes.filter((r) => r.estado === 'pendiente').length,
      enProceso: reportes.filter((r) => r.estado === 'en_proceso').length,
      solucionados: reportes.filter((r) => r.estado === 'solucionado').length,
      rechazados: reportes.filter((r) => r.estado === 'rechazado').length,
    };
  }, [reportes]);

  const reportesFiltrados = useMemo(() => {
    return reportes.filter((reporte) => {
      const matchBusqueda =
        !filtros.busqueda ||
        reporte.codigo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        reporte.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        reporte.usuario.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase());

      const matchEstado =
        filtros.estado === 'todos' || reporte.estado === filtros.estado;

      const matchCategoria =
        filtros.categoria === 'todos' || reporte.categoria === filtros.categoria;

      const matchPrioridad =
        filtros.prioridad === 'todos' || reporte.prioridad === filtros.prioridad;

      return matchBusqueda && matchEstado && matchCategoria && matchPrioridad;
    });
  }, [reportes, filtros]);

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

  const cambiarEstado = useCallback(
    (reporteId: string, nuevoEstado: EstadoReporte, nota: string) => {
      (async () => {
        const updated = await apiUpdateModeratorReport(reporteId, { estado: nuevoEstado, nota });
        setReportes((prev) => prev.map((r) => (r.id === reporteId ? updated as unknown as Reporte : r)));
        setReporteSeleccionado((prev) => (prev?.id === reporteId ? updated as unknown as Reporte : prev));
      })();
    },
    []
  );

  const guardarNota = useCallback((reporteId: string, nota: string) => {
    (async () => {
      const updated = await apiUpdateModeratorReport(reporteId, { notasModerador: nota });
      setReportes((prev) => prev.map((r) => (r.id === reporteId ? updated as unknown as Reporte : r)));
      setReporteSeleccionado((prev) => (prev?.id === reporteId ? updated as unknown as Reporte : prev));
    })();
  }, []);

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
