import {
  Building2,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Tag,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItemData {
  id: string;
  Icon: LucideIcon;
  label: string;
  href: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItemData[] = [
  {
    id: "dashboard",
    Icon: LayoutDashboard,
    label: "Dashboard",
    href: "/navigation/admin/dashboard/page",
  },
  {
    id: "categorias",
    Icon: Tag,
    label: "Categorías",
    href: "/navigation/admin/category/page",
  },
  {
    id: "usuarios",
    Icon: Users,
    label: "Usuarios",
    href: "/navigation/admin/users/page",
  },
  {
    id: "empresas",
    Icon: Building2,
    label: "Empresas",
    href: "/navigation/admin/companies/page",
  },
  {
    id: "productos",
    Icon: Package,
    label: "Productos",
    href: "/navigation/admin/products/page",
  },
  {
    id: "reportes",
    Icon: FileText,
    label: "Reportes",
    href: "/navigation/admin/reports/page",
  },
  {
    id: "configuracion",
    Icon: Settings,
    label: "Configuracion",
    href: "/navigation/admin/configuracion/page",
  },
];
