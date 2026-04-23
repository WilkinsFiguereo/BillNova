import type {
  ActiveSession,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  LoginResponse,
  ResendCodeResponse,
  ResetPasswordPayload,
  SessionResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from "../types/auth.types";
import { authPath, odooGet, odooPost } from "@/lib/odooApi";

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> =>
    odooPost<LoginResponse>(
      authPath("/login"),
      {
        login: payload.username.trim(),
        password: payload.password,
        remember_me: payload.rememberMe,
      },
      { allowedStatuses: [400, 401, 403, 404, 409, 429] },
    ),

  googleAuthorizeUrl: async (
    redirectUri: string,
  ): Promise<{ ok: boolean; auth_url?: string; error?: string }> =>
    odooGet<{ ok: boolean; auth_url?: string; error?: string }>(
      authPath(`/google/mobile/authorize-url?redirect_uri=${encodeURIComponent(redirectUri)}`),
      { allowedStatuses: [400, 401, 403, 404, 429, 503] },
    ),

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> =>
    odooPost<ForgotPasswordResponse>(
      authPath("/forgot-password"),
      {
        ...payload,
        frontend_base_url: typeof window !== "undefined" ? window.location.origin : undefined,
      },
      { allowedStatuses: [400, 404, 409, 429] },
    ),

  resetPassword: async (payload: ResetPasswordPayload): Promise<{ ok: boolean; error?: string }> =>
    odooPost<{ ok: boolean; error?: string }>(
      authPath("/reset-password"),
      payload,
      { allowedStatuses: [400, 401, 403, 404, 409, 410, 429] },
    ),

  verifyEmail: async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> =>
    odooPost<VerifyEmailResponse>(
      authPath("/verify-email"),
      payload,
      { allowedStatuses: [400, 401, 403, 404, 409, 410, 429] },
    ),

  resendVerificationCode: async (email: string): Promise<ResendCodeResponse> =>
    odooPost<ResendCodeResponse>(
      authPath("/resend-code"),
      { email },
      { allowedStatuses: [400, 401, 403, 404, 409, 429] },
    ),

  listSessions: async (
    sessionToken: string,
  ): Promise<{ ok: boolean; sessions?: ActiveSession[]; error?: string }> =>
    odooGet<{ ok: boolean; sessions?: ActiveSession[]; error?: string }>(
      authPath("/sessions"),
      { sessionToken, allowedStatuses: [401, 403] },
    ),

  revokeSession: async (
    sessionToken: string,
    sessionId: number,
  ): Promise<{ ok: boolean; error?: string }> =>
    odooPost<{ ok: boolean; error?: string }>(
      authPath("/sessions/revoke"),
      { session_id: sessionId },
      { sessionToken, allowedStatuses: [400, 401, 403, 404, 409, 429] },
    ),

  logout: async (sessionToken?: string): Promise<{ ok: boolean }> =>
    odooPost<{ ok: boolean }>(authPath("/logout"), {}, { sessionToken }),

  getSession: async (sessionToken?: string): Promise<SessionResponse> =>
    odooGet<SessionResponse>(authPath("/session"), {
      sessionToken,
      allowedStatuses: [401, 403],
    }),
};
