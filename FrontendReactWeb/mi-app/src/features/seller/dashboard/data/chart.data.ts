// ✅ Este archivo es .ts puro — sin JSX
// Los iconos se guardan como referencia (LucideIcon) y se renderizan en la UI
import {
  Package,
  AlertTriangle,
  FileText,
  DollarSign,
  LayoutDashboard,
  BarChart2,
  ShoppingCart,
  Building,
  Building2,
  Briefcase,
  Settings,
  TrendingUp,
  TrendingDown,
  Calendar,
  type LucideIcon,
  Shield,
  Receipt,
} from "lucide-react";
import { dashboardTheme as t } from "../theme/dashboard.theme";

// ── Tipo de StatCard con icono como referencia ────────────────────────
export interface StatCardData {
  label: string;
  value: string;
  Icon: LucideIcon;   // referencia al componente, no JSX
  delta: string;
  color: string;
  bg: string;
}

export const STATS_DATA: StatCardData[] = [
  {
    label: "Total Ganado",
    value: "$0",
    Icon: TrendingUp,
    delta: "Este mes",
    color: "#10b981",
    bg: "#d1fae5",
  },
  {
    label: "Total Perdido",
    value: "$0",
    Icon: TrendingDown,
    delta: "Este mes",
    color: "#ef4444",
    bg: "#fee2e2",
  },
  {
    label: "Por Mes",
    value: "$0",
    Icon: Calendar,
    delta: "Mes actual",
    color: t.brand400,
    bg: t.brand100,
  },
  {
    label: "Stock Crítico",
    value: "0",
    Icon: AlertTriangle,
    delta: "Sin datos",
    color: t.warning,
    bg: t.warningBg,
  },
];

// ── Datos para mini-gráficas ─────────────────────────────────────────
export const CHART_SERIES = {
  ventas:     [40, 55, 45, 60, 52, 70, 68],
  cobros:     [30, 42, 38, 55, 60, 58, 72],
  pendientes: [20, 18, 25, 22, 30, 28, 35],
  vencidas:   [5,  8,  6,  9,  7,  10, 8 ],
};

// ── Nav items ────────────────────────────────────────────────────────
export interface NavItemData {
  id: string;
  Icon: LucideIcon;
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItemData[] = [
  { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard",     href: "/navigation/seller/dashboard/page"  },
  { id: "productos", Icon: Package,         label: "Productos",     href: "/navigation/seller/product/page"  },
  { id: "servicios", Icon: Briefcase,       label: "Servicios",     href: "/navigation/seller/services/page"  },
  { id: "orders",    Icon: ShoppingCart,    label: "Pedidos",       href: "/navigation/seller/orders/page"   },
  { id: "facturas",  Icon: FileText,        label: "Facturas",      href: "/navigation/seller/bill/page"   },
  { id: "empresa",   Icon: Building,        label: "Empresa",       href: "/navigation/seller/company_config/page" },
  { id: "registro",  Icon: Building2,       label: "Registro",      href: "/navigation/seller/company_register/page" },
  { id: "reportes",  Icon: BarChart2,       label: "Reportes",      href: "/navigation/seller/reports/page"   },
  { id: "bitacora",  Icon: Shield,          label: "Bitácora",      href: "/navigation/seller/bitacora/page"   },
  { id: "impuestos", Icon: Receipt,         label: "Impuestos",     href: "/navigation/seller/impuestos/page"   },
  { id: "config",    Icon: Settings,        label: "Configuración", href: "/navigation/config/page"     },
];
