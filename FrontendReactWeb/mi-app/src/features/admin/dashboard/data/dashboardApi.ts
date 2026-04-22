import { odooGet, odooRequest } from "@/lib/odooApi";
import type { Order } from "@/features/seller/orders/types/order.types";
import type {
  DashboardData,
  Period,
  StatCard,
  RecentUser,
  RecentActivity,
  ChartDataPoint,
} from "../types/dashboard.types";
import { mockDashboardData } from "./dashboardData";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
const DAY_MS = 24 * 60 * 60 * 1000;
const OVERDUE_DAYS = 30;

type DashboardUserApi = {
  id: number | string;
  name?: string;
  email?: string;
  is_mobile_user?: boolean;
  active?: boolean;
  company_id?: number | string | [number | string, string];
  created_at?: string;
  create_date?: string;
  createdAt?: string;
  write_date?: string;
};

type DashboardCompanyApi = {
  id: number | string;
  name?: string;
  moderation_status?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  create_date?: string;
  write_date?: string;
};

type PeriodRange = {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
};

type PosOrderApi = {
  id?: string | number;
  client?: string;
  product?: string;
  qty?: number | string;
  total?: number | string;
  date?: string;
  status?: string;
  address?: string;
  phone?: string;
  clienteEmail?: string;
  email?: string;
  lines?: Array<{
    id?: string | number;
    productName?: string;
    quantity?: number | string;
    priceUnit?: number | string;
  }>;
};

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

function getEntityDate(entity: { createdAt?: string; created_at?: string; create_date?: string; write_date?: string }) {
  return safeParseDate(entity.createdAt ?? entity.created_at ?? entity.create_date ?? entity.write_date ?? "");
}

function getPeriodRange(period: Period, referenceDate: Date): PeriodRange {
  const currentEnd = endOfDay(referenceDate);

  if (period === "year") {
    const currentStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 11, 1);
    const previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 12, 1);
    const previousEnd = endOfDay(new Date(currentStart.getFullYear(), currentStart.getMonth(), 0));
    return { currentStart, currentEnd, previousStart, previousEnd };
  }

  const days = period === "month" ? 30 : 7;
  const currentStart = startOfDay(shiftDays(referenceDate, -(days - 1)));
  const previousStart = startOfDay(shiftDays(currentStart, -days));
  const previousEnd = endOfDay(shiftDays(currentStart, -1));
  return { currentStart, currentEnd, previousStart, previousEnd };
}

