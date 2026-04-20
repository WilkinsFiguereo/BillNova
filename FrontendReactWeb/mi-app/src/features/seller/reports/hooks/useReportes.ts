"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { reportesTheme as t } from "../theme/reportes.theme";
import { apiListProductos } from "../../product/data/productApi";
import { fetchOrders } from "../../orders/data/orderService";
import type { Producto } from "../../product/types/productos.types";
import type { Order } from "../../orders/types/order.types";
import type {
  ClienteTop,
  DistribucionCategoria,
  PeriodoFiltro,
  ProductoTop,
  ReportesResumen,
} from "../types/reportes.types";

interface UseReportesReturn {
  periodo: PeriodoFiltro;
  toastVisible: boolean;
  toastMsg: string;
  loading: boolean;
  error: string | null;
  resumen: ReportesResumen;
  setPeriodo: (p: PeriodoFiltro) => void;
  showToast: (msg: string) => void;
}

type PeriodRange = {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

const EMPTY_RESUMEN: ReportesResumen = {
  stats: [],
  chart: [],
  productosTop: [],
  clientesTop: [],
  distribucion: [],
};

function debugLog(label: string, payload?: unknown) {
  console.log(`[seller/reports] ${label}`, payload);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function shiftDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function shiftMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function safeParseDate(raw: string) {
  if (!raw) return null;
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const normalized = raw.replace(/\s+/g, " ").trim();
  const alt = Date.parse(normalized);
  return Number.isNaN(alt) ? null : new Date(alt);
}

function getReferenceDate(orders: Order[]) {
  const dates = orders
    .map((order) => safeParseDate(order.date))
    .filter((date): date is Date => Boolean(date))
    .map((date) => startOfDay(date).getTime());

  if (dates.length === 0) return startOfDay(new Date());
  return new Date(Math.max(...dates));
}

function getPeriodRange(periodo: PeriodoFiltro, referenceDate: Date): PeriodRange {
  const today = startOfDay(referenceDate);

  if (periodo === "12m") {
    const start = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    const end = endOfDay(today);
    const previousStart = new Date(start.getFullYear(), start.getMonth() - 12, 1);
    const previousEnd = endOfDay(new Date(start.getFullYear(), start.getMonth(), 0));
    return { start, end, previousStart, previousEnd };
  }

  const days = periodo === "7d" ? 7 : periodo === "30d" ? 30 : 90;
  const start = startOfDay(shiftDays(today, -(days - 1)));
  const end = endOfDay(today);
  const previousStart = startOfDay(shiftDays(start, -days));
  const previousEnd = endOfDay(shiftDays(start, -1));
  return { start, end, previousStart, previousEnd };
}

function isOrderIncluded(order: Order) {
  const status = (order.invoiceStatus ?? order.status ?? "").toLowerCase();
  return !["cancelled", "cancelado", "cancelada"].includes(status);
}

function isOrderPaid(order: Order) {
  const status = (order.invoiceStatus ?? order.status ?? "").toLowerCase();
  return ["pagada", "paid", "delivered", "entregado", "sent", "enviado"].includes(status);
}

function getOrderRevenue(order: Order) {
  return Math.max(Number(order.total ?? 0), 0);
}

function getOrderCost(order: Order, productsByName: Map<string, Producto>) {
  if (Array.isArray(order.lines) && order.lines.length > 0) {
    return order.lines.reduce((sum, line) => {
      const product = productsByName.get(line.productName.toLowerCase());
      const fallbackCost = Number(line.priceUnit ?? 0) * 0.65;
      return sum + (product ? product.costo * Number(line.quantity ?? 0) : fallbackCost * Number(line.quantity ?? 0));
    }, 0);
  }

  const product = productsByName.get(order.product.toLowerCase());
  if (product) return product.costo * Number(order.qty ?? 0);
  const safeRevenue = getOrderRevenue(order);
  return safeRevenue * 0.65;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("es-BO", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDelta(current: number, previous: number, suffix: string) {
  if (previous === 0) {
    if (current === 0) return { text: `Sin cambios ${suffix}`, positive: true };
    return { text: `Nuevo ${suffix}`, positive: true };
  }

  const delta = ((current - previous) / previous) * 100;
  const prefix = delta >= 0 ? "+" : "";
  return {
    text: `${prefix}${delta.toFixed(1)}% ${suffix}`,
    positive: delta >= 0,
  };
}

function buildChartData(
  periodo: PeriodoFiltro,
  orders: Order[],
  productsByName: Map<string, Producto>,
  referenceDate: Date
) {
  const range = getPeriodRange(periodo, referenceDate);

  if (periodo === "12m") {
    return Array.from({ length: 12 }, (_, index) => {
      const bucketStart = shiftMonths(range.start, index);
      const bucketEnd = endOfDay(new Date(bucketStart.getFullYear(), bucketStart.getMonth() + 1, 0));
      const bucketOrders = orders.filter((order) => {
        const date = safeParseDate(order.date);
        return date && date >= bucketStart && date <= bucketEnd;
      });

      const ventas = bucketOrders.reduce((sum, order) => sum + getOrderRevenue(order), 0);
      const cobros = bucketOrders.filter(isOrderPaid).reduce((sum, order) => sum + getOrderRevenue(order), 0);
      const gastos = bucketOrders.reduce((sum, order) => sum + getOrderCost(order, productsByName), 0);

      return {
        label: MONTH_LABELS[bucketStart.getMonth()],
        ventas,
        cobros,
        gastos,
      };
    });
  }

  if (periodo === "90d") {
    return Array.from({ length: 3 }, (_, index) => {
      const bucketStart = shiftMonths(new Date(range.start.getFullYear(), range.start.getMonth(), 1), index);
      const bucketEnd = endOfDay(new Date(bucketStart.getFullYear(), bucketStart.getMonth() + 1, 0));
      const bucketOrders = orders.filter((order) => {
        const date = safeParseDate(order.date);
        return date && date >= bucketStart && date <= bucketEnd;
      });

      const ventas = bucketOrders.reduce((sum, order) => sum + getOrderRevenue(order), 0);
      const cobros = bucketOrders.filter(isOrderPaid).reduce((sum, order) => sum + getOrderRevenue(order), 0);
      const gastos = bucketOrders.reduce((sum, order) => sum + getOrderCost(order, productsByName), 0);

      return {
        label: MONTH_LABELS[bucketStart.getMonth()],
        ventas,
        cobros,
        gastos,
      };
    });
  }

  if (periodo === "30d") {
    const daysPerBucket = 7;
    const bucketCount = Math.ceil(30 / daysPerBucket);

    return Array.from({ length: bucketCount }, (_, index) => {
      const bucketStart = startOfDay(shiftDays(range.start, index * daysPerBucket));
      const bucketEnd = endOfDay(
        shiftDays(bucketStart, Math.min(daysPerBucket - 1, Math.floor((range.end.getTime() - bucketStart.getTime()) / DAY_MS)))
      );
      const bucketOrders = orders.filter((order) => {
        const date = safeParseDate(order.date);
        return date && date >= bucketStart && date <= bucketEnd;
      });

      const ventas = bucketOrders.reduce((sum, order) => sum + getOrderRevenue(order), 0);
      const cobros = bucketOrders.filter(isOrderPaid).reduce((sum, order) => sum + getOrderRevenue(order), 0);
      const gastos = bucketOrders.reduce((sum, order) => sum + getOrderCost(order, productsByName), 0);

      return {
        label: `Sem ${index + 1}`,
        ventas,
        cobros,
        gastos,
      };
    });
  }

  return Array.from({ length: 7 }, (_, index) => {
    const bucketDate = startOfDay(shiftDays(range.start, index));
    const bucketOrders = orders.filter((order) => {
      const date = safeParseDate(order.date);
      return date && startOfDay(date).getTime() === bucketDate.getTime();
    });

    const ventas = bucketOrders.reduce((sum, order) => sum + getOrderRevenue(order), 0);
    const cobros = bucketOrders.filter(isOrderPaid).reduce((sum, order) => sum + getOrderRevenue(order), 0);
    const gastos = bucketOrders.reduce((sum, order) => sum + getOrderCost(order, productsByName), 0);

    return {
      label: WEEKDAY_LABELS[bucketDate.getDay()],
      ventas,
      cobros,
      gastos,
    };
  });
}

function buildTopProducts(orders: Order[], productsByName: Map<string, Producto>): ProductoTop[] {
  const totals = new Map<string, { nombre: string; categoria: string; unidades: number; ingresos: number }>();
  const totalRevenue = orders.reduce((sum, order) => sum + getOrderRevenue(order), 0);

  orders.forEach((order) => {
    const lines = Array.isArray(order.lines) && order.lines.length > 0
      ? order.lines
      : [{ id: order.id, productName: order.product, quantity: order.qty, priceUnit: order.qty > 0 ? order.total / order.qty : order.total }];

    lines.forEach((line) => {
      const key = line.productName.trim().toLowerCase() || "sin-producto";
      const product = productsByName.get(key);
      const current = totals.get(key) ?? {
        nombre: line.productName || "Producto sin nombre",
        categoria: product?.categoria ?? "Sin categoria",
        unidades: 0,
        ingresos: 0,
      };

      current.unidades += Number(line.quantity ?? 0);
      current.ingresos += Number(line.priceUnit ?? 0) * Number(line.quantity ?? 0);
      totals.set(key, current);
    });
  });

  return Array.from(totals.values())
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 5)
    .map((product) => ({
      ...product,
      porcentaje: totalRevenue > 0 ? Number(((product.ingresos / totalRevenue) * 100).toFixed(1)) : 0,
    }));
}

function buildTopClients(orders: Order[]): ClienteTop[] {
  const totals = new Map<string, { nombre: string; email: string; facturas: number; total: number; lastDate: number }>();

  orders.forEach((order) => {
    const key = order.client.trim().toLowerCase() || `cliente-${order.id}`;
    const current = totals.get(key) ?? {
      nombre: order.client || "Cliente sin nombre",
      email: order.email || order.phone || "Sin contacto",
      facturas: 0,
      total: 0,
      lastDate: 0,
    };

    current.facturas += 1;
    current.total += getOrderRevenue(order);
    current.lastDate = Math.max(current.lastDate, safeParseDate(order.date)?.getTime() ?? 0);
    totals.set(key, current);
  });

  const activeCutoff = shiftDays(getReferenceDate(orders), -30).getTime();

  return Array.from(totals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((client) => ({
      nombre: client.nombre,
      email: client.email,
      facturas: client.facturas,
      total: client.total,
      status: client.lastDate >= activeCutoff ? "activo" : "inactivo",
    }));
}

function buildDistribution(orders: Order[], productsByName: Map<string, Producto>): DistribucionCategoria[] {
  const totals = new Map<string, number>();
  const colors = [t.brand400, t.success, t.warning, t.error, t.textDisabled];

  orders.forEach((order) => {
    const lines = Array.isArray(order.lines) && order.lines.length > 0
      ? order.lines
      : [{ id: order.id, productName: order.product, quantity: order.qty, priceUnit: order.qty > 0 ? order.total / order.qty : order.total }];

    lines.forEach((line) => {
      const product = productsByName.get(line.productName.toLowerCase());
      const category = product?.categoria ?? "Sin categoria";
      const revenue = Number(line.priceUnit ?? 0) * Number(line.quantity ?? 0);
      totals.set(category, (totals.get(category) ?? 0) + revenue);
    });
  });

  const totalRevenue = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value], index) => ({
      label,
      valor: totalRevenue > 0 ? Number(((value / totalRevenue) * 100).toFixed(1)) : 0,
      color: colors[index % colors.length],
    }));
}

function buildResumen(periodo: PeriodoFiltro, orders: Order[], productos: Producto[]): ReportesResumen {
  const productsByName = new Map(productos.map((product) => [product.nombre.toLowerCase(), product]));
  const datedOrders = orders
    .map((order) => ({ order, date: safeParseDate(order.date) }))
    .filter((entry): entry is { order: Order; date: Date } => Boolean(entry.date))
    .filter(({ order }) => isOrderIncluded(order));
  const referenceDate = getReferenceDate(datedOrders.map(({ order }) => order));
  const range = getPeriodRange(periodo, referenceDate);

  const currentOrders = datedOrders
    .filter(({ date }) => date >= range.start && date <= range.end)
    .map(({ order }) => order);

  const previousOrders = datedOrders
    .filter(({ date }) => date >= range.previousStart && date <= range.previousEnd)
    .map(({ order }) => order);

  const currentRevenue = currentOrders.reduce((sum, order) => sum + getOrderRevenue(order), 0);
  const previousRevenue = previousOrders.reduce((sum, order) => sum + getOrderRevenue(order), 0);
  const currentUnits = currentOrders.reduce((sum, order) => sum + Number(order.qty ?? 0), 0);
  const previousUnits = previousOrders.reduce((sum, order) => sum + Number(order.qty ?? 0), 0);
  const currentClients = new Set(currentOrders.map((order) => order.client.trim().toLowerCase()).filter(Boolean)).size;
  const previousClients = new Set(previousOrders.map((order) => order.client.trim().toLowerCase()).filter(Boolean)).size;
  const currentMarginBase = currentOrders.reduce((sum, order) => sum + getOrderCost(order, productsByName), 0);
  const previousMarginBase = previousOrders.reduce((sum, order) => sum + getOrderCost(order, productsByName), 0);
  const currentMargin = currentRevenue > 0 ? ((currentRevenue - currentMarginBase) / currentRevenue) * 100 : 0;
  const previousMargin = previousRevenue > 0 ? ((previousRevenue - previousMarginBase) / previousRevenue) * 100 : 0;

  debugLog("buildResumen input", {
    periodo,
    total_orders_received: orders.length,
    dated_orders_count: datedOrders.length,
    current_orders_count: currentOrders.length,
    previous_orders_count: previousOrders.length,
    productos_count: productos.length,
    reference_date: referenceDate.toISOString(),
    range: {
      start: range.start.toISOString(),
      end: range.end.toISOString(),
      previousStart: range.previousStart.toISOString(),
      previousEnd: range.previousEnd.toISOString(),
    },
    sample_orders: currentOrders.slice(0, 10).map((order) => ({
      id: order.id,
      client: order.client,
      date: order.date,
      total: order.total,
      qty: order.qty,
      status: order.status,
      invoiceStatus: order.invoiceStatus,
    })),
  });

  debugLog("buildResumen totals", {
    currentRevenue,
    previousRevenue,
    currentUnits,
    previousUnits,
    currentClients,
    previousClients,
    currentMarginBase,
    previousMarginBase,
    currentMargin,
    previousMargin,
  });

  const revenueDelta = formatDelta(currentRevenue, previousRevenue, "vs periodo anterior");
  const unitsDelta = formatDelta(currentUnits, previousUnits, "vs periodo anterior");
  const clientsDelta = previousClients === 0
    ? { text: currentClients > 0 ? `${currentClients} clientes nuevos` : "Sin clientes nuevos", positive: true }
    : {
        text: `${currentClients >= previousClients ? "+" : ""}${currentClients - previousClients} clientes activos`,
        positive: currentClients >= previousClients,
      };
  const marginDelta = {
    text: `${currentMargin >= previousMargin ? "+" : ""}${(currentMargin - previousMargin).toFixed(1)} pts vs anterior`,
    positive: currentMargin >= previousMargin,
  };

  return {
    stats: [
      {
        label: "Ingresos Totales",
        value: formatCompactNumber(currentRevenue),
        Icon: DollarSign,
        delta: revenueDelta.text,
        deltaPositivo: revenueDelta.positive,
        color: t.brand400,
        bg: t.brand100,
      },
      {
        label: "Unidades Vendidas",
        value: new Intl.NumberFormat("es-BO").format(currentUnits),
        Icon: ShoppingCart,
        delta: unitsDelta.text,
        deltaPositivo: unitsDelta.positive,
        color: t.success,
        bg: t.successBg,
      },
      {
        label: "Clientes Activos",
        value: new Intl.NumberFormat("es-BO").format(currentClients),
        Icon: Users,
        delta: clientsDelta.text,
        deltaPositivo: clientsDelta.positive,
        color: t.warning,
        bg: t.warningBg,
      },
      {
        label: "Margen Promedio",
        value: `${currentMargin.toFixed(1)}%`,
        Icon: TrendingUp,
        delta: marginDelta.text,
        deltaPositivo: marginDelta.positive,
        color: marginDelta.positive ? t.success : t.error,
        bg: marginDelta.positive ? t.successBg : t.errorBg,
      },
    ],
    chart: buildChartData(periodo, currentOrders, productsByName, referenceDate),
    productosTop: buildTopProducts(currentOrders, productsByName),
    clientesTop: buildTopClients(currentOrders),
    distribucion: buildDistribution(currentOrders, productsByName),
  };
}

export function useReportes(): UseReportesReturn {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("30d");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 3000);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [ordersData, productosData] = await Promise.all([
          fetchOrders(),
          apiListProductos(),
        ]);

        if (!active) return;

        debugLog("loadData resolved", {
          orders_count: ordersData.length,
          productos_count: productosData.length,
          sample_orders: ordersData.slice(0, 5).map((order) => ({
            id: order.id,
            date: order.date,
            total: order.total,
            qty: order.qty,
            status: order.status,
            invoiceStatus: order.invoiceStatus,
          })),
          sample_products: productosData.slice(0, 5).map((product) => ({
            id: product.id,
            nombre: product.nombre,
            categoria: product.categoria,
            costo: product.costo,
            precio: product.precio,
          })),
        });

        setOrders(ordersData);
        setProductos(productosData);
      } catch (err: any) {
        if (!active) return;
        const message = err?.message ?? "No se pudieron cargar los reportes";
        debugLog("loadData error", err);
        setError(message);
        showToast(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [showToast]);

  const resumen = useMemo(() => buildResumen(periodo, orders, productos), [periodo, orders, productos]);

  return {
    periodo,
    toastVisible,
    toastMsg,
    loading,
    error,
    resumen,
    setPeriodo,
    showToast,
  };
}

export { EMPTY_RESUMEN, formatCurrency };
