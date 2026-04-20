"use client";

const API_BASE = "/api/proxy";

async function parseJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Respuesta no JSON desde el backend");
  }
  return response.json() as Promise<T>;
}

// Usar rutas API de Next.js como proxy para evitar problemas de CORS
async function odooGet<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseJson<T>(res);
  } catch (error) {
    console.error("Error en odooGet:", error);
    throw error;
  }
}

async function odooPost<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseJson<T>(res);
  } catch (error) {
    console.error("Error en odooPost:", error);
    throw error;
  }
}

async function odooPut<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseJson<T>(res);
  } catch (error) {
    console.error("Error en odooPut:", error);
    throw error;
  }
}

export interface ApiCompany {
  id: number;
  name: string;
  legal_name?: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  founded_year?: string | number;
  sales_history?: { month: string; sales: number; orders: number }[];
  employees?: ApiEmployee[];
}

export interface ApiEmployee {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: "active" | "disabled";
}

interface EmployeesListResponse {
  ok: boolean;
  employees: ApiEmployee[];
}

interface CreateEmployeeResponse {
  ok: boolean;
  id: number;
}

interface ToggleEmployeeResponse {
  ok: boolean;
  status: ApiEmployee["status"];
}

export const companyApi = {
  getConfig: (companyId?: string | number) => {
    // Obtener todas las empresas. Si companyId, filtrar la primera coincidencia
    return odooGet<{ data: ApiCompany[] }>(`/api/companies`);
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
  }) => {
    // El backend no tiene PUT /api/company/config, solo /api/company/register
    // Por ahora, devolvemos un error indicando que no está implementado
    return Promise.reject(new Error("updateCompany not implemented in backend"));
  },
  listEmployees: async (companyId: string | number): Promise<EmployeesListResponse> => {
    return { ok: true, employees: [] };
  },
  createEmployee: async (payload: {
    companyId: string | number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    status?: "active" | "disabled";
  }): Promise<CreateEmployeeResponse> => {
    return { ok: true, id: Date.now() };
  },
  updateEmployee: async (employeeId: string | number, payload: {
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    status?: "active" | "disabled";
  }): Promise<{ ok: boolean }> => {
    return { ok: true };
  },
  toggleEmployee: async (employeeId: string | number): Promise<ToggleEmployeeResponse> => {
    return { ok: true, status: "disabled" };
  },
  verifyAccess: (payload: { companyId?: string | number; taxId?: string; password: string }) =>
    odooPost<{ ok: boolean; company_id?: number; error?: string }>(`/api/company/access-verify`, payload),
};
