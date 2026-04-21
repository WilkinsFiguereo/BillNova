import { odooGet } from "@/lib/odooApi";
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

export async function fetchDashboardData(period: Period): Promise<DashboardData> {
  try {
    if (USE_MOCK) {
      console.log("[Dashboard] Using mock data (NEXT_PUBLIC_USE_MOCK=true)");
      return mockDashboardData;
    }

    const usersData = await odooGet<{ data: unknown[] }>("/api/billnova-users", {
      cache: "no-store",
    });

    const users = usersData?.data || [];

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

    const chartData: ChartDataPoint[] = [
      { label: "Enero", sales: Math.floor(Math.random() * 1000) + 500, collections: Math.floor(Math.random() * 800) + 300, pending: Math.floor(Math.random() * 200) + 100 },
      { label: "Febrero", sales: Math.floor(Math.random() * 1200) + 600, collections: Math.floor(Math.random() * 900) + 400, pending: Math.floor(Math.random() * 250) + 100 },
      { label: "Marzo", sales: Math.floor(Math.random() * 1100) + 550, collections: Math.floor(Math.random() * 850) + 350, pending: Math.floor(Math.random() * 200) + 80 },
      { label: "Abril", sales: Math.floor(Math.random() * 1300) + 700, collections: Math.floor(Math.random() * 1000) + 500, pending: Math.floor(Math.random() * 180) + 90 },
      { label: "Mayo", sales: Math.floor(Math.random() * 1250) + 650, collections: Math.floor(Math.random() * 950) + 450, pending: Math.floor(Math.random() * 220) + 100 },
      { label: "Junio", sales: Math.floor(Math.random() * 1400) + 750, collections: Math.floor(Math.random() * 1050) + 550, pending: Math.floor(Math.random() * 200) + 95 },
      { label: "Julio", sales: Math.floor(Math.random() * 1350) + 700, collections: Math.floor(Math.random() * 1000) + 520, pending: Math.floor(Math.random() * 190) + 85 },
    ];

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
    return mockDashboardData;
  }
}
