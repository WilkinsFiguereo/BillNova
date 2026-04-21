import {
  odooDelete,
  odooGet,
  odooPost,
  odooPut,
} from "@/lib/odooApi";
import type {
  BillnovaUser,
  CreateUserPayload,
  ResUser,
  UpdateUserPayload,
} from "../types/user.types";

type CreateResponse = { id: number; message: string };

// res.users - /api/users
export async function apiGetResUsers(): Promise<ResUser[]> {
  return odooGet<ResUser[]>("/api/users");
}

export async function apiGetResUserById(id: number): Promise<ResUser> {
  return odooGet<ResUser>(`/api/users/${id}`);
}

export async function apiCreateResUser(
  payload: Pick<CreateUserPayload, "name" | "login" | "email" | "password">,
): Promise<CreateResponse> {
  return odooPost<CreateResponse>("/api/users", payload);
}

export async function apiUpdateResUser(
  id: number,
  payload: Partial<
    Pick<UpdateUserPayload, "name" | "login" | "email" | "password" | "active">
  >,
): Promise<void> {
  await odooPut("/api/users/" + id, payload);
}

export async function apiDeleteResUser(id: number): Promise<void> {
  await odooDelete("/api/users/" + id);
}

// billnova.user - /api/billnova-users
export async function apiGetBillnovaUsers(): Promise<BillnovaUser[]> {
  return odooGet<BillnovaUser[]>("/api/billnova-users");
}

export async function apiGetBillnovaUserByResId(
  resUserId: number,
): Promise<BillnovaUser | null> {
  const all = await apiGetBillnovaUsers();
  return all.find((user) => user.res_user_id === resUserId) ?? null;
}

export async function apiCreateBillnovaUser(
  payload: Pick<
    CreateUserPayload,
    "name" | "email" | "phone" | "address" | "is_mobile_user"
  > & {
    res_user_id: number;
  },
): Promise<CreateResponse> {
  return odooPost<CreateResponse>("/api/billnova-users", payload);
}

export async function apiUpdateBillnovaUser(
  id: number,
  payload: Partial<Pick<UpdateUserPayload, "phone" | "address" | "is_mobile_user">>,
): Promise<void> {
  await odooPut("/api/billnova-users/" + id, payload);
}

export async function apiDeleteBillnovaUser(id: number): Promise<void> {
  await odooDelete("/api/billnova-users/" + id);
}
