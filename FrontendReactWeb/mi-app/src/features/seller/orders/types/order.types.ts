// src/feature/orders/types/order.types.ts

export type OrderStatus = "pending" | "sent" | "delivered" | "cancelled";

export interface OrderLine {
  id: string;
  productName: string;
  quantity: number;
  priceUnit: number;
}

export interface Order {
  id:      string;
  client:  string;
  product: string;
  qty:     number;
  total:   number;
  date:    string;
  status:  OrderStatus;
  address: string;
  phone:   string;
  email?: string;
  invoiceStatus?: string;
  lines?: OrderLine[];
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   "Pendiente",
  sent:      "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "sent",
  "delivered",
  "cancelled",
];
