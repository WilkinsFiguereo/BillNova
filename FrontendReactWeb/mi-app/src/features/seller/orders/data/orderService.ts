// src/feature/orders/data/orderService.ts

import { Order, OrderStatus } from "../types/order.types";
import mockOrders from "./mockOrders";

const BASE_URL = (process.env.NEXT_PUBLIC_ODOO_URL ?? "https://jwfn4vcd-8079.use2.devtunnels.ms/").replace(/\/+$/, "");

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/api/orders`, { cache: "no-store", credentials: "include" });
  if (!res.ok) throw new Error("Error al obtener pedidos");
  return res.json();
}

export async function createOrder(payload: {
  client: string;
  product: string;
  qty: number;
  price_unit: number;
  phone?: string;
  address?: string;
  email?: string;
}): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al crear pedido");
  return res.json();
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<{ id: string; status: OrderStatus }> {
  const res = await fetch(`${BASE_URL}/api/orders/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al actualizar estado");
  return res.json();
}

export async function deleteOrder(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/api/orders/${id}`, { method: "DELETE", credentials: "include" });
  if (!res.ok) throw new Error("Error al eliminar pedido");
  return res.json();
}
