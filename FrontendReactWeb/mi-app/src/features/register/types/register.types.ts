<<<<<<< HEAD
/* ─────────────────────────────────────────
   REGISTER FEATURE — Types
   Fuente única de verdad para interfaces
───────────────────────────────────────── */

/** Payload que se envía al endpoint Odoo POST /api/auth/register */
export interface RegisterPayload {
  name: string;
  login: string;
  password: string;
  email: string;
=======
export interface RegisterPayload {
  name: string;
  email: string;      // 👈 antes gmail
  username: string;   // 👈 se mapeará a login
  password: string;
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
  phone?: string;
  address?: string;
}

<<<<<<< HEAD
/** Respuesta del endpoint de registro */
export interface RegisterResponse {
  ok: boolean;
  user_id?: number;
  error?: string;
}

/** Estado interno del formulario */
=======
export interface RegisterResponse {
  ok: boolean;
  user_id?: number;
  email?: string;
  requires_verification?: boolean;
  dev_code?: string;
  error?: string;
}

>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
export interface RegisterFormState {
  values: RegisterPayload;
  errors: Partial<Record<keyof RegisterPayload, string>>;
  isLoading: boolean;
  serverError: string | null;
  success: boolean;
}

<<<<<<< HEAD
/** Configuración declarativa de cada campo del form */
export interface FieldConfig {
  name: keyof RegisterPayload;
  label: string;
  type: "text" | "email" | "password" | "tel" | "textarea";
=======
export interface FieldConfig {
  name: keyof RegisterPayload;
  label: string;
  type: "text" | "email" | "password";
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
  placeholder: string;
  required: boolean;
  colSpan?: "full" | "half";
}

<<<<<<< HEAD
/** Nivel de fortaleza de contraseña */
=======
>>>>>>> d5a70c78988b43655bd9da58bea46a376cb4ef8a
export type PasswordStrength = 0 | 1 | 2 | 3 | 4;