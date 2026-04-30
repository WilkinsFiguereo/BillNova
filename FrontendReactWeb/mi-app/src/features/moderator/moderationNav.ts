import {
  BarChart2,
  Building2,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  TrendingUp,
} from "lucide-react";
import type { NavItemData } from "../seller/dashboard/data/chart.data";

export const MODERATOR_NAV_ITEMS: NavItemData[] = [
  {
    id: "dashboard",
    Icon: LayoutDashboard,
    label: "Dashboard",
    href: "/navigation/moderation/dashboard/page",
  },
  {
    id: "products",
    Icon: Package,
    label: "Productos",
    href: "/navigation/moderation/products/page",
  },
{
    id: "companies",
    Icon: Building2,
    label: "Gestion de empresa",
    href: "/navigation/moderation/companies/page",
  },
  {
    id: "stats_products",
    Icon: TrendingUp,
    label: "Est. productos",
    href: "/navigation/moderation/stats_products/page",
  },
  {
    id: "stats_companies",
    Icon: BarChart2,
    label: "Est. empresas",
    href: "/navigation/moderation/stats_companies/page",
  },
  {
    id: "reportes",
    Icon: FileText,
    label: "Reportes",
    href: "/navigation/moderation/reports/page",
  },
  {
    id: "config",
    Icon: Settings,
    label: "Configuracion",
    href: "/navigation/config?role=moderator",
  },
];
