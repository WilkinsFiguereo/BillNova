import { odooClient } from '../../../core/api/odooClient';
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from '../types/auth.types';

export interface SessionResponse {
  ok: boolean;
  uid?: number;
  name?: string;
  email?: string;
  role?: string;
  company_id?: number | null;
  error?: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    odooClient.post<LoginResponse>('/api/auth/login', payload),

  googleAuthorizeUrl: async (redirectUri: string) =>
    odooClient.get<{ ok: boolean; auth_url?: string; error?: string }>(
      `/api/auth/google/mobile/authorize-url?redirect_uri=${encodeURIComponent(redirectUri)}`
    ),

  register: (payload: RegisterPayload) =>
    odooClient.post<RegisterResponse>('/api/auth/register', payload),

  session: () =>
    odooClient.get<SessionResponse>('/api/auth/session', {}, { requiresAuth: true }),

  logout: () =>
    odooClient.post<{ ok: boolean }>('/api/auth/logout', {}, { requiresAuth: true }),
};
