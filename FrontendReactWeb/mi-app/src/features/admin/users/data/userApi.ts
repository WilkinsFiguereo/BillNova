import { ODOO_URL } from "@/lib/odooApi";
import type { ResUser, BillnovaUser } from "../types/user.types";

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
  active?: boolean;
};

type BillnovaUserApi = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  is_mobile_user?: boolean;
  res_user_id?: number;
};

type ResUserPayload = Omit<ResUser, "id" | "createdAt">;
type BillnovaUserPayload = Omit<BillnovaUser, "id" | "createdAt">;

async function parseJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();

  if (!text) {
    return null;
  }

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
    name: user.name,
    email: user.email,
    role: user.login || "user",
    active: user.active ?? true,
  };
}

function mapBillnovaUser(user: BillnovaUserApi): BillnovaUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.is_mobile_user ? "mobile" : "web",
    active: true,
  };
}

// ── Res Users ────────────────────────────────────────────────────────────────

export async function apiGetResUsers(): Promise<ResUser[]> {
  const data = await request<ResUserApi[]>("/api/users", {
    cache: "no-store",
  });

  return data.map(mapResUser);
}

export async function apiGetResUser(id: number): Promise<ResUser> {
  const user = await request<ResUserApi>(`/api/users/${id}`, {
    cache: "no-store",
  });

  return mapResUser(user);
}

export async function apiCreateResUser(
  data: ResUserPayload
): Promise<ResUser> {
  const created = await request<{ id: number }>("/api/users", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      login: data.email,
      email: data.email,
      password: "Temp1234*",
      active: data.active,
    }),
  });

  return {
    id: created.id,
    name: data.name,
    email: data.email,
    role: data.role,
    active: data.active,
  };
}

export async function apiUpdateResUser(
  id: number,
  data: Partial<Omit<ResUser, "id">>
): Promise<ResUser> {
  await request(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: data.name,
      login: data.email,
      email: data.email,
      active: data.active,
    }),
  });

  return {
    id,
    name: data.name ?? "",
    email: data.email ?? "",
    role: data.role ?? "user",
    active: data.active ?? true,
  };
}

export async function apiDeleteResUser(id: number): Promise<void> {
  await request(`/api/users/${id}`, {
    method: "DELETE",
  });
}

// ── Billnova Users ───────────────────────────────────────────────────────────

export async function apiGetBillnovaUsers(): Promise<BillnovaUser[]> {
  const data = await request<BillnovaUserApi[]>("/api/billnova-users", {
    cache: "no-store",
  });

  return data.map(mapBillnovaUser);
}

export async function apiGetBillnovaUser(id: number): Promise<BillnovaUser> {
  const user = await request<BillnovaUserApi>(`/api/billnova-users/${id}`, {
    cache: "no-store",
  });

  return mapBillnovaUser(user);
}

export async function apiCreateBillnovaUser(
  data: BillnovaUserPayload
): Promise<BillnovaUser> {
  const created = await request<{ id: number }>("/api/billnova-users", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      is_mobile_user: data.role === "billing" || data.role === "support",
    }),
  });

  return {
    id: created.id,
    name: data.name,
    email: data.email,
    role: data.role,
    active: data.active,
  };
}

export async function apiUpdateBillnovaUser(
  id: number,
  data: Partial<Omit<BillnovaUser, "id">>
): Promise<BillnovaUser> {
  await request(`/api/billnova-users/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      is_mobile_user: data.role === "billing" || data.role === "support",
      active: data.active,
    }),
  });

  return {
    id,
    name: data.name ?? "",
    email: data.email ?? "",
    role: data.role ?? "web",
    active: data.active ?? true,
  };
}

export async function apiDeleteBillnovaUser(id: number): Promise<void> {
  await request(`/api/billnova-users/${id}`, {
    method: "DELETE",
  });
}