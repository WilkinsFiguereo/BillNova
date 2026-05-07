import { ODOO_URL } from "@/lib/odooApi";
import type { BillnovaUser, ResUser } from "../types/user.types";

type ApiEnvelope<T> = {
  data?: T;
  error?: string;
  message?: string;
  id?: number;
};

type ResUserApi = {
  id: number;
  name: string;
  login?: string;
  email: string;
  role?: string;
  active?: boolean;
};

type BillnovaUserApi = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
  active?: boolean;
  is_mobile_user?: boolean;
  res_user_id?: number | null;
};

export type CreateResUserPayload = {
  name: string;
  login: string;
  email: string;
  password?: string;
  role: string;
  active: boolean;
};

export type UpdateResUserPayload = Partial<CreateResUserPayload>;

export type CreateBillnovaUserPayload = {
  name: string;
  email: string;
  password?: string;
  role: string;
  active: boolean;
  phone?: string;
  address?: string;
  is_mobile_user?: boolean;
  res_user_id?: number | null;
};

export type UpdateBillnovaUserPayload = Partial<CreateBillnovaUserPayload>;

async function parseJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ODOO_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  const payload = await parseJson<ApiEnvelope<T>>(res);
  if (!res.ok) {
    throw new Error(payload?.error || payload?.message || `HTTP ${res.status}`);
  }

  return (payload?.data ?? payload) as T;
}

function mapResUser(user: ResUserApi): ResUser {
  return {
    id: user.id,
    name: user.name || "",
    login: user.login || user.email || "",
    email: user.email || "",
    role: user.role || "user",
    active: user.active ?? true,
  };
}

function mapBillnovaUser(user: BillnovaUserApi): BillnovaUser {
  return {
    id: user.id,
    name: user.name || "",
    login: user.email || "",
    email: user.email || "",
    role: user.role || "seller",
    active: user.active ?? true,
    phone: user.phone || "",
    address: user.address || "",
    is_mobile_user: user.is_mobile_user ?? false,
    res_user_id: user.res_user_id ?? null,
  };
}

export async function apiGetResUsers(): Promise<ResUser[]> {
  const data = await request<ResUserApi[]>("/api/users", { cache: "no-store" });
  return data.map(mapResUser);
}

export async function apiGetResUser(id: number): Promise<ResUser> {
  const user = await request<ResUserApi>(`/api/users/${id}`, { cache: "no-store" });
  return mapResUser(user);
}

export async function apiCreateResUser(data: CreateResUserPayload): Promise<ResUser> {
  const created = await request<{ id: number }>("/api/users", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      login: data.login.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role: data.role,
      active: data.active,
    }),
  });

  return apiGetResUser(created.id);
}

export async function apiUpdateResUser(id: number, data: UpdateResUserPayload): Promise<ResUser> {
  await request(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: data.name,
      login: data.login?.trim().toLowerCase(),
      email: data.email?.trim().toLowerCase(),
      password: data.password,
      role: data.role,
      active: data.active,
    }),
  });

  return apiGetResUser(id);
}

export async function apiDeleteResUser(id: number): Promise<void> {
  await request(`/api/users/${id}`, { method: "DELETE" });
}

export async function apiGetBillnovaUsers(): Promise<BillnovaUser[]> {
  const data = await request<BillnovaUserApi[]>("/api/billnova-users", { cache: "no-store" });
  return data.map(mapBillnovaUser);
}

export async function apiGetBillnovaUser(id: number): Promise<BillnovaUser> {
  const user = await request<BillnovaUserApi>(`/api/billnova-users/${id}`, { cache: "no-store" });
  return mapBillnovaUser(user);
}

export async function apiCreateBillnovaUser(data: CreateBillnovaUserPayload): Promise<BillnovaUser> {
  const created = await request<{ id: number }>("/api/billnova-users", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role: data.role,
      active: data.active,
      phone: data.phone,
      address: data.address,
      is_mobile_user: data.is_mobile_user ?? false,
      res_user_id: data.res_user_id,
    }),
  });

  return apiGetBillnovaUser(created.id);
}

export async function apiUpdateBillnovaUser(id: number, data: UpdateBillnovaUserPayload): Promise<BillnovaUser> {
  await request(`/api/billnova-users/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: data.name,
      email: data.email?.trim().toLowerCase(),
      password: data.password,
      role: data.role,
      active: data.active,
      phone: data.phone,
      address: data.address,
      is_mobile_user: data.is_mobile_user,
      res_user_id: data.res_user_id,
    }),
  });

  return apiGetBillnovaUser(id);
}

export async function apiDeleteBillnovaUser(id: number): Promise<void> {
  await request(`/api/billnova-users/${id}`, { method: "DELETE" });
}
