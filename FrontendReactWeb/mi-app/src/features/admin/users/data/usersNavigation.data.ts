import {
  Building2,
  FileText,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItemData {
  label: string;
  href:  string;
  Icon: LucideIcon;
}

export const USERS_NAV_ITEMS: NavItemData[] = [
  { label: "Dashboard", href: "/navigation/admin/dashboard/page", Icon: LayoutDashboard },
  { label: "Usuarios", href: "/navigation/admin/users/page", Icon: Users },
  { label: "Empresas", href: "/navigation/admin/companies/page", Icon: Building2 },
  { label: "Productos", href: "/navigation/admin/products/page", Icon: Package },
  { label: "Reportar Problemas", href: "/navigation/reports/page", Icon: FileText },
];

