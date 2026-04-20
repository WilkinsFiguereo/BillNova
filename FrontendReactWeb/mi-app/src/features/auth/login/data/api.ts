import type {
  ActiveSession,
  DeviceSessionsResponse,
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
import { getStoredAuthState } from "./storage";

const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

function roleFromLogin(login: string): LoginResponse["role"] {
  const v = login.trim().toLowerCase();
  if (v.includes("admin")) return "admin";
  if (v.includes("mod")) return "moderation";
  if (v.includes("user")) return "user";
  return "seller";
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    if (DEV_AUTH && process.env.NODE_ENV !== "production") {
      const username = payload.username.trim();
      return {
        ok: true,
        uid: 1,
        name: username || "Dev User",
        email: username.includes("@") ? username : `${username || "dev"}@local.test`,
        role: roleFromLogin(username),
        session_token: "dev-session",
      };
    }

    return odooPost<LoginResponse>(
      authPath("/login"),
      {
        login: payload.username.trim(),
        password: payload.password,
        remember_me: payload.rememberMe,
      },
      { allowedStatuses: [400, 401, 403, 404, 409, 429, 500, 502, 503, 504] },
    );
  },

  logout: async (sessionToken?: string): Promise<{ ok: boolean }> => {
    if (DEV_AUTH && process.env.NODE_ENV !== "production") {
      return { ok: true };
    }
    return odooPost<{ ok: boolean }>(authPath("/logout"), {}, { sessionToken });
  },

  getSession: async (sessionToken?: string): Promise<SessionResponse> => {
    if (DEV_AUTH && process.env.NODE_ENV !== "production") {
      const cached = getStoredAuthState();
      if (!cached) return { ok: false, error: "No hay sesión activa" };
      return {
        ok: true,
        uid: cached.uid,
        name: cached.name,
        email: cached.email,
        role: cached.role,
        session_token: cached.sessionToken ?? sessionToken,
        session_expires_at: cached.sessionExpiresAt,
      };
    }

    return odooGet<SessionResponse>(authPath("/session"), {
      sessionToken,
      allowedStatuses: [401, 403],
    });
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> =>
    odooPost<ForgotPasswordResponse>(authPath("/forgot-password"), payload, {
      allowedStatuses: [400, 404, 409, 429],
    }),

  resetPassword: async (payload: ResetPasswordPayload): Promise<{ ok: boolean; error?: string }> =>
    odooPost<{ ok: boolean; error?: string }>(authPath("/reset-password"), payload, {
      allowedStatuses: [400, 404, 409, 429],
    }),

  verifyEmail: async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> =>
    odooPost<VerifyEmailResponse>(authPath("/verify-email"), payload, {
      allowedStatuses: [400, 404, 409, 429],
    }),

  resendVerificationCode: async (email: string): Promise<ResendCodeResponse> =>
    odooPost<ResendCodeResponse>(authPath("/verify-email/resend"), { email }, {
      allowedStatuses: [400, 404, 409, 429],
    }),

  listSessions: async (sessionToken?: string): Promise<DeviceSessionsResponse> =>
    odooGet<DeviceSessionsResponse>(authPath("/sessions"), {
      sessionToken,
      allowedStatuses: [401, 403],
    }),

  revokeSession: async (
    sessionToken: string | undefined,
    sessionId: ActiveSession["id"],
  ): Promise<{ ok: boolean; error?: string }> =>
    odooPost<{ ok: boolean; error?: string }>(
      authPath(`/sessions/${sessionId}/revoke`),
      {},
      {
        sessionToken,
        allowedStatuses: [400, 401, 403, 404],
      },
    ),

  updateProfile: async (
    sessionToken: string | undefined,
    data: { name?: string; phone?: string },
  ): Promise<{ ok: boolean; error?: string }> => {
    if (DEV_AUTH && process.env.NODE_ENV !== "production") {
      return { ok: true };
    }
    return odooPost<{ ok: boolean; error?: string }>(
      authPath("/profile"),
      data,
      { sessionToken, allowedStatuses: [400, 401, 403, 404] },
    );
  },
};
