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
};