import { odooClient } from '../../../core/api/odooClient';
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
  ResendCodeResponse,
} from '../types/auth.types';

export const authApi = {
  login: (payload: LoginPayload) =>
    odooClient.post<LoginResponse>('/api/auth/login', payload),

  googleAuthorizeUrl: async (redirectUri: string) =>
    odooClient.get<{ ok: boolean; auth_url?: string; error?: string }>(
      `/api/auth/google/mobile/authorize-url?redirect_uri=${encodeURIComponent(redirectUri)}`
    ),

  register: (payload: RegisterPayload) =>
    odooClient.post<RegisterResponse>('/api/auth/register', payload),

  verifyEmail: (payload: VerifyEmailPayload) =>
    odooClient.post<VerifyEmailResponse>('/api/auth/verify-email', payload),

  resendVerificationCode: (email: string, frontendBaseUrl?: string) =>
    odooClient.post<ResendCodeResponse>(
      '/api/auth/resend-code',
      { email, frontend_base_url: frontendBaseUrl },
    ),

  session: () =>
    odooClient.get<LoginResponse>('/api/auth/session', { requiresAuth: true }),

  logout: () =>
    odooClient.post<{ ok: boolean }>('/api/auth/logout', {}, { requiresAuth: true }),
};
