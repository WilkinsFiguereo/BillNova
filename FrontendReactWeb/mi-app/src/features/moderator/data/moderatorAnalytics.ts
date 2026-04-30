"use client";

import type {
  ModeratorCompany,
  ModeratorProduct,
  ModeratorProductReviewStats,
  ModeratorPosOrder,
} from "./moderatorApi";

export type PeriodKey = "7d" | "30d" | "90d" | "1y";

export interface ProductAnalytics {
  productId: string;
  unitsSold: number;
  revenue: number;
  ordersCount: number;
  uniqueOrderIds: string[];
  uniqueCustomerKeys: string[];
  uniqueCustomersCount: number;
  monthlySales: Array<{ mes: string; ventas: number; ingresos: number; vistas: number }>;
  growthPercent: number | null;
  returnRate: number | null;
  itemType: "product" | "service";
}

export interface CompanyAnalytics {
  companyId: string;
  unitsSold: number;
  revenue: number;
  productsCount: number;
  uniqueCustomersCount: number;
  monthlySales: Array<{ mes: string; ventas: number; ingresos: number }>;
  growthPercent: number | null;
  returnRate: number | null;
  dominantItemType: "product" | "service" | "mixed" | "unknown";
}

type PeriodWindow = { start: Date; previousStart: Date; previousEnd: Date };

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(date: Date, months: number): Date {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function buildPeriodWindow(period: PeriodKey, now = new Date()): PeriodWindow {
  const end = startOfDay(now);

  if (period === "1y") {
    const start = addMonths(end, -12);
    const previousStart = addMonths(start, -12);
    return { start, previousStart, previousEnd: start };
  }

  const daysMap: Record<Exclude<PeriodKey, "1y">, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };
  const days = daysMap[period];
  const start = addDays(end, -days);
  const previousStart = addDays(start, -days);
  return { start, previousStart, previousEnd: start };
}

function safeDate(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function shortMonth(date: Date): string {
  return date.toLocaleString("es-DO", { month: "short" }).replace(".", "");
}

function buildMonthlyBuckets(period: PeriodKey, now = new Date()) {
  const current = startOfDay(now);
  const buckets: Array<{ key: string; mes: string; start: Date; end: Date }> = [];

  if (period === "7d") {
    for (let i = 6; i >= 0; i -= 1) {
      const date = addDays(current, -i);
      const start = startOfDay(date);
      const end = addDays(start, 1);
      buckets.push({
        key: start.toISOString(),
        mes: start.toLocaleString("es-DO", { weekday: "short" }).slice(0, 3),
        start,
        end,
      });
    }
    return buckets;
  }

  const months = period === "30d" ? 2 : period === "90d" ? 4 : 8;
  for (let i = months - 1; i >= 0; i -= 1) {
    const monthDate = new Date(current.getFullYear(), current.getMonth() - i, 1);
    const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
    buckets.push({
      key: `${start.getFullYear()}-${start.getMonth()}`,
      mes: shortMonth(start),
      start,
      end,
    });
  }
  return buckets;
}

function computeGrowth(currentValue: number, previousValue: number): number | null {
  if (previousValue <= 0) return currentValue > 0 ? 100 : null;
  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1));
}

