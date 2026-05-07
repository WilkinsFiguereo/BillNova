import {
  BarChart2,
  Building2,
  FileText,
  LayoutDashboard,
  Package,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItemData {
  label: string;
  href: string;
  Icon: LucideIcon;
}

export const USERS_NAV_ITEMS: NavItemData[] = [
  { label: "Dashboard", href: "/navigation/admin/dashboard/page", Icon: LayoutDashboard },
  { label: "Usuarios", href: "/navigation/admin/users/page", Icon: Users },
  { label: "Empresas", href: "/navigation/admin/companies/page", Icon: Building2 },
  { label: "Productos", href: "/navigation/admin/products/page", Icon: Package },
  { label: "Est. productos", href: "/navigation/admin/stats_products/page", Icon: TrendingUp },
  { label: "Est. empresas", href: "/navigation/admin/stats_companies/page", Icon: BarChart2 },
  { label: "Reportes", href: "/navigation/admin/reports/page", Icon: FileText },
];
