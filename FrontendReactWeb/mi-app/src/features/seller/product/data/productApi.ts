// src/features/product/data/productApi.ts

import odooConfig from "../../../../lib/odooConfig";
import type { Producto } from "../types/productos.types";

const { baseUrl } = odooConfig;

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

function getCompanyId(): number | null {
  // Seller flow stores the company id in the browser session after registration.
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.sessionStorage.getItem("billnova_company_id") ??
      window.localStorage.getItem("billnova_company_id"); // fallback para migración
    const id = raw ? Number(raw) : NaN;
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

async function checkResponse<T>(res: Response): Promise<T> {
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status}`);
  }

  // aceptar success o ok
  if (json.success === false || json.ok === false) {
    throw new Error(json.message || json.error || "Error en API");
  }

  return json.data ?? json;
}

// ───────────────────────────
// API helpers for productos
// ───────────────────────────

export async function apiListProductos(): Promise<Producto[]> {
  const companyId = getCompanyId();
  const url = companyId
    ? `${baseUrl}/api/products?company_id=${encodeURIComponent(String(companyId))}`
    : `${baseUrl}/api/products`;

  const res = await fetch(url, {
    headers: jsonHeaders(),
  });

  const data = await checkResponse<any>(res);

  return data.map((p: any) => {
    const stock = p.quantity_on_hand ?? p.stock ?? 0;

    return {
      id: String(p.id),
      nombre: p.name ?? "",
      sku: p.default_code ?? "",
      categoria: (p.categ_id?.name ?? "Electrónica"),
      stock,
      stockStatus: stock === 0 ? "agotado" : stock < 5 ? "bajo" : "ok",
      precio: p.list_price ?? 0,
      costo: p.cost_price ?? p.standard_price ?? 0,
      proveedor: p.seller_ids?.[0]?.name?.name ?? "",
      ultimaActualizacion:
        p.write_date ?? new Date().toISOString().split("T")[0],
    };
  });
}

export async function apiGetProducto(id: number): Promise<Producto> {
  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    headers: jsonHeaders(),
  });
  const p = await checkResponse<any>(res);
  const stock = p.quantity_on_hand ?? p.stock ?? 0;
  return {
    id: String(p.id),
    nombre: p.name ?? "",
    sku: p.default_code ?? "",
    categoria: (p.categ_id?.name ?? "Electrónica") as Producto["categoria"],
    stock: stock,
    stockStatus: stock === 0 ? "agotado" : stock < 5 ? "bajo" : "ok",
    precio: p.list_price ?? 0,
    costo: p.cost_price ?? p.standard_price ?? 0,
    proveedor: p.seller_ids?.[0]?.name?.name ?? "",
    ultimaActualizacion: p.write_date ?? new Date().toISOString().split('T')[0],
  };
}

export async function apiCreateProducto(payload: Partial<Producto>): Promise<{ id: number }> {
  // Map frontend model to backend fields
  const body: any = {};
  if (payload.nombre) body.name = payload.nombre;
  if (payload.sku) body.default_code = payload.sku;
  if (payload.precio !== undefined) body.list_price = payload.precio;
  if (payload.costo !== undefined) body.cost_price = payload.costo;
  if (payload.stock !== undefined) body.quantity = payload.stock;
  if (payload.categoria) body.category = payload.categoria;
  if (payload.proveedor) body.supplier = payload.proveedor;

  const companyId = getCompanyId();
  if (!companyId) {
    throw new Error("No se encontr\u00f3 la empresa (billnova_company_id). Registra/configura tu empresa primero.");
  }
  body.company_id = companyId;

  const res = await fetch(`${baseUrl}/api/products/create`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  return checkResponse<{ id: number }>(res);
}

export async function apiUpdateProducto(
  id: number,
  payload: Partial<Producto>
): Promise<void> {
  const body: any = {};
  if (payload.nombre) body.name = payload.nombre;
  if (payload.sku) body.default_code = payload.sku;
  if (payload.precio !== undefined) body.list_price = payload.precio;
  if (payload.costo !== undefined) body.cost_price = payload.costo;
  if (payload.stock !== undefined) body.quantity = payload.stock;
  if (payload.categoria) body.category = payload.categoria;
  if (payload.proveedor) body.supplier = payload.proveedor;

  const companyId = getCompanyId();
  if (companyId) body.company_id = companyId;

  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  await checkResponse(res);
}

export async function apiDeleteProducto(id: number): Promise<void> {
  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: jsonHeaders(),
  });
  await checkResponse(res);
}
