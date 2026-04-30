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
import { authPath, odooGet, odooPost, odooPut } from "@/lib/odooApi";

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

  getProfile: async (
    sessionToken?: string,
  ): Promise<{
    ok: boolean;
    user?: {
      id: number;
      name: string;
      email: string;
      role?: string;
      phone?: string;
      avatar_url?: string | null;
      company_name?: string | null;
    };
    error?: string;
  }> => {
    const response = await odooGet<{
      ok: boolean;
      data?: {
        uid: number;
        name: string;
        email: string;
        role?: string;
        phone?: string;
        avatar_url?: string | null;
        company_name?: string | null;
      };
      error?: string;
    }>("/api/mobile/profile", {
      sessionToken,
      allowedStatuses: [400, 401, 403, 404, 409],
    });

    return {
      ok: response.ok,
      error: response.error ?? response.data?.error,
      user: response.data?.data
        ? {
            id: response.data.data.uid,
            name: response.data.data.name,
            email: response.data.data.email,
            role: response.data.data.role,
            phone: response.data.data.phone,
            avatar_url: response.data.data.avatar_url,
            company_name: response.data.data.company_name,
          }
        : undefined,
    };
  },

  updateProfile: async (
    sessionToken: string | undefined,
    payload: { name?: string; email?: string; phone?: string; address?: string; password?: string; avatar?: string },
  ): Promise<{ ok: boolean; error?: string; avatar_url?: string | null }> => {
    const response = await odooPut<{
      ok: boolean;
      data?: { avatar_url?: string | null };
      error?: string;
    }>("/api/mobile/profile", payload, {
      sessionToken,
      allowedStatuses: [400, 401, 403, 404, 409],
    });

    return {
      ok: response.data?.ok ?? response.ok,
      error: response.error ?? response.data?.error,
      avatar_url: response.data?.data?.avatar_url,
    };
  },

  updateAvatar: async (
    sessionToken: string | undefined,
    avatar: string,
  ): Promise<{ ok: boolean; error?: string; avatar_url?: string | null }> =>
    authApi.updateProfile(sessionToken, { avatar }),
};
