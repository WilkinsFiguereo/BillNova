"use client";

import type { Producto } from "../types/productos.types";

const BASE_URL = (process.env.NEXT_PUBLIC_ODOO_URL ?? "https://jwfn4vcd-8079.use2.devtunnels.ms/").replace(/\/+$/, "");

function computeStockStatus(stock: number): Producto["stockStatus"] {
  if (stock <= 0) return "agotado";
  if (stock < 10) return "bajo";
  return "ok";
}

function normalizeProducto(raw: any): Producto {
  const stock = Number(raw?.stock ?? 0);
  const precio = Number(raw?.precio ?? raw?.price ?? 0);
  const costo = Number(raw?.costo ?? raw?.cost ?? 0);

  return {
    id: String(raw?.id ?? raw?.product_id ?? ""),
    nombre: String(raw?.nombre ?? raw?.name ?? ""),
    sku: String(raw?.sku ?? raw?.default_code ?? ""),
    categoria: (raw?.categoria ?? raw?.category ?? "Electrónica") as Producto["categoria"],
    stock,
    stockStatus: (raw?.stockStatus ?? raw?.stock_status ?? computeStockStatus(stock)) as Producto["stockStatus"],
    precio,
    costo,
    proveedor: String(raw?.proveedor ?? raw?.vendor ?? raw?.supplier ?? ""),
    ultimaActualizacion: String(raw?.ultimaActualizacion ?? raw?.last_update ?? raw?.write_date ?? new Date().toISOString()),
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { ...init, credentials: "include" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return parseJson<T>(res);
}

export async function apiListProductos(): Promise<Producto[]> {
  const data = await request<any[]>("/api/products", { method: "GET" });
  return (Array.isArray(data) ? data : []).map(normalizeProducto);
}

export async function apiCreateProducto(payload: Partial<Producto>): Promise<Producto> {
  const created = await request<any>("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return normalizeProducto(created);
}

export async function apiUpdateProducto(id: number, payload: Partial<Producto>): Promise<Producto> {
  const updated = await request<any>(`/api/products/${encodeURIComponent(String(id))}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return normalizeProducto(updated);
}

export async function apiDeleteProducto(id: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/products/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
  });
}

