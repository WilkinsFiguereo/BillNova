import type { RegisterPayload, RegisterResponse } from "../types/register.types";
import { authPath, odooPost } from "@/lib/odooApi";

export const registerApi = {
  register: (payload: RegisterPayload): Promise<RegisterResponse> => {
    return odooPost<RegisterResponse>(
      authPath("/register"),
      {
        name: payload.name.trim(),
        gmail: payload.gmail.trim().toLowerCase(),
        username: payload.username.trim(),
        password: payload.password,
      },
      { allowedStatuses: [400, 409] },
    );
  },
};
