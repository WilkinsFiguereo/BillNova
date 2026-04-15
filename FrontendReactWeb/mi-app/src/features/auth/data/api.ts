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
    odooGet<SessionResponse>(authPath("/session"), { sessionToken }),

  logout: async (sessionToken?: string): Promise<LogoutResponse> =>
    odooPost<LogoutResponse>(authPath("/logout"), {}, { sessionToken }),

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> =>
    odooPost<ForgotPasswordResponse>(authPath("/forgot-password"), payload),

  resetPassword: async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> =>
    odooPost<ResetPasswordResponse>(authPath("/reset-password"), payload),

  verifyEmail: async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> =>
    odooPost<VerifyEmailResponse>(authPath("/verify-email"), payload),

  resendVerificationCode: async (email: string): Promise<ResendCodeResponse> =>
    odooPost<ResendCodeResponse>(authPath("/resend-verification-code"), { email }),

  listSessions: async (sessionToken: string): Promise<SessionsListResponse> =>
    odooGet<SessionsListResponse>(authPath("/sessions"), { sessionToken }),

  revokeSession: async (
    sessionToken: string,
    sessionId: number,
  ): Promise<RevokeSessionResponse> =>
    odooPost<RevokeSessionResponse>(
      authPath("/sessions/revoke"),
      { session_id: sessionId },
      { sessionToken },
    ),
};
