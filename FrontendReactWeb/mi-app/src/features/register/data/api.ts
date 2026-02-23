/* ─────────────────────────────────────────
   REGISTER FEATURE — Data / API
   Comunicación exclusiva con Odoo
───────────────────────────────────────── */

import type { RegisterPayload, RegisterResponse } from "../types/register.types";

const ODOO_URL = process.env.NEXT_PUBLIC_ODOO_URL ?? "http://localhost:8069";

/** Helper genérico para POST JSON */
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

  return response.json() as Promise<TRes>;
}

/* ── Endpoints expuestos por la feature ── */
export const registerApi = {
  /**
   * POST /api/auth/register
   * Crea res.users + proyect.app.user en Odoo
   */
  register: (payload: RegisterPayload): Promise<RegisterResponse> =>
    odooPost<RegisterResponse>("/api/auth/register", payload),
};