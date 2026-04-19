import type { BillnovaUser, ResUser } from "../types/user.types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  "http://localhost:8069";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

// Ajusta estas rutas a tu backend real cuando lo conectes.
export async function apiGetResUsers(): Promise<ResUser[]> {
  return http<ResUser[]>("/api/res_users");
}

export async function apiGetBillnovaUsers(): Promise<BillnovaUser[]> {
  return http<BillnovaUser[]>("/api/billnova_users");
}

export async function apiDeleteResUser(id: number): Promise<void> {
  await http<void>(`/api/res_users/${id}`, { method: "DELETE" });
}

export async function apiDeleteBillnovaUser(id: number): Promise<void> {
  await http<void>(`/api/billnova_users/${id}`, { method: "DELETE" });
}

