"use client";

const ODOO_URL = (process.env.NEXT_PUBLIC_ODOO_URL ?? "http://localhost:8079").replace(/\/+$/, "");

async function parseJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Respuesta no JSON desde el backend");
  }
  return response.json() as Promise<T>;
}

async function odooGet<T>(path: string): Promise<T> {
  const res = await fetch(`${ODOO_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseJson<T>(res);
}

async function odooPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${ODOO_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseJson<T>(res);
}

async function odooPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${ODOO_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseJson<T>(res);
}

export interface ApiCompany {
  id: number;
  name: string;
  legal_name: string;
  tax_id: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  founded_year: string;
  sales_history: { month: string; sales: number; orders: number }[];
  employees: ApiEmployee[];
}

export interface ApiEmployee {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: "active" | "disabled";
}

export const companyApi = {
  getConfig: (companyId?: string | number) => {
    const qs = companyId ? `?company_id=${encodeURIComponent(String(companyId))}` : "";
    return odooGet<{ ok: boolean; company?: ApiCompany }>(`/api/company/config${qs}`);
  },
  updateCompany: (payload: {
    companyId: string | number;
    name?: string;
    legalName?: string;
    rnc?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }) => odooPut<{ ok: boolean }>(`/api/company/config`, payload),
  listEmployees: (companyId: string | number) =>
    odooGet<{ ok: boolean; employees: ApiEmployee[] }>(`/api/company/employees?company_id=${encodeURIComponent(String(companyId))}`),
  createEmployee: (payload: {
    companyId: string | number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    status?: "active" | "disabled";
  }) => odooPost<{ ok: boolean; id: number }>(`/api/company/employees`, payload),
  updateEmployee: (employeeId: string | number, payload: {
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    status?: "active" | "disabled";
  }) => odooPut<{ ok: boolean }>(`/api/company/employees/${employeeId}`, payload),
  toggleEmployee: (employeeId: string | number) =>
    odooPost<{ ok: boolean; status: "active" | "disabled" }>(`/api/company/employees/${employeeId}/toggle`, {}),
  verifyAccess: (payload: { companyId?: string | number; taxId?: string; password: string }) =>
    odooPost<{ ok: boolean; company_id?: number; error?: string }>(`/api/company/access-verify`, payload),
};
