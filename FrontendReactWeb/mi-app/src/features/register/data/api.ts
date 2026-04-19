import type { RegisterPayload, RegisterResponse } from "../types/register.types";

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

export const registerApi = {
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    // Ajusta la ruta al endpoint real cuando esté listo.
    return http<RegisterResponse>("/api/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