function calculateChange(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return 0;
    return 100;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function countEntitiesInRange<T extends { createdAt?: string; created_at?: string; create_date?: string; write_date?: string }>(
  entities: T[],
  start: Date,
  end: Date,
) {
  return entities.filter((entity) => {
    const date = getEntityDate(entity);
    return date && date >= start && date <= end;
  }).length;
}

function countActiveUsers(users: DashboardUserApi[]) {
  return users.filter((user) => user.active !== false).length;
}

function normalizeCompanyId(value: DashboardUserApi["company_id"]) {
  if (Array.isArray(value)) return String(value[0] ?? "");
  if (value === null || value === undefined) return "";
  return String(value);
}

function normalizeOrderStatus(status: unknown): Order["status"] {
  switch (String(status ?? "").toLowerCase()) {
    case "sent":
    case "enviado":
      return "sent";
    case "delivered":
    case "pagada":
    case "paid":
    case "entregado":
      return "delivered";
    case "cancelled":
    case "cancelado":
    case "cancelada":
      return "cancelled";
    default:
      return "pending";
  }
}

function unwrapArrayPayload(payload: unknown): PosOrderApi[] {
  if (Array.isArray(payload)) return payload as PosOrderApi[];
  if (Array.isArray((payload as { data?: unknown[] })?.data)) return (payload as { data: PosOrderApi[] }).data;
  if (Array.isArray((payload as { results?: unknown[] })?.results)) return (payload as { results: PosOrderApi[] }).results;
  return [];
}

function mapSystemOrders(rows: PosOrderApi[]): Order[] {
  return rows.map((order) => {
    const lines = Array.isArray(order.lines)
      ? order.lines.map((line) => ({
          id: String(line.id ?? ""),
          productName: String(line.productName ?? ""),
          quantity: Number(line.quantity ?? 0),
          priceUnit: Number(line.priceUnit ?? 0),
        }))
      : [];

    const qtyFromLines = lines.reduce((acc, line) => acc + Number(line.quantity ?? 0), 0);
    const firstLine = lines[0];

    return {
      id: String(order.id ?? ""),
      client: String(order.client ?? ""),
      product: String(order.product ?? firstLine?.productName ?? ""),
      qty: Number.isFinite(Number(order.qty)) ? Number(order.qty) : qtyFromLines,
      total: Number(order.total ?? 0),
      date: String(order.date ?? ""),
      status: normalizeOrderStatus(order.status),
      address: String(order.address ?? ""),
      phone: String(order.phone ?? ""),
      email: String(order.clienteEmail ?? order.email ?? ""),
      invoiceStatus: String(order.status ?? ""),
      lines,
    };
  });
}

async function fetchSystemOrders(): Promise<Order[]> {
  const payload = await odooRequest<unknown>("/api/pos/orders", { method: "GET", cache: "no-store" });
  const rows = unwrapArrayPayload(payload);
  return mapSystemOrders(rows);
}

function getUniqueCompaniesFromUsers(users: DashboardUserApi[]) {
  return new Set(
    users
      .map((user) => normalizeCompanyId(user.company_id))
      .filter(Boolean),
  );
}

function filterOrdersByRange(orders: Order[], start: Date, end: Date) {
  return orders.filter((order) => {
    if (!isIncludedOrder(order)) return false;
    const date = safeParseDate(order.date);
    return date && date >= start && date <= end;
  });
}

function sumOrderTotals(orders: Order[]) {
  return orders.reduce((sum, order) => sum + Math.max(Number(order.total ?? 0), 0), 0);
}

function countPendingOrders(orders: Order[]) {
  return orders.filter(isPendingOrder).length;
}

function countOverdueOrders(orders: Order[], referenceDate: Date) {
  const cutoff = startOfDay(shiftDays(referenceDate, -OVERDUE_DAYS));
  return orders.filter((order) => {
    if (!isPendingOrder(order)) return false;
    const date = safeParseDate(order.date);
    return date && startOfDay(date) <= cutoff;
  }).length;
}

function isIncludedOrder(order: Order) {
  const status = String(order.invoiceStatus ?? order.status ?? "").toLowerCase();
  return !["cancelled", "cancelado", "cancelada"].includes(status);
}

function isCollectedOrder(order: Order) {
  const status = String(order.invoiceStatus ?? order.status ?? "").toLowerCase();
  return ["pagada", "paid", "delivered", "entregado", "sent", "enviado"].includes(status);
}

function isPendingOrder(order: Order) {
  return !isCollectedOrder(order);
}

function getReferenceDate(orders: Order[]) {
  const dates = orders
    .map((order) => safeParseDate(order.date))
    .filter((date): date is Date => Boolean(date))
    .map((date) => startOfDay(date).getTime());

  if (dates.length === 0) return startOfDay(new Date());
  return new Date(Math.max(...dates));
}

function sumAmounts(orders: Order[]) {
  return orders.reduce(
    (acc, order) => {
      const total = Math.max(Number(order.total ?? 0), 0);
      acc.sales += total;
      if (isCollectedOrder(order)) acc.collections += total;
      if (isPendingOrder(order)) acc.pending += total;
      return acc;
    },
    { sales: 0, collections: 0, pending: 0 },
  );
}

function buildChartData(period: Period, orders: Order[]): ChartDataPoint[] {
  const activeOrders = orders.filter(isIncludedOrder);
  const referenceDate = getReferenceDate(activeOrders);

  if (period === "year") {
    const startMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 11, 1);
    return Array.from({ length: 12 }, (_, index) => {
      const bucketStart = new Date(startMonth.getFullYear(), startMonth.getMonth() + index, 1);
      const bucketEnd = endOfDay(new Date(bucketStart.getFullYear(), bucketStart.getMonth() + 1, 0));
      const totals = sumAmounts(
        activeOrders.filter((order) => {
          const date = safeParseDate(order.date);
          return date && date >= bucketStart && date <= bucketEnd;
        }),
      );

      return {
        label: MONTH_LABELS[bucketStart.getMonth()],
        ...totals,
      };
    });
  }

  if (period === "month") {
    const rangeStart = startOfDay(shiftDays(referenceDate, -29));
    const bucketCount = Math.ceil(30 / 7);

    return Array.from({ length: bucketCount }, (_, index) => {
      const bucketStart = startOfDay(shiftDays(rangeStart, index * 7));
      const remainingDays = Math.floor((referenceDate.getTime() - bucketStart.getTime()) / DAY_MS);
      const bucketEnd = endOfDay(shiftDays(bucketStart, Math.min(6, Math.max(remainingDays, 0))));
      const totals = sumAmounts(
        activeOrders.filter((order) => {
          const date = safeParseDate(order.date);
          return date && date >= bucketStart && date <= bucketEnd;
        }),
      );

      return {
        label: `Sem ${index + 1}`,
        ...totals,
      };
    });
  }

  const rangeStart = startOfDay(shiftDays(referenceDate, -6));

  return Array.from({ length: 7 }, (_, index) => {
    const bucketDate = startOfDay(shiftDays(rangeStart, index));
    const totals = sumAmounts(
      activeOrders.filter((order) => {
        const date = safeParseDate(order.date);
        return date && startOfDay(date).getTime() === bucketDate.getTime();
      }),
    );

    return {
      label: WEEKDAY_LABELS[bucketDate.getDay()],
      ...totals,
    };
  });
}