function aggregateOrdersByProduct(
  orders: ModeratorPosOrder[],
  productsById: Map<string, ModeratorProduct>,
  period: PeriodKey,
) {
  const periodWindow = buildPeriodWindow(period);
  const monthlyBuckets = buildMonthlyBuckets(period);
  const analyticsByProduct = new Map<string, ProductAnalytics>();
  const customerSets = new Map<string, Set<string>>();
  const returnTotals = new Map<string, number>();
  const soldTotals = new Map<string, number>();

  function ensure(productId: string, itemType: "product" | "service"): ProductAnalytics {
    const existing = analyticsByProduct.get(productId);
    if (existing) return existing;
    const created: ProductAnalytics = {
      productId,
      unitsSold: 0,
      revenue: 0,
      ordersCount: 0,
      uniqueOrderIds: [],
      uniqueCustomerKeys: [],
      uniqueCustomersCount: 0,
      monthlySales: monthlyBuckets.map((bucket) => ({
        mes: bucket.mes,
        ventas: 0,
        ingresos: 0,
        vistas: 0,
      })),
      growthPercent: null,
      returnRate: null,
      itemType,
    };
    analyticsByProduct.set(productId, created);
    customerSets.set(productId, new Set<string>());
    return created;
  }

  const previousTotals = new Map<string, number>();

for (const order of orders) {
    const orderDate = safeDate(order.date);
    if (!orderDate) continue;

    for (const line of order.lines) {
      const resolvedProductId = String((line as { productId?: string; product_id?: string }).productId ?? (line as { productId?: string; product_id?: string }).product_id ?? "");
      const product = productsById.get(resolvedProductId);
      if (!product) continue;

      const quantity = Number(line.quantity ?? 0);
      const lineRevenue = Number(line.priceUnit ?? 0) * quantity;
      const customerKey = String(order.clientEmail || order.clientName || order.id).trim().toLowerCase();

      soldTotals.set(product.id, (soldTotals.get(product.id) ?? 0) + quantity);

      if (order.status === "cancelada") {
        returnTotals.set(product.id, (returnTotals.get(product.id) ?? 0) + quantity);
        continue;
      }

      if (order.status === "borrador") {
        continue;
      }

      if (orderDate >= periodWindow.start) {
        const analytics = ensure(product.id, product.itemType);
        analytics.unitsSold += quantity;
        analytics.revenue += lineRevenue;
        if (!analytics.uniqueOrderIds.includes(order.id)) {
          analytics.uniqueOrderIds.push(order.id);
          analytics.ordersCount += 1;
        }
        if (customerKey) {
          customerSets.get(product.id)?.add(customerKey);
        }

        const bucketIndex = monthlyBuckets.findIndex(
          (bucket) => orderDate >= bucket.start && orderDate < bucket.end,
        );
        if (bucketIndex >= 0) {
          analytics.monthlySales[bucketIndex].ventas += quantity;
          analytics.monthlySales[bucketIndex].ingresos += lineRevenue;
        }
      } else if (orderDate >= periodWindow.previousStart && orderDate < periodWindow.previousEnd) {
        previousTotals.set(product.id, (previousTotals.get(product.id) ?? 0) + quantity);
      }
    }
  }

  for (const [productId, analytics] of analyticsByProduct.entries()) {
    analytics.growthPercent = computeGrowth(analytics.unitsSold, previousTotals.get(productId) ?? 0);
    analytics.uniqueCustomerKeys = Array.from(customerSets.get(productId) ?? []);
    analytics.uniqueCustomersCount = customerSets.get(productId)?.size ?? 0;
    const soldTotal = soldTotals.get(productId) ?? 0;
    const returnedTotal = returnTotals.get(productId) ?? 0;
    analytics.returnRate = soldTotal > 0 ? Number(((returnedTotal / soldTotal) * 100).toFixed(1)) : 0;
  }

  return analyticsByProduct;
}

export function buildProductAnalytics(
  products: ModeratorProduct[],
  orders: ModeratorPosOrder[],
  reviewStats: Map<string, ModeratorProductReviewStats>,
  period: PeriodKey,
) {
  const productsById = new Map(
    products.map((product) => [product.sourceId, product]),
  );
  const orderAnalytics = aggregateOrdersByProduct(orders, productsById, period);

  return products.map((product) => {
    const stats = product.itemType === "product" ? reviewStats.get(product.sourceId) : undefined;
    const orderData = orderAnalytics.get(product.id);
    return {
      product,
      reviewStats: stats,
      analytics: orderData ?? {
        productId: product.id,
        unitsSold: 0,
        revenue: 0,
        ordersCount: 0,
        uniqueOrderIds: [],
        uniqueCustomerKeys: [],
        uniqueCustomersCount: 0,
        monthlySales: buildMonthlyBuckets(period).map((bucket) => ({
          mes: bucket.mes,
          ventas: 0,
          ingresos: 0,
          vistas: 0,
        })),
        growthPercent: null,
        returnRate: 0,
        itemType: product.itemType,
      },
    };
  });
}

