"use client";

const API_BASE = (process.env.NEXT_PUBLIC_ODOO_URL ?? "http://localhost:8079").replace(/\/+$/, "");

async function parseJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Respuesta no JSON desde el backend");
  }
  return response.json() as Promise<T>;
}

async function odooGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseJson<T>(res);
}

async function odooPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
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

interface CompanyConfigResponse {
  ok: boolean;
  company?: ApiCompany;
  data?: ApiCompany[];
}

interface EmployeeListResponse {
  ok: boolean;
  employees: ApiEmployee[];
}

interface EmployeeMutationResponse {
  ok: boolean;
  id?: number;
  status?: ApiEmployee["status"];
}

export const companyApi = {
  async getConfig(companyId?: string | number): Promise<CompanyConfigResponse> {
    const res = await odooGet<{ data?: ApiCompany[]; company?: ApiCompany }>(`/api/companies`);
    if (res.company) {
      return { ok: true, company: res.company };
    }

    const companies = Array.isArray(res.data) ? res.data : [];
    const numericId = companyId ? Number(companyId) : undefined;
    const company = numericId ? companies.find((item) => item.id === numericId) : companies[0];

    return { ok: Boolean(company), company, data: companies };
  },

  updateCompany: async (payload: {
    companyId: string | number;
    name?: string;
    legalName?: string;
    rnc?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }) => odooPost<{ ok: boolean; error?: string }>(`/api/company/register`, payload),

  async listEmployees(companyId: string | number): Promise<EmployeeListResponse> {
    void companyId;
    return { ok: true, employees: [] };
  },

  async createEmployee(payload: {
    companyId: string | number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    status?: "active" | "disabled";
  }): Promise<EmployeeMutationResponse> {
    void payload;
    return { ok: false };
  },

  async updateEmployee(
    employeeId: string | number,
    payload: {
      name?: string;
      email?: string;
      role?: string;
      phone?: string;
      status?: "active" | "disabled";
    },
  ): Promise<EmployeeMutationResponse> {
    void employeeId;
    void payload;
    return { ok: false };
  },

  async toggleEmployee(employeeId: string | number): Promise<EmployeeMutationResponse> {
    void employeeId;
    return { ok: false };
  },

  verifyAccess: (payload: { companyId?: string | number; taxId?: string; password: string }) =>
    odooPost<{ ok: boolean; company_id?: number; error?: string }>(`/api/company/access-verify`, payload),
};
