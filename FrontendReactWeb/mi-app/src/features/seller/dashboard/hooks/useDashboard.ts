"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiListProductos } from "../../product/data/productApi";
import { fetchOrders } from "../../orders/data/orderService";
import { getActiveCompanyId } from "../../shared/companySession";
import { getStoredAuthState } from "@/features/auth/login/data/storage";
import { ODOO_URL } from "@/lib/odooApi";
import type { Producto } from "../../product/types/productos.types";
import type { Order } from "../../orders/types/order.types";
import { Product } from "../types/dashboard.types";

interface CompanyStats {
  totalGanado: number;
  totalPerdido: number;
  porMes: number;
  stockCritico: number;
}

interface DashboardMeta {
  fechaLabel: string;
  resumenLabel: string;
}

interface UseDashboardReturn {
  search: string;
  activeNav: string;
  toastVisible: boolean;
  toastMsg: string;
  filteredProducts: Product[];
  totalProducts: number;
  stats: CompanyStats;
  meta: DashboardMeta;
  loading: boolean;
  error: string | null;
  setSearch: (value: string) => void;
  setActiveNav: (id: string) => void;
  showToast: (msg: string) => void;
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(raw: string) {
  const parsed = parseOrderDate(raw);
  if (!parsed) return raw;
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function parseOrderDate(raw: string) {
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mapInvoiceStatus(status?: string): Product["invoiceStatus"] {
  switch (String(status ?? "").toLowerCase()) {
    case "pagada":
    case "paid":
    case "delivered":
      return "pagada";
    case "vencida":
      return "vencida";
    case "pendiente":
    case "borrador":
    case "draft":
    default:
      return "pendiente";
  }
}

function buildDashboardProducts(productos: Producto[], orders: Order[]): Product[] {
  const latestOrderByProduct = new Map<string, Order>();

  orders.forEach((order) => {
    const lines = Array.isArray(order.lines) && order.lines.length > 0
      ? order.lines
      : [{ productName: order.product }];

    lines.forEach((line) => {
      const key = String(line.productName ?? "").trim().toLowerCase();
      if (!key) return;

      const current = latestOrderByProduct.get(key);
      const currentDate = current ? parseOrderDate(current.date)?.getTime() ?? 0 : 0;
      const nextDate = parseOrderDate(order.date)?.getTime() ?? 0;

      if (!current || nextDate >= currentDate) {
        latestOrderByProduct.set(key, order);
      }
    });
  });

  return productos.map((producto) => {
    const latestOrder = latestOrderByProduct.get(producto.nombre.trim().toLowerCase());

    return {
      id: producto.id,
      name: producto.nombre,
      category: producto.categoria,
      stock: producto.stock,
      stockStatus: producto.stockStatus,
      price: new Intl.NumberFormat("es-BO", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(producto.precio),
      invoice: latestOrder?.id ? `ORD-${latestOrder.id}` : "Sin venta",
      invoiceStatus: mapInvoiceStatus(latestOrder?.invoiceStatus),
      date: formatShortDate(latestOrder?.date ?? producto.ultimaActualizacion),
    };
  });
}

function buildStats(productos: Producto[], orders: Order[]): CompanyStats {
  const validOrders = orders.filter((order) => !["cancelled", "cancelado", "cancelada"].includes(String(order.invoiceStatus ?? order.status ?? "").toLowerCase()));
  const cancelledOrders = orders.filter((order) => ["cancelled", "cancelado", "cancelada"].includes(String(order.invoiceStatus ?? order.status ?? "").toLowerCase()));

  const latestOrderDate = validOrders
    .map((order) => parseOrderDate(order.date))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const currentMonth = latestOrderDate?.getMonth();
  const currentYear = latestOrderDate?.getFullYear();

  const porMes = validOrders.reduce((sum, order) => {
    const date = parseOrderDate(order.date);
    if (!date) return sum;
    if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) return sum;
    return sum + Number(order.total ?? 0);
  }, 0);

  return {
    totalGanado: validOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0),
    totalPerdido: cancelledOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0),
    porMes,
    stockCritico: productos.filter((producto) => producto.stock <= 5).length,
  };
}

function buildMeta(productos: Producto[], orders: Order[]): DashboardMeta {
  const referenceDate = orders
    .map((order) => parseOrderDate(order.date))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? new Date();

  const activeProducts = productos.filter((producto) => producto.stock > 0).length;

  return {
    fechaLabel: formatDateLabel(referenceDate),
    resumenLabel: `${orders.length} pedidos registrados - ${activeProducts} productos activos`,
  };
}

async function fetchCompanyStats(companyId: number): Promise<CompanyStats | null> {
  const sessionToken = getStoredAuthState()?.sessionToken;
  const response = await fetch(`${ODOO_URL}/api/company/${companyId}/stats`, {
    credentials: "include",
    headers: sessionToken ? { "X-Auth-Session": sessionToken } : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  if (!payload?.ok) {
    return null;
  }

  return {
    totalGanado: Number(payload.total_ganado ?? 0),
    totalPerdido: Number(payload.total_perdido ?? 0),
    porMes: Number(payload.por_mes ?? 0),
    stockCritico: Number(payload.stock_critico ?? 0),
  };
}

export function useDashboard(): UseDashboardReturn {
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [remoteStats, setRemoteStats] = useState<CompanyStats | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const companyId = getActiveCompanyId();
        const [productosData, ordersData, statsData] = await Promise.all([
          apiListProductos(),
          fetchOrders(),
          companyId ? fetchCompanyStats(companyId) : Promise.resolve(null),
        ]);

        if (!active) return;

        setProductos(productosData);
        setOrders(ordersData);
        setRemoteStats(statsData);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? "No se pudo cargar el dashboard");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const allProducts = useMemo(() => buildDashboardProducts(productos, orders), [productos, orders]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allProducts;

    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(q) ||
      product.id.toLowerCase().includes(q) ||
      product.invoice.toLowerCase().includes(q)
    );
  }, [allProducts, search]);

  const computedStats = useMemo(() => buildStats(productos, orders), [productos, orders]);
  const stats = useMemo<CompanyStats>(() => {
    if (!remoteStats) return computedStats;

    return {
      totalGanado: remoteStats.totalGanado || computedStats.totalGanado,
      totalPerdido: remoteStats.totalPerdido || computedStats.totalPerdido,
      porMes: remoteStats.porMes || computedStats.porMes,
      stockCritico: remoteStats.stockCritico || computedStats.stockCritico,
    };
  }, [computedStats, remoteStats]);
  const meta = useMemo(() => buildMeta(productos, orders), [productos, orders]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);

  return {
    search,
    activeNav,
    toastVisible,
    toastMsg,
    filteredProducts,
    totalProducts: allProducts.length,
    stats,
    meta,
    loading,
    error,
    setSearch,
    setActiveNav,
    showToast,
  };
}
