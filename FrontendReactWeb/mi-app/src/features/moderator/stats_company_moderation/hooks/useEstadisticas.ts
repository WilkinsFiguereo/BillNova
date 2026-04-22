"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { averageCompanyRating, buildCompanyAnalytics, buildProductAnalytics } from "../../data/moderatorAnalytics";
import {
  apiListModeratorCompanies,
  apiListModeratorPosOrders,
  apiListModeratorProducts,
  apiListProductReviewStats,
} from "../../data/moderatorApi";
import { Empresa, EstadisticasGlobales, FiltrosEmpresas } from "../types/estadisticas.types";

interface UseEstadisticasReturn {
  empresas: Empresa[];
  empresaSeleccionada: Empresa | null;
  filtros: FiltrosEmpresas;
  globales: EstadisticasGlobales;
  modalAbierto: boolean;
  setFiltros: (f: Partial<FiltrosEmpresas>) => void;
  seleccionarEmpresa: (e: Empresa) => void;
  cerrarModal: () => void;
  top3: Empresa[];
}

const filtrosIniciales: FiltrosEmpresas = {
  busqueda: "",
  categoria: "todos",
  estado: "todos",
  ordenarPor: "ventas",
  periodo: "30d",
};

export function useEstadisticas(): UseEstadisticasReturn {
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null);
  const [filtros, setFiltrosState] = useState<FiltrosEmpresas>(filtrosIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [empresasData, setEmpresasData] = useState<Empresa[]>([]);
  const [globalesData, setGlobalesData] = useState<EstadisticasGlobales>({
    totalEmpresas: 0,
    empresasActivas: 0,
    totalVentas: 0,
    totalIngresos: 0,
    promedioCalificacion: null,
    crecimientoGeneral: null,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      const [companies, products, orders] = await Promise.all([
        apiListModeratorCompanies(),
        apiListModeratorProducts(),
        apiListModeratorPosOrders(),
      ]);
      const reviewStats = await apiListProductReviewStats(
        products.filter((product) => product.itemType === "product").map((product) => product.sourceId),
      );

      if (!mounted) return;

      const productRows = buildProductAnalytics(products, orders, reviewStats, filtros.periodo);
      const companyAnalytics = buildCompanyAnalytics(companies, productRows);

      const rows: Empresa[] = companies.map((company) => {
        const metrics = companyAnalytics.get(company.id);
        const rating = averageCompanyRating(company.id, productRows);
        const topProducts = productRows
          .filter((row) => row.product.companyId === company.id)
          .sort((a, b) => b.analytics.revenue - a.analytics.revenue)
          .slice(0, 5)
          .map((row) => ({
            id: row.product.id,
            nombre: row.product.name,
            unidades: row.analytics.unitsSold,
            ingresos: row.analytics.revenue,
          }));

        return {
          id: company.id,
          nombre: company.name,
          iniciales: company.name.slice(0, 2).toUpperCase(),
          colorAvatar: company.avatarColor,
          categoria: "otro",
          estado: company.status === "approved" ? "activa" : company.status === "rejected" ? "suspendida" : "inactiva",
          totalVentas: metrics?.unitsSold ?? 0,
          totalIngresos: metrics?.revenue ?? 0,
          totalProductos: metrics?.productsCount ?? 0,
          calificacion: rating.averageRating,
          totalResenas: rating.totalReviews,
          clientesUnicos: null,
          tasaDevolucion: null,
          crecimiento: metrics?.growthPercent ?? null,
          ventasMensuales: metrics?.monthlySales ?? [],
          productosTop: topProducts,
          fechaRegistro: company.registeredAt,
        };
      });

      const rated = rows.filter((row) => row.calificacion !== null);
      const growthValues = rows.map((row) => row.crecimiento).filter((value): value is number => value !== null);

      setEmpresasData(rows);
      setGlobalesData({
        totalEmpresas: rows.length,
        empresasActivas: rows.filter((row) => row.estado === "activa").length,
        totalVentas: rows.reduce((acc, row) => acc + row.totalVentas, 0),
        totalIngresos: rows.reduce((acc, row) => acc + row.totalIngresos, 0),
        promedioCalificacion:
          rated.length > 0
            ? Number((rated.reduce((acc, row) => acc + (row.calificacion ?? 0), 0) / rated.length).toFixed(1))
            : null,
        crecimientoGeneral:
          growthValues.length > 0
            ? Number((growthValues.reduce((acc, value) => acc + value, 0) / growthValues.length).toFixed(1))
            : null,
      });
    })();

    return () => {
      mounted = false;
    };
  }, [filtros.periodo]);

  const empresasFiltradas = useMemo(() => {
    const q = filtros.busqueda.toLowerCase();
    const list = empresasData.filter((empresa) => {
      const matchQuery = !q || empresa.nombre.toLowerCase().includes(q);
      const matchCategory = filtros.categoria === "todos" || empresa.categoria === filtros.categoria;
      const matchStatus = filtros.estado === "todos" || empresa.estado === filtros.estado;
      return matchQuery && matchCategory && matchStatus;
    });

    return [...list].sort((a, b) => {
      switch (filtros.ordenarPor) {
        case "ventas":
          return b.totalVentas - a.totalVentas;
        case "ingresos":
          return b.totalIngresos - a.totalIngresos;
        case "calificacion":
          return (b.calificacion ?? -1) - (a.calificacion ?? -1);
        case "crecimiento":
          return (b.crecimiento ?? -Infinity) - (a.crecimiento ?? -Infinity);
        case "clientes":
          return (b.clientesUnicos ?? -1) - (a.clientesUnicos ?? -1);
        default:
          return 0;
      }
    });
  }, [filtros, empresasData]);

  const top3 = useMemo(() => [...empresasData].sort((a, b) => b.totalVentas - a.totalVentas).slice(0, 3), [empresasData]);

  const setFiltros = useCallback((f: Partial<FiltrosEmpresas>) => {
    setFiltrosState((prev) => ({ ...prev, ...f }));
  }, []);

  const seleccionarEmpresa = useCallback((empresa: Empresa) => {
    setEmpresaSeleccionada(empresa);
    setModalAbierto(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setModalAbierto(false);
    setEmpresaSeleccionada(null);
  }, []);

  return {
    empresas: empresasFiltradas,
    empresaSeleccionada,
    filtros,
    globales: globalesData,
    modalAbierto,
    setFiltros,
    seleccionarEmpresa,
    cerrarModal,
    top3,
  };
}
