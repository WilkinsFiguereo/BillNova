/* ─────────────────────────────────────────────────────────────────────────
   REGISTER FEATURE — Types
   Single source of truth for the feature interfaces
──────────────────────────────────────────────────────────────────────── */

/** Payload that we send to Odoo’s POST /api/auth/register */
export interface RegisterPayload {
  name: string;
  email: string;      // ↗ previously “gmail”
  username: string;   // ↗ this will be mapped to “login”
  password: string;
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
  placeholder: string;
  required: boolean;
  colSpan?: "full" | "half";
}

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;
