import { ODOO_URL as baseUrl } from "@/lib/odooApi";
import type { Producto } from "../types/productos.types";
import { getActiveCompanyId } from "@/features/seller/shared/companySession";
import { getStoredAuthState } from "@/features/auth/login/data/storage";

function jsonHeaders(): HeadersInit {
  const sessionToken = getStoredAuthState()?.sessionToken;
  return {
    "Content-Type": "application/json",
    ...(sessionToken ? { "X-Auth-Session": sessionToken } : {}),
  };
}

function getCompanyId(): number | null {
  if (typeof window === "undefined") return null;

  const scopedCompanyId = getActiveCompanyId();
  if (scopedCompanyId) return scopedCompanyId;

  const authCompanyId = getStoredAuthState()?.companyId;
  return typeof authCompanyId === "number" && Number.isFinite(authCompanyId) && authCompanyId > 0
    ? authCompanyId
    : null;
}

async function checkResponse<T>(res: Response): Promise<T> {
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status}`);
  }

  if (json.success === false || json.ok === false) {
    throw new Error(json.message || json.error || "Error en API");
  }

  return json.data ?? json;
}

function requestInit(init: RequestInit = {}): RequestInit {
  return {
    credentials: "include",
    ...init,
  };
}

function mapProducto(product: any): Producto {
  const stock = product.quantity_on_hand ?? product.stock ?? product.qty_available ?? 0;
  const imageUrls = Array.isArray(product.image_urls)
    ? product.image_urls.filter((value: unknown): value is string => typeof value === "string" && value.length > 0)
    : product.image_url
      ? [String(product.image_url)]
      : [];

  return {
    id: String(product.id),
    nombre: product.name ?? "",
    sku: product.default_code ?? "",
    categoria: product.category_name ?? "Electronica",
    stock,
    stockStatus: stock === 0 ? "agotado" : stock < 5 ? "bajo" : "ok",
    precio: product.list_price ?? 0,
    costo: product.cost_price ?? product.standard_price ?? 0,
    proveedor: product.seller_ids?.[0]?.name?.name ?? "",
    ultimaActualizacion: product.write_date ?? new Date().toISOString().split("T")[0],
    imageUrl: imageUrls[0] ?? "",
    imageUrls,
  };
}

export async function apiListProductos(): Promise<Producto[]> {
  const companyId = getCompanyId();
  const url = companyId
    ? `${baseUrl}/api/products?company_id=${encodeURIComponent(String(companyId))}`
    : `${baseUrl}/api/products`;

  const res = await fetch(url, requestInit({ headers: jsonHeaders() }));
  const data = await checkResponse<any>(res);

  return data.map(mapProducto);
}

export async function apiGetProducto(id: number): Promise<Producto> {
  const res = await fetch(`${baseUrl}/api/products/${id}`, requestInit({ headers: jsonHeaders() }));
  const product = await checkResponse<any>(res);
  return mapProducto(product);
}

export async function apiCreateProducto(payload: Partial<Producto>): Promise<{ id: number }> {
  const body: any = {};
  if (payload.nombre) body.name = payload.nombre;
  if (payload.sku) body.default_code = payload.sku;
  if (payload.precio !== undefined) body.list_price = payload.precio;
  if (payload.costo !== undefined) body.cost_price = payload.costo;
  if (payload.stock !== undefined) body.quantity = payload.stock;
  if (payload.categoria) body.category = payload.categoria;
  if (payload.proveedor) body.supplier = payload.proveedor;
  if ("imageDataUrls" in payload) body.image_data_urls = payload.imageDataUrls || [];
  else if ("imageDataUrl" in payload) body.image_data_url = payload.imageDataUrl || null;

  const companyId = getCompanyId();
  if (!companyId) {
    throw new Error("No se encontro la empresa del usuario actual. Registra o vincula una empresa primero.");
  }
  body.company_id = companyId;

  const res = await fetch(`${baseUrl}/api/products/create`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
    credentials: "include",
  });

  return checkResponse<{ id: number }>(res);
}

export async function apiUpdateProducto(id: number, payload: Partial<Producto>): Promise<void> {
  const body: any = {};
  if (payload.nombre) body.name = payload.nombre;
  if (payload.sku) body.default_code = payload.sku;
  if (payload.precio !== undefined) body.list_price = payload.precio;
  if (payload.costo !== undefined) body.cost_price = payload.costo;
  if (payload.stock !== undefined) body.quantity = payload.stock;
  if (payload.categoria) body.category = payload.categoria;
  if (payload.proveedor) body.supplier = payload.proveedor;
  if ("imageDataUrls" in payload) body.image_data_urls = payload.imageDataUrls || [];
  else if ("imageDataUrl" in payload) body.image_data_url = payload.imageDataUrl || null;

  const companyId = getCompanyId();
  if (companyId) body.company_id = companyId;

  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
    credentials: "include",
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

export async function apiListCategorias(): Promise<{ id: number; name: string }[]> {
  const companyId = getCompanyId();
  const url = companyId
    ? `${baseUrl}/api/categories?company_id=${encodeURIComponent(String(companyId))}`
    : `${baseUrl}/api/categories`;

  try {
    const res = await fetch(url, requestInit({ headers: jsonHeaders() }));
    if (!res.ok) throw new Error("fallback");
    const json = await res.json();
    if (!json.ok) throw new Error("fallback");
    return json.data as { id: number; name: string }[];
  } catch {
    const productos = await apiListProductos();
    const seen = new Map<string, number>();
    productos.forEach((product, index) => {
      if (product.categoria && !seen.has(product.categoria)) seen.set(product.categoria, index);
    });
    return Array.from(seen.entries()).map(([name, id]) => ({ id, name }));
  }
}
