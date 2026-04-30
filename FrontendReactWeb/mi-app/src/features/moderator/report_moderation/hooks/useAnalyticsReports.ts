"use client";

import { useEffect, useMemo, useState } from "react";
import { averageCompanyRating, buildCompanyAnalytics, buildProductAnalytics, type PeriodKey } from "../../data/moderatorAnalytics";
import {
  apiListModeratorCompanies,
  apiListModeratorPosOrders,
  apiListModeratorProducts,
  apiListModeratorUsers,
  apiListProductReviewStats,
} from "../../data/moderatorApi";

export interface ModeratorReportCompanyRow {
  id: string;
  nombre: string;
  estado: string;
  categoria: string;
  productos: number;
  ventas: number;
  ingresos: number;
  clientes: number;
  calificacion: number | null;
}

export interface ModeratorReportProductRow {
  id: string;
  nombre: string;
  empresa: string;
  tipo: "product" | "service";
  estado: string;
  precio: number;
  ventas: number;
  ingresos: number;
  resenas: number;
  calificacion: number | null;
}

export interface ModeratorReportUserRow {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  compras: number;
  gasto: number;
}

export interface ModeratorReportSaleRow {
  id: string;
  referencia: string;
  fecha: string;
  estado: string;
  cliente: string;
  items: number;
  total: number;
}

interface ModeratorReportsData {
  companies: ModeratorReportCompanyRow[];
  products: ModeratorReportProductRow[];
  users: ModeratorReportUserRow[];
  sales: ModeratorReportSaleRow[];
  summary: {
    totalEmpresas: number;
    totalProductos: number;
    totalUsuarios: number;
    totalVentas: number;
    totalIngresos: number;
  };
}

interface UseAnalyticsReportsReturn extends ModeratorReportsData {
  loading: boolean;
  period: PeriodKey;
  setPeriod: (value: PeriodKey) => void;
}

const EMPTY_DATA: ModeratorReportsData = {
  companies: [],
  products: [],
  users: [],
  sales: [],
  summary: {
    totalEmpresas: 0,
    totalProductos: 0,
    totalUsuarios: 0,
    totalVentas: 0,
    totalIngresos: 0,
  },
};

function normalizeCompanyCategory(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "unknown") return "Sin clasificar";
  if (normalized === "mixed") return "Mixto";
  if (normalized === "service") return "Servicios";
  if (normalized === "product") return "Productos";
  return normalized;
}

function normalizeCompanyStatus(value: string): string {
  if (value === "approved") return "Activa";
  if (value === "rejected") return "Suspendida";
  return "Pendiente";
}

function normalizeProductStatus(value: string, stock: number): string {
  if (value === "rejected") return "Suspendido";
  if (stock <= 0) return "Sin stock";
  if (value === "approved") return "Activo";
  return "Pendiente";
}

export function useAnalyticsReports(): UseAnalyticsReportsReturn {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ModeratorReportsData>(EMPTY_DATA);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const [companies, products, users, orders] = await Promise.all([
          apiListModeratorCompanies(),
          apiListModeratorProducts(),
          apiListModeratorUsers(),
          apiListModeratorPosOrders(),
        ]);

        const reviewStats = await apiListProductReviewStats(
          products.filter((product) => product.itemType === "product").map((product) => product.sourceId),
        );

        if (!mounted) return;

        const productRows = buildProductAnalytics(products, orders, reviewStats, period);
        const companyAnalytics = buildCompanyAnalytics(companies, productRows);

        const companyRows: ModeratorReportCompanyRow[] = companies
          .map((company) => {
            const metrics = companyAnalytics.get(company.id);
            const rating = averageCompanyRating(company.id, productRows);

            return {
              id: company.id,
              nombre: company.name,
              estado: normalizeCompanyStatus(company.status),
              categoria: normalizeCompanyCategory(metrics?.dominantItemType ?? ""),
              productos: metrics?.productsCount ?? 0,
              ventas: metrics?.unitsSold ?? 0,
              ingresos: metrics?.revenue ?? 0,
              clientes: metrics?.uniqueCustomersCount ?? 0,
              calificacion: rating.averageRating,
            };
          })
          .sort((a, b) => b.ingresos - a.ingresos);

        const productReportRows: ModeratorReportProductRow[] = productRows
          .map(({ product, analytics, reviewStats: stats }) => ({
            id: product.id,
            nombre: product.name,
            empresa: product.companyName || "Sin empresa",
            tipo: product.itemType,
            estado: normalizeProductStatus(product.moderationStatus, product.stock),
            precio: product.price,
            ventas: analytics.unitsSold,
            ingresos: analytics.revenue,
            resenas: stats?.totalReviews ?? 0,
            calificacion: stats?.averageRating ?? null,
          }))
          .sort((a, b) => b.ingresos - a.ingresos);

        const salesRows: ModeratorReportSaleRow[] = orders
          .map((order) => ({
            id: order.id,
            referencia: order.reference || order.id,
            fecha: order.date,
            estado: order.status || "N/D",
            cliente: order.clientName || order.clientEmail || "Consumidor final",
            items: order.lines.reduce((acc, line) => acc + Number(line.quantity ?? 0), 0),
            total: order.total,
          }))
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        const userMetrics = new Map<string, { compras: number; gasto: number }>();
        for (const sale of salesRows) {
          const key = sale.cliente.trim().toLowerCase();
          const current = userMetrics.get(key) ?? { compras: 0, gasto: 0 };
          current.compras += 1;
          current.gasto += sale.total;
          userMetrics.set(key, current);
        }

        const userRows: ModeratorReportUserRow[] = users
          .map((user) => {
            const metrics =
              userMetrics.get(user.email.trim().toLowerCase()) ??
              userMetrics.get(user.name.trim().toLowerCase()) ??
              { compras: 0, gasto: 0 };

            return {
              id: user.id,
              nombre: user.name,
              email: user.email,
              rol: user.role || "user",
              compras: metrics.compras,
              gasto: metrics.gasto,
            };
          })
          .sort((a, b) => b.gasto - a.gasto);

        setData({
          companies: companyRows,
          products: productReportRows,
          users: userRows,
          sales: salesRows,
          summary: {
            totalEmpresas: companyRows.length,
            totalProductos: productReportRows.length,
            totalUsuarios: userRows.length,
            totalVentas: productReportRows.reduce((acc, row) => acc + row.ventas, 0),
            totalIngresos: productReportRows.reduce((acc, row) => acc + row.ingresos, 0),
          },
        });
      } catch (error) {
        console.error("No se pudieron cargar los reportes del moderador:", error);
        if (mounted) {
          setData(EMPTY_DATA);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [period]);

  const memoized = useMemo(
    () => ({
      ...data,
      loading,
      period,
      setPeriod,
    }),
    [data, loading, period],
  );

  return memoized;
}
