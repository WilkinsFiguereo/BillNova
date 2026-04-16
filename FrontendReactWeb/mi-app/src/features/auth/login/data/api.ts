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
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await odooPost<LoginResponse>(
    authPath("/login"),
    {
      login: payload.username.trim(),
      password: payload.password,
      remember_me: payload.rememberMe,
    },
    { allowedStatuses: [400, 401, 403, 404, 409, 429] },
  );

  console.log("LOGIN RESPONSE >>>", res); // 👈 IMPORTANTE

  return res;
},

  logout: async (): Promise<{ ok: boolean }> =>
    odooPost<{ ok: boolean }>(authPath("/logout"), {}),

  getSession: async (): Promise<SessionResponse> =>
    odooGet<SessionResponse>(authPath("/session"), {
      allowedStatuses: [401, 403],
    }),
};