import { type LucideIcon } from "lucide-react";

export type ProductoStatus = "pending" | "approved" | "rejected";

export interface ProductoPendiente {
  id: string;
  nombre: string;
  sku: string;
  categoria: string | null;
  precio: number;
  costo: number;
  stock: number;
  descripcion: string;
  vendedor: string;
  vendedorEmail: string | null;
  fechaSubida: string;
  imagenColor: string; // color placeholder para simular imagen
  status: ProductoStatus;
  motivoRechazo?: string;
}

export interface ModerationStatCard {
  label: string;
  value: string;
  Icon: LucideIcon;
  delta: string;
  color: string;
  bg: string;
}

export interface ModerationCounters {
  todos: number;
  pending: number;
  approved: number;
  rejected: number;
}

export type FiltroStatus = "todos" | "pending" | "approved" | "rejected";

export interface AccionModeration {
  productoId: string;
  status: "approved" | "rejected";
  motivo?: string;
}
