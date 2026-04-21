import { odooRequest } from "@/lib/odooApi";
import type { ResUser, BillnovaUser } from "../types/user.types";

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
  const data = await odooRequest<ResUserApi[]>("/api/users", {
    cache: "no-store",
  });
  return Array.isArray(data) ? data.map(mapResUser) : [];
}

export async function apiGetResUser(id: number): Promise<ResUser> {
  const user = await odooRequest<ResUserApi>(`/api/users/${id}`, {
    cache: "no-store",
  });
  return mapResUser(user);
}

export async function apiCreateResUser(
  data: ResUserPayload
): Promise<ResUser> {
  const created = await odooRequest<{ id: number }>("/api/users", {
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
  await odooRequest(`/api/users/${id}`, {
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
  await odooRequest(`/api/users/${id}`, {
    method: "DELETE",
  });
}

// ── Billnova Users ───────────────────────────────────────────────────────────

export async function apiGetBillnovaUsers(): Promise<BillnovaUser[]> {
  const data = await odooRequest<BillnovaUserApi[]>("/api/billnova-users", {
    cache: "no-store",
  });
  return Array.isArray(data) ? data.map(mapBillnovaUser) : [];
}

export async function apiGetBillnovaUser(id: number): Promise<BillnovaUser> {
  const user = await odooRequest<BillnovaUserApi>(`/api/billnova-users/${id}`, {
    cache: "no-store",
  });
  return mapBillnovaUser(user);
}

export async function apiCreateBillnovaUser(
  data: BillnovaUserPayload
): Promise<BillnovaUser> {
  const created = await odooRequest<{ id: number }>("/api/billnova-users", {
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
  await odooRequest(`/api/billnova-users/${id}`, {
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
  await odooRequest(`/api/billnova-users/${id}`, {
    method: "DELETE",
  });
}