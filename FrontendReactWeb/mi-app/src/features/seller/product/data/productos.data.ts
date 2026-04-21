// archivo de datos viejo. Actualmente la aplicación obtiene la información del backend.
// conservamos la constante de categorías para compatibilidad posterior si se necesita.

import type { LucideIcon } from "lucide-react";
import { Package, TrendingUp, AlertTriangle, CheckCircle, XCircle, Tag } from "lucide-react";
import { productosTheme as t } from "../theme/productos.theme";
import type { Producto } from "../types/productos.types";

export const PRODUCTOS_DATA: Producto[] = [];

export const CATEGORIAS = [
  "Todas",
  "Electrónica",
  "Periféricos",
  "Audio",
  "Mobiliario",
  "Accesorios",
] as const;

export interface ProductoStatCardDef {
  label: string;
  value: string;
  Icon: LucideIcon;
  delta: string;
  color: string;
  bg: string;
}

export const PRODUCTO_STATS_CARDS: ProductoStatCardDef[] = [
  {
    label: "Total Productos",
    value: "248",
    Icon: Package,
    delta: "+12 este mes",
    color: t.brand400,
    bg: t.brand100,
  },
  {
    label: "En Stock",
    value: "186",
    Icon: CheckCircle,
    delta: "+5 esta semana",
    color: t.success,
    bg: t.successBg,
  },
  {
    label: "Bajo Stock",
    value: "42",
    Icon: AlertTriangle,
    delta: "Revisión needed",
    color: t.warning,
    bg: t.warningBg,
  },
  {
    label: "Sin Stock",
    value: "20",
    Icon: TrendingUp,
    delta: "-3 esta semana",
    color: t.error,
    bg: t.errorBg,
  },
];

export const PRODUCTO_STATS: ProductoStatCardDef[] = [
  {
    label: "Total Productos",
    value: "248",
    Icon: Package,
    delta: "+12 este mes",
    color: t.brand400,
    bg: t.brand100,
  },
  {
    label: "Stock Bajo",
    value: "3",
    Icon: AlertTriangle,
    delta: "Requieren reorden",
    color: t.warning,
    bg: t.warningBg,
  },
  {
    label: "Agotados",
    value: "2",
    Icon: XCircle,
    delta: "Sin existencias",
    color: t.error,
    bg: t.errorBg,
  },
  {
    label: "Categorías",
    value: "5",
    Icon: Tag,
    delta: "Activas",
    color: t.success,
    bg: t.successBg,
  },
];