import { BarChart2, Building2, LineChart, LayoutDashboard, Package, Settings } from "lucide-react";
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
    id: "config",
    Icon: Settings,
    label: "Configuración",
    href: "/navigation/config/page",
  },
];
