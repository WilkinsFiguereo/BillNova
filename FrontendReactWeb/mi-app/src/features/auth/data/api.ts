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

  logout: async (sessionToken?: string): Promise<{ ok: boolean }> =>
    odooPost<{ ok: boolean }>(authPath("/logout"), {}, { sessionToken }),

  getSession: async (sessionToken?: string): Promise<SessionResponse> =>
    odooGet<SessionResponse>(authPath("/session"), { sessionToken, allowedStatuses: [401, 403] }),

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> =>
    odooPost<ForgotPasswordResponse>(
      authPath("/forgot-password"),
      {
        email: payload.email.trim().toLowerCase(),
        method: payload.method,
      },
      { allowedStatuses: [400, 401, 403, 404, 409, 429] },
    ),

  resetPassword: async (payload: ResetPasswordPayload): Promise<{ ok: boolean; error?: string }> =>
    odooPost<{ ok: boolean; error?: string }>(
      authPath("/reset-password"),
      {
        email: payload.email.trim().toLowerCase(),
        otp: payload.otp.trim() || undefined,
        token: payload.token.trim() || undefined,
        newPassword: payload.newPassword,
      },
      { allowedStatuses: [400, 401, 403, 404, 409, 429] },
    ),

  verifyEmail: async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> =>
    odooPost<VerifyEmailResponse>(
      authPath("/verify-email"),
      {
        email: payload.email.trim().toLowerCase(),
        code: payload.code.trim(),
      },
      { allowedStatuses: [400, 401, 403, 404, 409, 429] },
    ),

  resendVerificationCode: async (email: string): Promise<ResendCodeResponse> =>
    odooPost<ResendCodeResponse>(
      authPath("/resend-verification-code"),
      {
        email: email.trim().toLowerCase(),
      },
      { allowedStatuses: [400, 401, 403, 404, 409, 429] },
    ),

  listSessions: async (sessionToken: string): Promise<{ ok: boolean; sessions?: ActiveSession[]; error?: string }> =>
    odooGet<{ ok: boolean; sessions?: ActiveSession[]; error?: string }>(authPath("/sessions"), {
      sessionToken,
      allowedStatuses: [401, 403],
    }),

  revokeSession: async (sessionToken: string, sessionId: number): Promise<{ ok: boolean; error?: string }> =>
    odooPost<{ ok: boolean; error?: string }>(
      authPath("/sessions/revoke"),
      { session_id: sessionId },
      { sessionToken, allowedStatuses: [400, 401, 403, 404] },
    ),
};
