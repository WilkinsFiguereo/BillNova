import type { RegisterPayload, RegisterResponse } from "../types/register.types";
import { authPath, odooPost } from "@/lib/odooApi";

export const registerApi = {
  register: (payload: RegisterPayload): Promise<RegisterResponse> => {
    return odooPost<RegisterResponse>(
      authPath("/register"),
      {
        name: payload.name.trim(),
        login: payload.username.trim(),                
        password: payload.password,
        email: payload.email.trim().toLowerCase(),      
        phone: payload.phone?.trim() || null,           // 👈 opcional
        address: payload.address?.trim() || null,       // 👈 opcional
      },
      { allowedStatuses: [400, 409] }
    );
  },
};