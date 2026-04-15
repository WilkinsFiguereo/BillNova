<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/types/register.types.ts
/* ─────────────────────────────────────────
   REGISTER FEATURE — Types
   Fuente única de verdad para interfaces
───────────────────────────────────────── */
export interface RegisterFormState {
  values: {
    name: string;
    login: string;
    password: string;
    email: string;
    phone?: string;
    address?: string;
  };
  errors: {
    name?: string;
    login?: string;
    password?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  isLoading: boolean;
  serverError?: string;
}

=======
/* ─────────────────────────────────────────────────────────────────────────
   REGISTER FEATURE — Types
   Single source of truth for the feature interfaces
──────────────────────────────────────────────────────────────────────── */
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/types/register.types.ts

/** Payload that we send to Odoo’s POST /api/auth/register */
export interface RegisterPayload {
  name: string;
  email: string;      // ↗ previously “gmail”
  username: string;   // ↗ this will be mapped to “login”
  password: string;
<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/types/register.types.ts
  email: string;
=======
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/types/register.types.ts
  phone?: string;
  address?: string;
}

export interface RegisterResponse {
  ok: boolean;
  user_id?: number;
  email?: string;
  requires_verification?: boolean;
  dev_code?: string;
  error?: string;
}

<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/types/register.types.ts
/** Configuración declarativa de cada campo del form */
export interface FieldConfig {
  name: keyof RegisterPayload;
  label: string;
  type: "text" | "email" | "password" | "tel" | "textarea";
=======
export interface RegisterFormState {
  values: RegisterPayload;
  errors: Partial<Record<keyof RegisterPayload, string>>;
  isLoading: boolean;
  serverError: string | null;
  success: boolean;
}

/** Declarative configuration for every form field */
export interface FieldConfig {
  name: keyof RegisterPayload;
  label: string;
  type: "text" | "email" | "password";
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/types/register.types.ts
  placeholder: string;
  required: boolean;
  colSpan?: "full" | "half";
}

<<<<<<< HEAD:FrontendReactWeb/mi-app/src/features/auth/register/types/register.types.ts
/** Nivel de fortaleza de contraseña */
export type PasswordStrength = 0 | 1 | 2 | 3 | 4;
=======
export type PasswordStrength = 0 | 1 | 2 | 3 | 4;
>>>>>>> dff76de22c0a24dc5ae37d61aec817b910d4b235:FrontendReactWeb/mi-app/src/features/register/types/register.types.ts
