import { getActiveCompanyId } from "@/features/seller/shared/companySession";
import { Order, OrderLine, OrderStatus } from "../types/order.types";

const BASE_URL = (process.env.NEXT_PUBLIC_ODOO_URL ?? "http://localhost:8079").replace(/\/+$/, "");

function debugLog(label: string, payload?: unknown) {
  console.log(`[seller/orders] ${label}`, payload);
}

function getCompanyId(): number | null {
  if (typeof window === "undefined") return null;

  try {
    const companyId = getActiveCompanyId();
    debugLog("resolved company id", { companyId });
    return companyId;
  } catch (error) {
    debugLog("error reading company id", error);
    return null;
  }
}

export async function fetchOrders(): Promise<Order[]> {
  const companyId = getCompanyId();
  const qs = companyId ? `?company_id=${encodeURIComponent(String(companyId))}` : "";
  const url = `${BASE_URL}/api/pos/orders${qs}`;

  debugLog("fetchOrders request", { url, companyId });

  const res = await fetch(url, { cache: "no-store", credentials: "include" });
  if (!res.ok) throw new Error("Error al obtener pedidos");

  const json = await res.json();
  debugLog("fetchOrders raw response", json);

  const rawOrders = Array.isArray(json)
    ? json
    : json?.ok && Array.isArray(json.data)
      ? json.data
      : Array.isArray(json?.data)
        ? json.data
        : null;

  if (!rawOrders) throw new Error("Respuesta inesperada al obtener pedidos");

  const filteredByCompany = companyId
    ? rawOrders.filter((order: any) => String(order?.company_id ?? "") === String(companyId))
    : rawOrders;

  const normalizeStatus = (status: unknown): OrderStatus => {
    switch (String(status ?? "").toLowerCase()) {
      case "sent":
      case "enviado":
        return "sent";
      case "delivered":
      case "pagada":
      case "paid":
      case "entregado":
        return "delivered";
      case "cancelled":
      case "cancelado":
      case "cancelada":
        return "cancelled";
      case "pending":
      case "pendiente":
      case "vencida":
      case "borrador":
      case "draft":
      default:
        return "pending";
    }
  };

  return filteredByCompany.map((order: any): Order => {
    const lines: OrderLine[] = Array.isArray(order?.lines)
      ? order.lines.map((line: any) => ({
          id: String(line?.id ?? ""),
          productName: String(line?.productName ?? ""),
          quantity: Number(line?.quantity ?? 0),
          priceUnit: Number(line?.priceUnit ?? 0),
        }))
      : [];

    const firstLine = lines[0] ?? {};
    const qtyFromLines = lines.reduce((acc: number, line) => acc + Number(line?.quantity ?? 0), 0);

    return {
      id: String(order?.id ?? ""),
      client: String(order?.client ?? ""),
      product: String(order?.product ?? firstLine?.productName ?? ""),
      qty: Number.isFinite(Number(order?.qty)) ? Number(order.qty) : qtyFromLines,
      total: Number(order?.total ?? 0),
      date: String(order?.date ?? ""),
      status: normalizeStatus(order?.status),
      address: String(order?.address ?? ""),
      phone: String(order?.phone ?? ""),
      email: String(order?.clienteEmail ?? order?.email ?? ""),
      invoiceStatus: String(order?.invoice_status ?? order?.status ?? ""),
      orderState: String(order?.order_state ?? ""),
      lines,
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

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<{ id: string; status: OrderStatus }> {
  const res = await fetch(`${BASE_URL}/api/pos/orders/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  if (!res.ok) {
    let message = "Error al actualizar estado";
    try {
      const payload = await res.json();
      if (payload?.error) {
        message = String(payload.error);
      }
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function deleteOrder(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/api/pos/orders/${id}`, { method: "DELETE", credentials: "include" });
  if (!res.ok) throw new Error("Error al eliminar pedido");
  return res.json();
}
