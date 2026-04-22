"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { buildProductAnalytics } from "../../data/moderatorAnalytics";
import {
  apiListModeratorPosOrders,
  apiListModeratorProducts,
  apiListProductReviewStats,
} from "../../data/moderatorApi";
import { EstadisticasGlobales, FiltrosProductos, Producto } from "../types/productos.types";

function colorFromId(id: string): string {
  const colors = ["#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED", "#0F766E"];
  const num = Number(String(id).replace(/\D/g, "")) || 0;
  return colors[num % colors.length];
}

function normalizeCategory(categoryName: string): Producto["categoria"] {
  const value = categoryName.trim().toLowerCase();
  if (!value) return "otro";
  if (value.includes("elect")) return "electronica";
  if (value.includes("tecn")) return "tecnologia";
  if (value.includes("mod")) return "moda";
  if (value.includes("hog")) return "hogar";
  if (value.includes("alim") || value.includes("food") || value.includes("beb")) return "alimentos";
  if (value.includes("deport")) return "deportes";
  if (value.includes("salud") || value.includes("farm")) return "salud";
  if (value.includes("bell") || value.includes("cosm")) return "belleza";
  return "otro";
}

interface UseProductosReturn {
  productos: Producto[];
  productoSeleccionado: Producto | null;
  filtros: FiltrosProductos;
  globales: EstadisticasGlobales;
  modalAbierto: boolean;
  top3: Producto[];
  setFiltros: (f: Partial<FiltrosProductos>) => void;
  seleccionarProducto: (p: Producto) => void;
  cerrarModal: () => void;
}

const filtrosIniciales: FiltrosProductos = {
  busqueda: "",
  categoria: "todos",
  estado: "todos",
  ordenarPor: "ventas",
  periodo: "30d",
};

export function useProductos(): UseProductosReturn {
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [filtros, setFiltrosState] = useState<FiltrosProductos>(filtrosIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productosData, setProductosData] = useState<Producto[]>([]);
  const [globalesData, setGlobalesData] = useState<EstadisticasGlobales>({
    totalProductos: 0,
    productosActivos: 0,
    totalVentas: 0,
    totalIngresos: 0,
    promedioCalificacion: null,
    totalVistas: null,
    crecimientoGeneral: null,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      const [products, orders] = await Promise.all([
        apiListModeratorProducts(),
        apiListModeratorPosOrders(),
      ]);
      const reviewStats = await apiListProductReviewStats(
        products.filter((product) => product.itemType === "product").map((product) => product.sourceId),
      );
      if (!mounted) return;

      const rows = buildProductAnalytics(products, orders, reviewStats, filtros.periodo);
      const mapped: Producto[] = rows.map(({ product, analytics, reviewStats: stats }) => ({
        id: product.id,
        nombre: product.name,
        empresa: product.companyName,
        empresaColor: colorFromId(product.companyId || product.id),
        categoria: normalizeCategory(product.categoryName),
        estado: product.moderationStatus === "rejected" ? "suspendido" : product.stock <= 0 ? "agotado" : "activo",
        precio: product.price,
        totalVentas: analytics.unitsSold,
        totalIngresos: analytics.revenue,
        totalVistas: null,
        calificacion: stats?.averageRating ?? null,
        totalResenas: stats?.totalReviews ?? 0,
        stock: product.stock,
        tasaConversion: null,
        tasaDevolucion: null,
        crecimiento: analytics.growthPercent,
        ventasMensuales: analytics.monthlySales,
        resenasDist: stats?.distribution ?? [],
        fechaLanzamiento: product.updatedAt,
      }));

      const totalReviews = mapped.reduce((acc, item) => acc + item.totalResenas, 0);
      const weightedRating = mapped.reduce((acc, item) => acc + ((item.calificacion ?? 0) * item.totalResenas), 0);
      const growthValues = mapped.map((item) => item.crecimiento).filter((value): value is number => value !== null);

      setProductosData(mapped);
      setGlobalesData({
        totalProductos: mapped.length,
        productosActivos: mapped.filter((item) => item.estado === "activo").length,
        totalVentas: mapped.reduce((acc, item) => acc + item.totalVentas, 0),
        totalIngresos: mapped.reduce((acc, item) => acc + item.totalIngresos, 0),
        promedioCalificacion: totalReviews > 0 ? Number((weightedRating / totalReviews).toFixed(1)) : null,
        totalVistas: null,
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

  const productosFiltrados = useMemo(() => {
    const q = filtros.busqueda.toLowerCase();
    const list = productosData.filter((product) => {
      const matchQuery = !q || product.nombre.toLowerCase().includes(q) || product.empresa.toLowerCase().includes(q);
      const matchCategory = filtros.categoria === "todos" || product.categoria === filtros.categoria;
      const matchStatus = filtros.estado === "todos" || product.estado === filtros.estado;
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
        case "vistas":
          return (b.totalVistas ?? -1) - (a.totalVistas ?? -1);
        case "devolucion":
          return (b.tasaDevolucion ?? -1) - (a.tasaDevolucion ?? -1);
        default:
          return 0;
      }
    });
  }, [filtros, productosData]);

  const top3 = useMemo(() => [...productosData].sort((a, b) => b.totalVentas - a.totalVentas).slice(0, 3), [productosData]);

  const setFiltros = useCallback((f: Partial<FiltrosProductos>) => {
    setFiltrosState((prev) => ({ ...prev, ...f }));
  }, []);

  const seleccionarProducto = useCallback((product: Producto) => {
    setProductoSeleccionado(product);
    setModalAbierto(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setModalAbierto(false);
    setProductoSeleccionado(null);
  }, []);

  return {
    productos: productosFiltrados,
    productoSeleccionado,
    filtros,
    globales: globalesData,
    modalAbierto,
    top3,
    setFiltros,
    seleccionarProducto,
    cerrarModal,
  };
}
