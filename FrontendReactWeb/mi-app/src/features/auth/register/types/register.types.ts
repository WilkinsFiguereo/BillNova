/* ─────────────────────────────────────────
   REGISTER FEATURE — Types
   Fuente única de verdad para interfaces
───────────────────────────────────────── */

export interface RegisterPayload {
  name: string;
  login: string;
  password: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface RegisterResponse {
  ok: boolean;
  user_id?: number;
  email?: string;
  requires_verification?: boolean;
  message?: string;
  warning?: string;
  email_sent?: boolean;
  delivery?: "email" | "simulated";
  dev_code?: string;
  dev_token?: string;
  error?: string;
}

export interface RegisterFormState {
  values: RegisterPayload;
  errors: Partial<Record<keyof RegisterPayload, string>>;
  isLoading: boolean;
  serverError: string | null;
  success: boolean;
}

export interface FieldConfig {
  name: keyof RegisterPayload;
  label: string;
  type: "text" | "email" | "password" | "tel" | "textarea";
  placeholder: string;
  required: boolean;
  colSpan?: "full" | "half";
  maxLength?: number;
}

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

