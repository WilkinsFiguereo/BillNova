import type { Servicio } from "../types/servicios.types";
import { MOCK_SERVICIOS } from "./mockServicios.data";

const STORAGE_KEY = "billnova.seller.servicios.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function loadFromStorage(): Servicio[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Servicio[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(servicios: Servicio[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(servicios));
  } catch {
    // ignore
  }
}

function nowDate() {
  return new Date().toISOString().split("T")[0];
}

function nextId(servicios: Servicio[]) {
  const max = servicios.reduce((acc, s) => Math.max(acc, Number(s.id) || 0), 0);
  return String(max + 1);
}

function getStore(): Servicio[] {
  const stored = loadFromStorage();
  return stored ?? [...MOCK_SERVICIOS];
}

function setStore(servicios: Servicio[]) {
  saveToStorage(servicios);
}

export async function apiListServicios(): Promise<Servicio[]> {
  return getStore();
}

export async function apiCreateServicio(payload: Partial<Servicio>): Promise<void> {
  const servicios = getStore();
  const created: Servicio = {
    id: nextId(servicios),
    nombre: payload.nombre ?? "",
    descripcion: payload.descripcion ?? "",
    detalles: payload.detalles ?? "",
    precio: payload.precio ?? 0,
    pagoFrecuencia: payload.pagoFrecuencia ?? "unico",
    status: payload.status ?? "activo",
    imagenes: payload.imagenes ?? [],
    ultimaActualizacion: nowDate(),
  };

  setStore([created, ...servicios]);
}

export async function apiUpdateServicio(id: string, payload: Partial<Servicio>): Promise<void> {
  const servicios = getStore();
  const idx = servicios.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Servicio no encontrado.");

  const current = servicios[idx];
  const updated: Servicio = {
    ...current,
    ...payload,
    ultimaActualizacion: nowDate(),
  };

  const next = [...servicios];
  next[idx] = updated;
  setStore(next);
}

export async function apiDeleteServicio(id: string): Promise<void> {
  const servicios = getStore();
  const next = servicios.filter((s) => s.id !== id);
  if (next.length === servicios.length) throw new Error("Servicio no encontrado.");
  setStore(next);
}

