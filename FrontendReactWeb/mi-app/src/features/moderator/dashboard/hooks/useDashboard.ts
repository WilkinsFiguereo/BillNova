"use client";

import { useEffect, useState } from "react";
import { buildCompanyAnalytics, buildProductAnalytics } from "../../data/moderatorAnalytics";
import {
  apiListModeratorCompanies,
  apiListModeratorPosOrders,
  apiListModeratorProducts,
  apiListModeratorReports,
  apiListModeratorUsers,
  apiListProductReviewStats,
} from "../../data/moderatorApi";
import { DashboardData } from "../types/dashboard.types";

interface UseDashboardReturn {
  data: DashboardData;
  isLoading: boolean;
  periodo: "7d" | "30d" | "1y";
  setPeriodo: (p: "7d" | "30d" | "1y") => void;
  ahora: string;
}

export function useDashboard(): UseDashboardReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [periodo, setPeriodo] = useState<"7d" | "30d" | "1y">("7d");
  const [data, setData] = useState<DashboardData>({
    kpis: {
      totalEmpresas: 0,
      empresasActivas: 0,
      totalProductos: 0,
      totalVentas: 0,
      totalIngresos: 0,
      totalUsuarios: 0,
      usuariosNuevosMes: 0,
      totalReportes: 0,
      reportesPendientes: 0,
      reportesEnProceso: 0,
      reportesSolucionados: 0,
      crecimientoVentas: 0,
      crecimientoIngresos: 0,
      promedioCalificacion: null,
      totalVistas: null,
    },
    actividadReciente: [],
    reportesRecientes: [],
    empresasTop: [],
    productosTop: [],
    ventasSemana: [],
    ventasPorCategoria: [],
    alertas: [],
  });

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    (async () => {
      try {
        const [products, users, companies, reports, orders] = await Promise.all([
          apiListModeratorProducts(),
          apiListModeratorUsers(),
          apiListModeratorCompanies(),
          apiListModeratorReports(),
          apiListModeratorPosOrders(),
        ]);
        const reviewStats = await apiListProductReviewStats(products.map((product) => product.id));

        if (!mounted) return;

        const productRows = buildProductAnalytics(products, orders, reviewStats, periodo);
        const companyAnalytics = buildCompanyAnalytics(companies, productRows);

        const totalVentas = productRows.reduce((acc, row) => acc + row.analytics.unitsSold, 0);
        const totalIngresos = productRows.reduce((acc, row) => acc + row.analytics.revenue, 0);
        const reportesPendientes = reports.filter((report) => report.estado === "pendiente").length;
        const reportesEnProceso = reports.filter((report) => report.estado === "en_proceso").length;
        const reportesSolucionados = reports.filter((report) => report.estado === "solucionado").length;

        const totalReviews = productRows.reduce((acc, row) => acc + (row.reviewStats?.totalReviews ?? 0), 0);
        const weightedRating = productRows.reduce(
          (acc, row) => acc + ((row.reviewStats?.averageRating ?? 0) * (row.reviewStats?.totalReviews ?? 0)),
          0,
        );

        const productosTop = [...productRows]
          .sort((a, b) => b.analytics.revenue - a.analytics.revenue)
          .slice(0, 5)
          .map(({ product, analytics, reviewStats: stats }) => ({
            id: product.id,
            nombre: product.name,
            empresa: product.companyName || "N/D",
            ventas: analytics.unitsSold,
            ingresos: analytics.revenue,
            calificacion: stats?.averageRating ?? null,
          }));

        const empresasTop = companies
          .map((company) => {
            const metrics = companyAnalytics.get(company.id);
            return {
              id: company.id,
              nombre: company.name,
              iniciales: company.name.slice(0, 2).toUpperCase(),
              color: company.avatarColor,
              ventas: metrics?.unitsSold ?? 0,
              ingresos: metrics?.revenue ?? 0,
              crecimiento: metrics?.growthPercent ?? null,
            };
          })
          .sort((a, b) => b.ingresos - a.ingresos)
          .slice(0, 5);

        const salesByWeekday = new Map<string, { ventas: number; ingresos: number }>();
        for (const order of orders) {
          const date = new Date(order.date);
          if (Number.isNaN(date.getTime())) continue;
          const key = date
            .toLocaleDateString("es-DO", { weekday: "short" })
            .slice(0, 3)
            .toLowerCase();
          const current = salesByWeekday.get(key) ?? { ventas: 0, ingresos: 0 };
          current.ingresos += order.total;
          current.ventas += order.lines.reduce((acc, line) => acc + line.quantity, 0);
          salesByWeekday.set(key, current);
        }

        setData({
          kpis: {
            totalEmpresas: companies.length,
            empresasActivas: companies.filter((company) => company.status === "approved").length,
            totalProductos: products.length,
            totalVentas,
            totalIngresos,
            totalUsuarios: users.length,
            usuariosNuevosMes: users.length,
            totalReportes: reports.length,
            reportesPendientes,
            reportesEnProceso,
            reportesSolucionados,
            crecimientoVentas: 0,
            crecimientoIngresos: 0,
            promedioCalificacion: totalReviews > 0 ? Number((weightedRating / totalReviews).toFixed(1)) : null,
            totalVistas: null,
          },
          actividadReciente: [
            ...products.slice(0, 3).map((product) => ({
              id: `p-${product.id}`,
              tipo: "producto" as const,
              titulo: product.name,
              descripcion: `Estado de moderacion: ${product.moderationStatus}`,
              tiempo: new Date(product.updatedAt).toLocaleString("es-DO"),
              estado: product.moderationStatus,
              estadoColor:
                product.moderationStatus === "approved"
                  ? "green"
                  : product.moderationStatus === "rejected"
                    ? "red"
                    : "orange",
            })),
            ...companies.slice(0, 3).map((company) => ({
              id: `c-${company.id}`,
              tipo: "empresa" as const,
              titulo: company.name,
              descripcion: `Estado de empresa: ${company.status}`,
              tiempo: new Date(company.registeredAt).toLocaleDateString("es-DO"),
              estado: company.status,
              estadoColor: company.status === "approved" ? "green" : company.status === "rejected" ? "red" : "orange",
            })),
          ].slice(0, 6),
          reportesRecientes: reports.slice(0, 6).map((report) => ({
            id: report.id,
            codigo: report.codigo,
            titulo: report.titulo,
            usuario: report.usuario.nombre,
            estado: report.estado === "cerrado" ? "solucionado" : report.estado,
            prioridad: report.prioridad,
            fecha: report.fechaCreacion,
          })),
          empresasTop,
          productosTop,
          ventasSemana: ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map((dia) => ({
            dia,
            ventas: salesByWeekday.get(dia)?.ventas ?? 0,
            ingresos: salesByWeekday.get(dia)?.ingresos ?? 0,
          })),
          ventasPorCategoria: companies
            .map((company) => {
              const metrics = companyAnalytics.get(company.id);
              const ventas = metrics?.unitsSold ?? 0;
              return {
                categoria: company.name,
                color: company.avatarColor,
                ventas,
                porcentaje: totalVentas > 0 ? Number(((ventas / totalVentas) * 100).toFixed(1)) : 0,
              };
            })
            .filter((item) => item.ventas > 0)
            .slice(0, 5),
          alertas:
            reportesPendientes > 0
              ? [{ id: "1", titulo: "Reportes pendientes", detalle: `${reportesPendientes} reportes en cola`, nivel: "warning" as const }]
              : [{ id: "1", titulo: "Moderacion al dia", detalle: "No hay reportes pendientes", nivel: "success" as const }],
        });
      } catch (error) {
        console.error("No se pudo cargar el dashboard del moderador:", error);
        if (!mounted) return;
        setData((prev) => ({
          ...prev,
          alertas: [
            {
              id: "odoo-offline",
              titulo: "Sin conexion con Odoo",
              detalle: error instanceof Error ? error.message : "No se pudieron cargar los datos reales del moderador",
              nivel: "error",
            },
          ],
        }));
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [periodo]);

  const ahora = new Date().toLocaleString("es-DO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return { data, isLoading, periodo, setPeriodo, ahora };
}