export async function fetchDashboardData(period: Period): Promise<DashboardData> {
  try {
    if (USE_MOCK) {
      console.log("[Dashboard] Using mock data (NEXT_PUBLIC_USE_MOCK=true)");
      return mockDashboardData;
    }

    const [usersData, orders, companiesResponse] = await Promise.all([
      odooGet<{ data: unknown[] }>("/api/billnova-users", {
        cache: "no-store",
      }),
      fetchSystemOrders().catch((error) => {
        console.warn("[Dashboard] Orders data unavailable, using empty series", error);
        return [] as Order[];
      }),
      fetch("/api/companies", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok) return [] as DashboardCompanyApi[];
          const payload = await response.json();
          return (payload?.data || payload?.companies || []) as DashboardCompanyApi[];
        })
        .catch((error) => {
          console.warn("[Dashboard] Companies data unavailable, inferring from users", error);
          return [] as DashboardCompanyApi[];
        }),
    ]);

    const users = (usersData?.data || []) as DashboardUserApi[];
    const companies = companiesResponse;
    const referenceDate = getReferenceDate(orders);
    const { currentStart, currentEnd, previousStart, previousEnd } = getPeriodRange(period, referenceDate);
    const currentOrders = filterOrdersByRange(orders, currentStart, currentEnd);
    const previousOrders = filterOrdersByRange(orders, previousStart, previousEnd);

    const recentUsers: RecentUser[] = users.slice(0, 5).map((user) => ({
      id: String(user.id),
      name: String(user.name ?? "Usuario"),
      email: String(user.email ?? ""),
      role: user.is_mobile_user ? "user" : "admin",
      status: "active",
      joinedAt: new Date().toISOString().split("T")[0],
    }));

    const activeUsers = countActiveUsers(users);
    const currentUsersCreated = countEntitiesInRange(users, currentStart, currentEnd);
    const totalUsersBeforeCurrent = Math.max(users.length - currentUsersCreated, 0);
    const totalUsersChange = calculateChange(users.length, totalUsersBeforeCurrent);
    const activeUsersBeforeCurrent = Math.max(activeUsers - currentUsersCreated, 0);
    const activeUsersChange = calculateChange(activeUsers, activeUsersBeforeCurrent);

    const currentCompaniesCreated = companies.length
      ? countEntitiesInRange(companies, currentStart, currentEnd)
      : new Set(
          users
            .filter((user) => {
              const date = getEntityDate(user);
              return date && date >= currentStart && date <= currentEnd;
            })
            .map((user) => normalizeCompanyId(user.company_id))
            .filter(Boolean),
        ).size;
    const totalCompanies = companies.length || getUniqueCompaniesFromUsers(users).size;
    const totalCompaniesBeforeCurrent = Math.max(totalCompanies - currentCompaniesCreated, 0);
    const totalCompaniesChange = calculateChange(totalCompanies, totalCompaniesBeforeCurrent);

    const currentRevenue = sumOrderTotals(currentOrders);
    const previousRevenue = sumOrderTotals(previousOrders);
    const revenueChange = calculateChange(currentRevenue, previousRevenue);

    const pendingInvoices = countPendingOrders(currentOrders);
    const previousPendingInvoices = countPendingOrders(previousOrders);
    const pendingChange = calculateChange(pendingInvoices, previousPendingInvoices);

    const overdueInvoices = countOverdueOrders(currentOrders, referenceDate);
    const previousOverdueInvoices = countOverdueOrders(previousOrders, previousEnd);
    const overdueChange = calculateChange(overdueInvoices, previousOverdueInvoices);

    const changeLabel = period === "week"
      ? "vs semana anterior"
      : period === "month"
        ? "vs mes anterior"
        : "vs ano anterior";

    const stats: StatCard[] = [
      {
        id: "total-users",
        label: "Usuarios registrados",
        value: users.length,
        change: totalUsersChange,
        changeLabel,
        type: "users",
      },
      {
        id: "active-users",
        label: "Usuarios activos",
        value: activeUsers,
        change: activeUsersChange,
        changeLabel,
        type: "users",
      },
      {
        id: "total-companies",
        label: "Empresas",
        value: totalCompanies,
        change: totalCompaniesChange,
        changeLabel,
        type: "revenue",
      },
      {
        id: "monthly-revenue",
        label: period === "week" ? "Ingresos semanales" : period === "month" ? "Ingresos del periodo" : "Ingresos anuales",
        value: `$${currentRevenue.toLocaleString()}`,
        change: revenueChange,
        changeLabel,
        type: "revenue",
      },
      {
        id: "pending-invoices",
        label: "Facturas pendientes",
        value: pendingInvoices,
        change: pendingChange,
        changeLabel,
        type: "pending",
      },
      {
        id: "overdue-invoices",
        label: "Facturas vencidas",
        value: overdueInvoices,
        change: overdueChange,
        changeLabel,
        type: "overdue",
      },
    ];

    const recentActivity: RecentActivity[] = [
      {
        id: "activity-1",
        type: "user_created",
        description: "Nuevo usuario registrado",
        user: recentUsers[0]?.name || "Usuario",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "activity-2",
        type: "invoice_paid",
        description: "Factura pagada",
        user: recentUsers[1]?.name || "Usuario",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "activity-3",
        type: "moderator_added",
        description: "Moderador asignado",
        user: "Sistema",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "activity-4",
        type: "report_flagged",
        description: "Reporte marcado",
        user: "Sistema",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "activity-5",
        type: "invoice_overdue",
        description: "Factura vencida",
        user: recentUsers[2]?.name || "Usuario",
        timestamp: new Date(Date.now() - 259200000).toISOString(),
      },
    ];

    const chartData = buildChartData(period, orders);

    return {
      stats,
      recentUsers,
      recentActivity,
      chartData,
      totalUsers: users.length,
      totalModerators: users.filter((user) => !user.is_mobile_user).length,
      systemHealth: 98 + Math.floor(Math.random() * 2),
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return mockDashboardData;
  }
}
