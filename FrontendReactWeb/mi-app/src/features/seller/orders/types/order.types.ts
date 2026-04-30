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
  orderState?: string;
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

export function getNextOrderActions(order: Order): OrderStatus[] {
  const actions: OrderStatus[] = [];

  if (order.status !== "sent") {
    actions.push("sent");
  }
  if (order.status !== "delivered") {
    actions.push("delivered");
  }
  if (order.status !== "pending") {
    actions.push("pending");
  }
  if (order.status !== "cancelled") {
    actions.push("cancelled");
  }

  return actions;
}

export function getOrderStateForStatus(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "draft";
    case "sent":
      return "paid";
    case "delivered":
      return "done";
    case "cancelled":
      return "cancel";
    default:
      return "";
  }
}
