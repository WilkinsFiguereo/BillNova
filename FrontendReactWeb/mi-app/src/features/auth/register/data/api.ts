import type { RegisterPayload, RegisterResponse } from "../types/register.types";
import { authPath, odooPost } from "@/lib/odooApi";

export const registerApi = {
  register: (payload: RegisterPayload): Promise<RegisterResponse> =>
    odooPost<RegisterResponse>(
      authPath("/register"),
      {
        name: payload.name.trim(),
        login: payload.login.trim(),
        password: payload.password,
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone?.trim() || null,
        address: payload.address?.trim() || null,
      },
      { allowedStatuses: [400, 409, 429] },
    ),
};

