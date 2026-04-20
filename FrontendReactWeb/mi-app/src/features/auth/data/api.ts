import type {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  RevokeSessionResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  ResendCodeResponse,
  SessionsListResponse,
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
      },
      { allowedStatuses: [400, 401] },
    ),
  getSession: async (sessionToken?: string): Promise<SessionResponse> =>
    odooGet<SessionResponse>(authPath("/session"), { sessionToken, allowedStatuses: [401] }),

  logout: async (sessionToken?: string): Promise<LogoutResponse> =>
    odooPost<LogoutResponse>(authPath("/logout"), {}, { sessionToken, allowedStatuses: [401] }),

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> =>
    odooPost<ForgotPasswordResponse>(authPath("/forgot-password"), payload, { allowedStatuses: [400, 404, 409, 429] }),

  resetPassword: async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> =>
    odooPost<ResetPasswordResponse>(authPath("/reset-password"), payload, { allowedStatuses: [400, 404, 409, 429] }),

  verifyEmail: async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> =>
    odooPost<VerifyEmailResponse>(authPath("/verify-email"), payload, { allowedStatuses: [400, 404, 409, 429] }),

  resendVerificationCode: async (email: string): Promise<ResendCodeResponse> =>
    odooPost<ResendCodeResponse>(authPath("/verify-email/resend"), { email }, { allowedStatuses: [400, 404, 409, 429] }),

  listSessions: async (sessionToken: string): Promise<SessionsListResponse> =>
    odooGet<SessionsListResponse>(authPath("/sessions"), { sessionToken, allowedStatuses: [401] }),

  revokeSession: async (
    sessionToken: string,
    sessionId: number,
  ): Promise<RevokeSessionResponse> =>
    odooPost<RevokeSessionResponse>(
      authPath("/sessions/revoke"),
      { session_id: sessionId },
      { sessionToken, allowedStatuses: [400, 401, 404] },
    ),
};
