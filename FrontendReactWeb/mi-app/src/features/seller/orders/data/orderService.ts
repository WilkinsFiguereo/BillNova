// src/feature/orders/data/orderService.ts

import { Order, OrderStatus } from "../types/order.types";
import mockOrders from "./mockOrders";

const BASE_URL = (process.env.NEXT_PUBLIC_ODOO_URL ?? "http://localhost:8079").replace(/\/+$/, "");

function getCompanyId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.sessionStorage.getItem("billnova_company_id") ??
      window.localStorage.getItem("billnova_company_id"); // fallback migración
    const id = raw ? Number(raw) : NaN;
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export async function fetchOrders(): Promise<Order[]> {
  const companyId = getCompanyId();
  const qs = companyId ? `?company_id=${encodeURIComponent(String(companyId))}` : "";
  const res = await fetch(`${BASE_URL}/api/pos/orders${qs}`, { cache: "no-store", credentials: "include" });
  if (!res.ok) throw new Error("Error al obtener pedidos");
  const json = await res.json();
  // Backend responde en forma: { ok: true, data: Order[] }
  const rawOrders = Array.isArray(json)
    ? json
    : json?.ok && Array.isArray(json.data)
      ? json.data
      : Array.isArray(json?.data)
        ? json.data
        : null;

  if (!rawOrders) throw new Error("Respuesta inesperada al obtener pedidos");

  // Seguridad extra: si por cualquier razón el backend no filtró,
  // filtramos en frontend por `company_id` cuando exista.
  const filteredByCompany = companyId
    ? rawOrders.filter((o: any) => String(o?.company_id ?? "") === String(companyId))
    : rawOrders;

  // Normalización defensiva: si el backend devuelve solo `lines`, la UI igual necesita top-level.
  return filteredByCompany.map((o: any): Order => {
    const lines = Array.isArray(o?.lines) ? o.lines : [];
    const firstLine = lines[0] ?? {};
    const qtyFromLines = lines.reduce((acc: number, l: any) => acc + Number(l?.quantity ?? 0), 0);

    return {
      id: String(o?.id ?? ""),
      client: String(o?.client ?? ""),
      product: String(o?.product ?? firstLine?.productName ?? ""),
      qty: Number.isFinite(Number(o?.qty)) ? Number(o.qty) : qtyFromLines,
      total: Number(o?.total ?? 0),
      date: String(o?.date ?? ""),
      status: (o?.status ?? "pending") as OrderStatus,
      address: String(o?.address ?? ""),
      phone: String(o?.phone ?? ""),
    };
  });
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
  const res = await fetch(`${BASE_URL}/api/pos/orders`, {
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
  const res = await fetch(`${BASE_URL}/api/pos/orders/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al actualizar estado");
  return res.json();
}

export async function deleteOrder(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/api/pos/orders/${id}`, { method: "DELETE", credentials: "include" });
  if (!res.ok) throw new Error("Error al eliminar pedido");
  return res.json();
}
