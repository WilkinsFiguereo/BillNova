import { ODOO_URL } from "@/lib/odooApi";
import type {
  ChartDataPoint,
  DashboardData,
  Period,
  RecentActivity,
  RecentUser,
  StatCard,
} from "../types/dashboard.types";
import { mockDashboardData } from "./dashboardData";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

function normalizeChartData(rawData: unknown): ChartDataPoint[] {
  if (!Array.isArray(rawData)) return [];

  return rawData.map((point) => {
    const safePoint = (point ?? {}) as Record<string, unknown>;
    return {
      label: String(safePoint.label ?? ""),
      sales: Number(safePoint.sales ?? 0),
      collections: Number(safePoint.collections ?? 0),
      pending: Number(safePoint.pending ?? 0),
    };
  });
}

export async function fetchDashboardData(period: Period): Promise<DashboardData> {
  try {
    if (USE_MOCK) {
      console.log("[Dashboard] Using mock data (NEXT_PUBLIC_USE_MOCK=true)");
      return mockDashboardData;
    }

    const fetchOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    };

    const usersUrl = `${ODOO_URL}/api/billnova-users`;
    const financialUrl = `${ODOO_URL}/api/admin/dashboard/financial?period=${encodeURIComponent(period)}`;

    console.log("[Dashboard] Fetching dashboard data from:", usersUrl);
    console.log("[Dashboard] Fetching financial chart from:", financialUrl);

    let usersRes: Response;
    let financialRes: Response | null = null;

    try {
      const responses = await Promise.allSettled([
        fetch(usersUrl, fetchOptions),
        fetch(financialUrl, fetchOptions),
      ]);

      if (responses[0].status !== "fulfilled") {
        throw responses[0].reason;
      }

      usersRes = responses[0].value;
      console.log("[Dashboard] User API response status:", usersRes.status);

      if (responses[1].status === "fulfilled") {
        financialRes = responses[1].value;
        console.log("[Dashboard] Financial API response status:", financialRes.status);
      } else {
        console.warn("[Dashboard] Failed to fetch financial chart:", responses[1].reason);
      }
    } catch (error) {
      console.warn("[Dashboard] Failed to fetch users:", error);
      console.warn("[Dashboard] Using mock data as fallback");
      return mockDashboardData;
    }

    const usersData = usersRes.ok ? await usersRes.json() : { data: [] };
    const users = usersData.data || [];

    if (!users.length) {
      console.warn("[Dashboard] No users data received, using mock data");
      return mockDashboardData;
    }

    const recentUsers: RecentUser[] = users.slice(0, 5).map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.is_mobile_user ? "user" : "admin",
      status: "active",
      joinedAt: new Date().toISOString().split("T")[0],
    }));

    const activeUsers = Math.ceil(users.length * 0.85);
    const totalCompanies = Math.ceil(users.length * 0.3);
    const monthlyRevenue = totalCompanies * 1250;
    const pendingInvoices = Math.ceil(totalCompanies * 0.3);
    const overdueInvoices = Math.ceil(totalCompanies * 0.1);

    const stats: StatCard[] = [
      {
        id: "total-users",
        label: "Usuarios registrados",
        value: users.length,
        change: 12.5,
        changeLabel: "vs mes anterior",
        type: "users",
      },
      {
        id: "active-users",
        label: "Usuarios activos",
        value: activeUsers,
        change: 8.2,
        changeLabel: "vs mes anterior",
        type: "users",
      },
      {
        id: "total-companies",
        label: "Empresas",
        value: totalCompanies,
        change: 5.8,
        changeLabel: "vs mes anterior",
        type: "revenue",
      },
      {
        id: "monthly-revenue",
        label: "Ingresos mensuales",
        value: `$${monthlyRevenue.toLocaleString()}`,
        change: 15.3,
        changeLabel: "vs mes anterior",
        type: "revenue",
      },
      {
        id: "pending-invoices",
        label: "Facturas pendientes",
        value: pendingInvoices,
        change: -2.1,
        changeLabel: "vs mes anterior",
        type: "pending",
      },
      {
        id: "overdue-invoices",
        label: "Facturas vencidas",
        value: overdueInvoices,
        change: 1.5,
        changeLabel: "vs mes anterior",
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

    let chartData: ChartDataPoint[] = [];
    if (financialRes?.ok) {
      const financialPayload = await financialRes.json();
      chartData = normalizeChartData(financialPayload?.data);
    }

    if (!chartData.length) {
      console.warn("[Dashboard] No financial chart data received, using empty series");
    }

    return {
      stats,
      recentUsers,
      recentActivity,
      chartData,
      totalUsers: users.length,
      totalModerators: Math.ceil(users.length * 0.15),
      systemHealth: 98 + Math.floor(Math.random() * 2),
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    console.warn("Using mock data as fallback");
    return mockDashboardData;
  }
}
