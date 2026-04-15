<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/data/api.ts
﻿import type { RegisterPayload, RegisterResponse } from "../types/register.types";

const ODOO_URL = (process.env.NEXT_PUBLIC_ODOO_URL ?? "http://localhost:8079").replace(/\/+$/, "");

async function parseJsonSafe<TRes>(response: Response): Promise<TRes> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Respuesta no JSON desde el backend");
  }
  return response.json() as Promise<TRes>;
}

async function odooPost<TRes>(path: string, body: unknown): Promise<TRes> {
  const response = await fetch(`${ODOO_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  if (!response.ok && response.status !== 400 && response.status !== 409) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return parseJsonSafe<TRes>(response);
}

export const registerApi = {
  register: (payload: RegisterPayload): Promise<RegisterResponse> =>
    odooPost<RegisterResponse>("/api/auth/register", payload),
};
=======
import type { RegisterPayload, RegisterResponse } from "../types/register.types";
import { authPath, odooPost } from "@/lib/odooApi";

export const registerApi = {
  register: (payload: RegisterPayload): Promise<RegisterResponse> => {
    return odooPost<RegisterResponse>(
      authPath("/register"),
      {
        name: payload.name.trim(),
        login: payload.username.trim(),                
        password: payload.password,
        email: payload.email.trim().toLowerCase(),      
        phone: payload.phone?.trim() || null,           // 👈 opcional
        address: payload.address?.trim() || null,       // 👈 opcional
      },
      { allowedStatuses: [400, 409] }
    );
  },
};
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/data/api.ts
