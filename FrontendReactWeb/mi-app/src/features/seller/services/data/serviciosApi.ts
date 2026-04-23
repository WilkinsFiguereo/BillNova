import { ODOO_URL as baseUrl } from "@/lib/odooApi";
import type { Servicio } from "../types/servicios.types";
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

export async function apiListServicios(): Promise<Servicio[]> {
  const companyId = getCompanyId();
  const url = companyId
    ? `${baseUrl}/api/services?company_id=${encodeURIComponent(String(companyId))}`
    : `${baseUrl}/api/services`;

  const res = await fetch(url, { headers: jsonHeaders() });
  const data = await checkResponse<any>(res);

  return data.map((service: any) => ({
    id: String(service.id),
    nombre: service.name ?? "",
    descripcion: service.description ?? "",
    detalles: service.details ?? "",
    precio: service.price ?? 0,
    pagoFrecuencia: service.payment_frequency ?? "unico",
    status: service.active !== false ? "activo" : "inactivo",
    ultimaActualizacion: service.write_date ?? new Date().toISOString().split("T")[0],
    imageUrl: service.image_url ?? "",
  }));
}

export async function apiGetServicio(id: number): Promise<Servicio> {
  const res = await fetch(`${baseUrl}/api/services/${id}`, { headers: jsonHeaders() });
  const service = await checkResponse<any>(res);

  return {
    id: String(service.id),
    nombre: service.name ?? "",
    descripcion: service.description ?? "",
    detalles: service.details ?? "",
    precio: service.price ?? 0,
    pagoFrecuencia: service.payment_frequency ?? "unico",
    status: service.active !== false ? "activo" : "inactivo",
    ultimaActualizacion: service.write_date ?? new Date().toISOString().split("T")[0],
    imageUrl: service.image_url ?? "",
  };
}

export async function apiCreateServicio(payload: Partial<Servicio>): Promise<{ id: number }> {
  const body: any = {};
  if (payload.nombre) body.name = payload.nombre;
  if (payload.descripcion) body.description = payload.descripcion;
  if (payload.detalles) body.details = payload.detalles;
  if (payload.precio !== undefined) body.price = payload.precio;
  if (payload.pagoFrecuencia) body.payment_frequency = payload.pagoFrecuencia;
  if (payload.status) body.active = payload.status === "activo";
  if ("imageDataUrl" in payload) body.image_data_url = payload.imageDataUrl || null;

  const companyId = getCompanyId();
  if (!companyId) {
    throw new Error("No se encontró la empresa del usuario actual. Registra o vincula una empresa primero.");
  }
  body.company_id = companyId;

  const res = await fetch(`${baseUrl}/api/services/create`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
    credentials: "include",
  });

  return checkResponse<{ id: number }>(res);
}

export async function apiUpdateServicio(id: string, payload: Partial<Servicio>): Promise<void> {
  const body: any = {};
  if (payload.nombre) body.name = payload.nombre;
  if (payload.descripcion) body.description = payload.descripcion;
  if (payload.detalles) body.details = payload.detalles;
  if (payload.precio !== undefined) body.price = payload.precio;
  if (payload.pagoFrecuencia) body.payment_frequency = payload.pagoFrecuencia;
  if (payload.status) body.active = payload.status === "activo";
  if ("imageDataUrl" in payload) body.image_data_url = payload.imageDataUrl || null;

  const companyId = getCompanyId();
  if (companyId) body.company_id = companyId;

  const res = await fetch(`${baseUrl}/api/services/${id}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
    credentials: "include",
  });

  await checkResponse(res);
}

export async function apiDeleteServicio(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/api/services/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: jsonHeaders(),
  });

  await checkResponse(res);
}
