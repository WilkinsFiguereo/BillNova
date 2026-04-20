import { ODOO_URL } from "@/lib/odooApi";
import type {
  ChartDataPoint,
  DashboardData,
  Period,
  RecentActivity,
  RecentUser,
  StatCard,
} from "../types/dashboard.types";

type ApiEnvelope<T> = { data?: T };

type BillnovaUserApi = {
  id: number;
  name: string;
  email: string;
  role?: string;
  is_mobile_user?: boolean;
  created_at?: string | null;
};

type CompanyApi = {
  id: number;
  name: string;
  created_at?: string | null;
};

type ProductApi = {
  id: number;
  name: string;
  moderation_status?: "pending" | "approved" | "rejected";
  created_at?: string | null;
};

type ReportApi = {
  id: string;
  estado: "pendiente" | "en_proceso" | "solucionado" | "rechazado" | "cerrado";
  usuario?: { nombre?: string };
  titulo?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

async function fetchData<T>(path: string): Promise<T> {
  const response = await fetch(`${ODOO_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

function getUserRole(role?: string, isMobileUser?: boolean): RecentUser["role"] {
  if ((role || "").toLowerCase() === "admin") return "admin";
  return isMobileUser ? "user" : "moderator";
}

function getPeriodMonths(period: Period) {
  switch (period) {
    case "week":
      return 3;
    case "year":
      return 12;
    default:
      return 6;
  }
}

function buildChartData(companies: CompanyApi[], products: ProductApi[], reports: ReportApi[], period: Period): ChartDataPoint[] {
  const months = getPeriodMonths(period);
  const now = new Date();
  const items = Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("es-DO", { month: "short" }),
      sales: 0,
      collections: 0,
      pending: 0,
    };
  });

  const byKey = new Map(items.map((item) => [item.key, item]));

  companies.forEach((company) => {
    if (!company.created_at) return;
    const date = new Date(company.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = byKey.get(key);
    if (bucket) bucket.sales += 1;
  });

  products.forEach((product) => {
    if (!product.created_at) return;
    const date = new Date(product.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = byKey.get(key);
    if (!bucket) return;
    bucket.collections += 1;
    if (product.moderation_status === "pending") {
      bucket.pending += 1;
    }
  });

  reports.forEach((report) => {
    const sourceDate = report.fechaCreacion || report.fechaActualizacion;
    if (!sourceDate) return;
    const date = new Date(sourceDate);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = byKey.get(key);
    if (bucket && report.estado === "pendiente") {
      bucket.pending += 1;
    }
  });

  return items;
}

export async function fetchDashboardData(period: Period): Promise<DashboardData> {
  const [billnovaUsersResponse, companiesResponse, productsResponse, reportsResponse] = await Promise.allSettled([
    fetchData<ApiEnvelope<BillnovaUserApi[]>>("/api/billnova-users"),
    fetchData<ApiEnvelope<CompanyApi[]>>("/api/companies"),
    fetchData<{ data?: ProductApi[] }>("/api/products"),
    fetchData<{ data?: ReportApi[] }>("/api/moderation/reports"),
  ]);

  const billnovaUsers =
    billnovaUsersResponse.status === "fulfilled" ? billnovaUsersResponse.value.data || [] : [];
  const companies = companiesResponse.status === "fulfilled" ? companiesResponse.value.data || [] : [];
  const products = productsResponse.status === "fulfilled" ? productsResponse.value.data || [] : [];
  const reports = reportsResponse.status === "fulfilled" ? reportsResponse.value.data || [] : [];

  if (
    billnovaUsersResponse.status === "rejected" &&
    companiesResponse.status === "rejected" &&
    productsResponse.status === "rejected" &&
    reportsResponse.status === "rejected"
  ) {
    throw new Error("No se pudo cargar la informacion real del dashboard.");
  }

  const recentUsers: RecentUser[] = [...billnovaUsers]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5)
    .map((user) => ({
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: getUserRole(user.role, user.is_mobile_user),
      status: "active",
      joinedAt: user.created_at ? user.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
    }));

  const pendingProducts = products.filter((product) => product.moderation_status === "pending").length;
  const overdueReports = reports.filter((report) => report.estado === "rechazado").length;

  const stats: StatCard[] = [
    {
      id: "total-users",
      label: "Usuarios registrados",
      value: billnovaUsers.length,
      change: 0,
      changeLabel: "datos reales",
      type: "users",
    },
    {
      id: "active-users",
      label: "Usuarios activos",
      value: billnovaUsers.length,
      change: 0,
      changeLabel: "datos reales",
      type: "users",
    },
    {
      id: "total-companies",
      label: "Empresas",
      value: companies.length,
      change: 0,
      changeLabel: "registradas",
      type: "revenue",
    },
    {
      id: "total-products",
      label: "Productos",
      value: products.length,
      change: 0,
      changeLabel: "catalogados",
      type: "invoices",
    },
    {
      id: "pending-products",
      label: "Productos pendientes",
      value: pendingProducts,
      change: 0,
      changeLabel: "moderacion",
      type: "pending",
    },
    {
      id: "reports",
      label: "Reportes abiertos",
      value: reports.filter((report) => report.estado === "pendiente" || report.estado === "en_proceso").length,
      change: overdueReports,
      changeLabel: "rechazados",
      type: "overdue",
    },
  ];

  const recentActivity: RecentActivity[] = reports
    .slice(0, 5)
    .map((report) => ({
      id: report.id,
      type:
        report.estado === "pendiente"
          ? "report_flagged"
          : report.estado === "solucionado"
            ? "invoice_paid"
            : "invoice_overdue",
      description: report.titulo || "Reporte actualizado",
      user: report.usuario?.nombre || "Sistema",
      timestamp: report.fechaActualizacion || report.fechaCreacion || new Date().toISOString(),
    }));

  return {
    stats,
    recentUsers,
    recentActivity,
    chartData: buildChartData(companies, products, reports, period),
    totalUsers: billnovaUsers.length,
    totalModerators: billnovaUsers.filter((user) => user.role === "moderation").length,
    systemHealth: Math.max(80, 100 - pendingProducts - overdueReports),
  };
}
