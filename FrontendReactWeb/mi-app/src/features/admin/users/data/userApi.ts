import type { ResUser, BillnovaUser } from "../types/user.types";
import { mockResUsers, mockBillnovaUsers } from "./mockUsers";

type ResUserPayload = Omit<ResUser, "id" | "createdAt">;
type BillnovaUserPayload = Omit<BillnovaUser, "id" | "createdAt">;

let resUsersStore: ResUser[] = [...mockResUsers];
let billnovaUsersStore: BillnovaUser[] = [...mockBillnovaUsers];

function nowIso() {
  return new Date().toISOString();
}

function cloneResUser(user: ResUser): ResUser {
  return { ...user };
}

function cloneBillnovaUser(user: BillnovaUser): BillnovaUser {
  return { ...user };
}

function nextId(users: Array<{ id: number }>, fallback = 1) {
  const max = users.reduce((acc, u) => Math.max(acc, u.id), 0);
  return Math.max(max + 1, fallback);
}

// ── Res Users ────────────────────────────────────────────────────────────────

export async function apiGetResUsers(): Promise<ResUser[]> {
  return resUsersStore.map(cloneResUser);
}

export async function apiGetResUser(id: number): Promise<ResUser> {
  const user = resUsersStore.find((u) => u.id === id);
  if (!user) throw new Error("Usuario no encontrado.");
  return cloneResUser(user);
}

export async function apiCreateResUser(data: ResUserPayload): Promise<ResUser> {
  const created: ResUser = {
    id: nextId(resUsersStore, 1),
    name: data.name,
    email: data.email,
    role: data.role,
    active: data.active,
    createdAt: nowIso(),
  };

  resUsersStore = [created, ...resUsersStore];
  return cloneResUser(created);
}

export async function apiUpdateResUser(
  id: number,
  data: Partial<Omit<ResUser, "id">>,
): Promise<ResUser> {
  const existing = resUsersStore.find((u) => u.id === id);
  if (!existing) throw new Error("Usuario no encontrado.");

  const updated: ResUser = {
    ...existing,
    ...data,
  };

  resUsersStore = resUsersStore.map((u) => (u.id === id ? updated : u));
  return cloneResUser(updated);
}

export async function apiDeleteResUser(id: number): Promise<void> {
  const before = resUsersStore.length;
  resUsersStore = resUsersStore.filter((u) => u.id !== id);
  if (resUsersStore.length === before) throw new Error("Usuario no encontrado.");
}

// ── Billnova Users ───────────────────────────────────────────────────────────

export async function apiGetBillnovaUsers(): Promise<BillnovaUser[]> {
  return billnovaUsersStore.map(cloneBillnovaUser);
}

export async function apiGetBillnovaUser(id: number): Promise<BillnovaUser> {
  const user = billnovaUsersStore.find((u) => u.id === id);
  if (!user) throw new Error("Usuario no encontrado.");
  return cloneBillnovaUser(user);
}

export async function apiCreateBillnovaUser(data: BillnovaUserPayload): Promise<BillnovaUser> {
  const created: BillnovaUser = {
    id: nextId(billnovaUsersStore, 100),
    name: data.name,
    email: data.email,
    role: data.role,
    active: data.active,
    createdAt: nowIso(),
  };

  billnovaUsersStore = [created, ...billnovaUsersStore];
  return cloneBillnovaUser(created);
}

export async function apiUpdateBillnovaUser(
  id: number,
  data: Partial<Omit<BillnovaUser, "id">>,
): Promise<BillnovaUser> {
  const existing = billnovaUsersStore.find((u) => u.id === id);
  if (!existing) throw new Error("Usuario no encontrado.");

  const updated: BillnovaUser = {
    ...existing,
    ...data,
  };

  billnovaUsersStore = billnovaUsersStore.map((u) => (u.id === id ? updated : u));
  return cloneBillnovaUser(updated);
}

export async function apiDeleteBillnovaUser(id: number): Promise<void> {
  const before = billnovaUsersStore.length;
  billnovaUsersStore = billnovaUsersStore.filter((u) => u.id !== id);
  if (billnovaUsersStore.length === before) throw new Error("Usuario no encontrado.");
}
