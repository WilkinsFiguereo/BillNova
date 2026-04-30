export interface LoginPayload {
  login: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  login: string;
  password: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface LoginResponse {
  ok: boolean;
  uid?: number;
  name?: string;
  email?: string;
  role?: string;
  company_id?: number | null;
  session_id?: string;
  session_token?: string;
  error?: string;
}

export interface RegisterResponse {
  ok: boolean;
  user_id?: number;
  error?: string;
}

export interface AuthUser {
  uid: number;
  login: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
  company_id?: number | null;
  company_name?: string | null;
  avatar_url?: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
