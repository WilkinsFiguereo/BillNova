export interface RegisterPayload {
  name: string;
  gmail: string;
  username: string;
  password: string;
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

export interface FieldConfig {
  name: keyof RegisterPayload;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  required: boolean;
  colSpan?: "full" | "half";
}

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;