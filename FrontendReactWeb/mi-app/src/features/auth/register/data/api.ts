import { authPath, odooPost } from "@/lib/odooApi";
import type { RegisterPayload, RegisterResponse } from "../types/register.types";

const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

export const registerApi = {
  register: (payload: RegisterPayload): Promise<RegisterResponse> => {
    if (DEV_AUTH && process.env.NODE_ENV !== "production") {
      return Promise.resolve({ ok: true, user_id: 1, email: payload.email });
    }

    return odooPost<RegisterResponse>(authPath("/register"), payload, {
      allowedStatuses: [400, 404, 409, 429, 500, 502, 503, 504],
    });
  },
};
