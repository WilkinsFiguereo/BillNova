export interface RegisterPayload {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  ok: boolean;
  error?: string;
  user_id?: number;
  requires_verification?: boolean;
}

export interface RegisterFormState {
  values: RegisterPayload;
  errors: Partial<Record<keyof RegisterPayload, string>>;
  isLoading: boolean;
  serverError: string | null;
  success: boolean;
}

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

