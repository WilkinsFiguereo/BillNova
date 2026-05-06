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

    const normalizedOrderTotal = Number(order.total ?? 0);
    const linesCount = order.lines.length;

    for (const line of order.lines) {
      const resolvedProductId = String((line as { productId?: string; product_id?: string }).productId ?? (line as { productId?: string; product_id?: string }).product_id ?? "");
      const normalizedProductName = String(line.productName ?? "").trim().toLowerCase();
      const product = productsById.get(resolvedProductId)
        ?? Array.from(productsById.values()).find((candidate) => candidate.name.trim().toLowerCase() === normalizedProductName);
      if (!product) continue;

      const quantity = Number(line.quantity ?? 0);
      const linePriceUnit = Number(line.priceUnit ?? 0);
      const lineRevenue = quantity > 0 && linePriceUnit > 0
        ? linePriceUnit * quantity
        : linesCount > 0
          ? normalizedOrderTotal / linesCount
          : normalizedOrderTotal;
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
  orders: ModeratorPosOrder[],
  period: PeriodKey,
) {
  const companyMap = new Map<string, CompanyAnalytics>();
  const customerSets = new Map<string, Set<string>>();
  const itemTypeCounts = new Map<string, { product: number; service: number }>();
  const soldTotals = new Map<string, number>();
  const returnTotals = new Map<string, number>();
  const previousTotals = new Map<string, number>();
  const periodWindow = buildPeriodWindow(period);
  const monthlyBuckets = buildMonthlyBuckets(period);

  function ensure(companyId: string): CompanyAnalytics {
    const existing = companyMap.get(companyId);
    if (existing) return existing;
    const created: CompanyAnalytics = {
      companyId,
      unitsSold: 0,
      revenue: 0,
      productsCount: 0,
      uniqueCustomersCount: 0,
      monthlySales: monthlyBuckets.map((bucket) => ({
        mes: bucket.mes,
        ventas: 0,
        ingresos: 0,
      })),
      growthPercent: null,
      returnRate: null,
      dominantItemType: "unknown",
    };
    companyMap.set(companyId, created);
    customerSets.set(companyId, new Set<string>());
    itemTypeCounts.set(companyId, { product: 0, service: 0 });
    return created;
  }

  for (const order of orders) {
    const companyId = String(order.appCompanyId ?? "").trim();
    if (!companyId) continue;

    const orderDate = safeDate(order.date);
    if (!orderDate) continue;

    const company = ensure(companyId);
    const customerKey = String(order.clientEmail || order.clientName || order.id).trim().toLowerCase();
    const orderUnits = order.lines.reduce((sum, line) => sum + Number(line.quantity ?? 0), 0);
    const orderRevenue = Number(order.total ?? 0);

    soldTotals.set(companyId, (soldTotals.get(companyId) ?? 0) + orderUnits);

    if (order.status === "cancelada") {
      returnTotals.set(companyId, (returnTotals.get(companyId) ?? 0) + orderUnits);
      continue;
    }

    if (order.status === "borrador") {
      continue;
    }

    if (orderDate >= periodWindow.start) {
      company.unitsSold += orderUnits;
      company.revenue += orderRevenue;
      if (customerKey) {
        customerSets.get(companyId)?.add(customerKey);
      }
      const bucketIndex = monthlyBuckets.findIndex(
        (bucket) => orderDate >= bucket.start && orderDate < bucket.end,
      );
      if (bucketIndex >= 0) {
        company.monthlySales[bucketIndex].ventas += orderUnits;
        company.monthlySales[bucketIndex].ingresos += orderRevenue;
      }
    } else if (orderDate >= periodWindow.previousStart && orderDate < periodWindow.previousEnd) {
      previousTotals.set(companyId, (previousTotals.get(companyId) ?? 0) + orderUnits);
    }
  }

  for (const row of productRows) {
    const companyId = row.product.companyId;
    if (!companyId) continue;
    const company = ensure(companyId);
    company.productsCount += 1;
    const typeCounter = itemTypeCounts.get(companyId);
    if (typeCounter) {
      typeCounter[row.product.itemType] += 1;
    }
  }

  for (const company of companies) {
    ensure(company.id);
  }

  for (const entry of companyMap.values()) {
    entry.growthPercent = computeGrowth(entry.unitsSold, previousTotals.get(entry.companyId) ?? 0);
    entry.uniqueCustomersCount = customerSets.get(entry.companyId)?.size ?? 0;
    const soldTotal = soldTotals.get(entry.companyId) ?? 0;
    const returnedTotal = returnTotals.get(entry.companyId) ?? 0;
    entry.returnRate = soldTotal > 0 ? Number(((returnedTotal / soldTotal) * 100).toFixed(1)) : 0;
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
