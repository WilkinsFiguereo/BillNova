// This file is .ts only (no JSX). Icons are stored as references (LucideIcon) and rendered in UI.
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
  Settings,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { dashboardTheme as t } from "../theme/dashboard.theme";

export interface StatCardData {
  label: string;
  value: string;
  Icon: LucideIcon;
  delta: string;
  color: string;
  bg: string;
}

export const STATS_DATA: StatCardData[] = [
  {
    label: "Total Productos",
    value: "248",
    Icon: Package,
    delta: "+12 este mes",
    color: t.brand400,
    bg: t.brand100,
  },
  {
    label: "Stock Critico",
    value: "9",
    Icon: AlertTriangle,
    delta: "3 agotados",
    color: t.warning,
    bg: t.warningBg,
  },
  {
    label: "Facturas Emitidas",
    value: "134",
    Icon: FileText,
    delta: "+8 hoy",
    color: t.success,
    bg: t.successBg,
  },
  {
    label: "Cobros Pendientes",
    value: "$24.8K",
    Icon: DollarSign,
    delta: "18 facturas",
    color: t.error,
    bg: t.errorBg,
  },
];

export const CHART_SERIES = {
  ventas: [40, 55, 45, 60, 52, 70, 68],
  cobros: [30, 42, 38, 55, 60, 58, 72],
  pendientes: [20, 18, 25, 22, 30, 28, 35],
  vencidas: [5, 8, 6, 9, 7, 10, 8],
};

export interface NavItemData {
  id: string;
  Icon: LucideIcon;
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItemData[] = [
  { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard", href: "/navigation/seller/dashboard/page" },
  { id: "productos", Icon: Package, label: "Productos", href: "/navigation/seller/product/page" },
  { id: "servicios", Icon: Wrench, label: "Servicios", href: "/navigation/seller/services/page" },
  { id: "orders", Icon: ShoppingCart, label: "Pedidos", href: "/navigation/seller/orders/page" },
  { id: "facturas", Icon: FileText, label: "Facturas", href: "/navigation/seller/bill/page" },
  { id: "empresa", Icon: Building, label: "Empresa", href: "/navigation/seller/company_config/page" },
  { id: "registro", Icon: Building2, label: "Registro", href: "/navigation/seller/company_register/page" },
  { id: "reportes", Icon: BarChart2, label: "Reportes", href: "/navigation/seller/reports/page" },
  { id: "config", Icon: Settings, label: "Configuracion", href: "/navigation/seller/settings/page" },
];
