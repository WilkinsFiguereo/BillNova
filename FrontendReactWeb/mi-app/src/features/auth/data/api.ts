import type {
  LoginPayload,
  LoginResponse,
} from "../types/auth.types";

import { authPath, odooPost } from "@/lib/odooApi";

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> =>
    odooPost<LoginResponse>(
      authPath("/login"),
      {
        login: payload.username.trim(), // backend espera "login"
        password: payload.password,
      },
      { allowedStatuses: [400, 401] },
    ),
  verifyEmail: async (payload: { email: string; code: string }) =>
    odooPost<{ ok: boolean; error?: string; retry_after_seconds?: number }>(
      authPath("/verify-email"),
      payload,
      { allowedStatuses: [400, 401, 429] },
    ),
  resendVerificationCode: async (email: string) =>
    odooPost<{ ok: boolean; message?: string; dev_code?: string; error?: string; retry_after_seconds?: number }>(
      authPath("/resend-code"),
      { email },
      { allowedStatuses: [400, 429] },
    ),
};
