import { ODOO_URL as baseUrl } from "@/lib/odooApi";
import type { Producto } from "../types/productos.types";
import { getActiveCompanyId } from "@/features/seller/shared/companySession";

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

function getCompanyId(): number | null {
  return typeof window === "undefined" ? null : getActiveCompanyId();
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

export async function apiListProductos(): Promise<Producto[]> {
  const companyId = getCompanyId();
  const url = companyId
    ? `${baseUrl}/api/products?company_id=${encodeURIComponent(String(companyId))}`
    : `${baseUrl}/api/products`;

  const res = await fetch(url, { headers: jsonHeaders() });
  const data = await checkResponse<any>(res);

  return data.map((product: any) => {
    const stock = product.quantity_on_hand ?? product.stock ?? 0;

    return {
      id: String(product.id),
      nombre: product.name ?? "",
      sku: product.default_code ?? "",
      categoria: product.categ_id?.name ?? "Electrónica",
      stock,
      stockStatus: stock === 0 ? "agotado" : stock < 5 ? "bajo" : "ok",
      precio: product.list_price ?? 0,
      costo: product.cost_price ?? product.standard_price ?? 0,
      proveedor: product.seller_ids?.[0]?.name?.name ?? "",
      ultimaActualizacion: product.write_date ?? new Date().toISOString().split("T")[0],
    };
  });
}

export async function apiGetProducto(id: number): Promise<Producto> {
  const res = await fetch(`${baseUrl}/api/products/${id}`, { headers: jsonHeaders() });
  const product = await checkResponse<any>(res);
  const stock = product.quantity_on_hand ?? product.stock ?? 0;

  return {
    id: String(product.id),
    nombre: product.name ?? "",
    sku: product.default_code ?? "",
    categoria: (product.categ_id?.name ?? "Electrónica") as Producto["categoria"],
    stock,
    stockStatus: stock === 0 ? "agotado" : stock < 5 ? "bajo" : "ok",
    precio: product.list_price ?? 0,
    costo: product.cost_price ?? product.standard_price ?? 0,
    proveedor: product.seller_ids?.[0]?.name?.name ?? "",
    ultimaActualizacion: product.write_date ?? new Date().toISOString().split("T")[0],
  };
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

  const companyId = getCompanyId();
  if (!companyId) {
    throw new Error("No se encontró la empresa del usuario actual. Registra o vincula una empresa primero.");
  }
  body.company_id = companyId;

  const res = await fetch(`${baseUrl}/api/products/create`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
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

export async function apiListCategorias(): Promise<{ id: number; name: string }[]> {
  const companyId = getCompanyId();
  const url = companyId
    ? `${baseUrl}/api/categories?company_id=${encodeURIComponent(String(companyId))}`
    : `${baseUrl}/api/categories`;

  try {
    const res = await fetch(url, { headers: jsonHeaders() });
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