export function buildCompanyAnalytics(
  companies: ModeratorCompany[],
  productRows: ReturnType<typeof buildProductAnalytics>,
) {
  const companyMap = new Map<string, CompanyAnalytics>();
  const previousTotals = new Map<string, number>();
  const customerSets = new Map<string, Set<string>>();
  const itemTypeCounts = new Map<string, { product: number; service: number }>();
  const returnRates = new Map<string, number[]>();

  function ensure(companyId: string): CompanyAnalytics {
    const existing = companyMap.get(companyId);
    if (existing) return existing;
    const created: CompanyAnalytics = {
      companyId,
      unitsSold: 0,
      revenue: 0,
      productsCount: 0,
      uniqueCustomersCount: 0,
      monthlySales: [],
      growthPercent: null,
      returnRate: null,
      dominantItemType: "unknown",
    };
    companyMap.set(companyId, created);
    customerSets.set(companyId, new Set<string>());
    itemTypeCounts.set(companyId, { product: 0, service: 0 });
    returnRates.set(companyId, []);
    return created;
  }

  for (const row of productRows) {
    const companyId = row.product.companyId;
    if (!companyId) continue;
    const company = ensure(companyId);
    company.unitsSold += row.analytics.unitsSold;
    company.revenue += row.analytics.revenue;
    company.productsCount += 1;
    company.uniqueCustomersCount += 0;
    previousTotals.set(
      companyId,
      (previousTotals.get(companyId) ?? 0) +
        row.analytics.monthlySales.slice(0, Math.max(0, row.analytics.monthlySales.length - 1)).reduce((acc, item) => acc + item.ventas, 0),
    );
    const typeCounter = itemTypeCounts.get(companyId);
    if (typeCounter) {
      typeCounter[row.product.itemType] += 1;
    }
    row.analytics.uniqueCustomerKeys.forEach((customerKey) => customerSets.get(companyId)?.add(customerKey));
    returnRates.get(companyId)?.push(row.analytics.returnRate ?? 0);

    if (company.monthlySales.length === 0) {
      company.monthlySales = row.analytics.monthlySales.map((item) => ({
        mes: item.mes,
        ventas: item.ventas,
        ingresos: item.ingresos,
      }));
    } else {
      row.analytics.monthlySales.forEach((item, index) => {
        company.monthlySales[index].ventas += item.ventas;
        company.monthlySales[index].ingresos += item.ingresos;
      });
    }
  }

  for (const company of companies) {
    ensure(company.id);
  }

  for (const entry of companyMap.values()) {
    const currentTotal = entry.monthlySales.reduce((acc, item) => acc + item.ventas, 0);
    entry.growthPercent = computeGrowth(currentTotal, previousTotals.get(entry.companyId) ?? 0);
    entry.uniqueCustomersCount = customerSets.get(entry.companyId)?.size ?? 0;
    const companyReturnRates = returnRates.get(entry.companyId) ?? [];
    entry.returnRate = companyReturnRates.length > 0
      ? Number((companyReturnRates.reduce((acc, value) => acc + value, 0) / companyReturnRates.length).toFixed(1))
      : 0;
    const typeCounter = itemTypeCounts.get(entry.companyId) ?? { product: 0, service: 0 };
    entry.dominantItemType =
      typeCounter.product > 0 && typeCounter.service > 0
        ? "mixed"
        : typeCounter.service > 0
          ? "service"
          : typeCounter.product > 0
            ? "product"
            : "unknown";
  }

  return companyMap;
}

export function averageCompanyRating(
  companyId: string,
  productRows: ReturnType<typeof buildProductAnalytics>,
) {
  const ratings = productRows
    .filter((row) => row.product.companyId === companyId && (row.reviewStats?.totalReviews ?? 0) > 0)
    .map((row) => ({
      total: row.reviewStats?.totalReviews ?? 0,
      avg: row.reviewStats?.averageRating ?? 0,
    }));

  const weightedTotal = ratings.reduce((acc, item) => acc + item.avg * item.total, 0);
  const totalReviews = ratings.reduce((acc, item) => acc + item.total, 0);

  return {
    averageRating: totalReviews > 0 ? Number((weightedTotal / totalReviews).toFixed(1)) : null,
    totalReviews,
  };
}
