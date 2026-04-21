import type { RegisterPayload, RegisterResponse } from "../types/register.types";
import { odooPost } from "@/lib/odooApi";

export const registerApi = {
  register: (payload: RegisterPayload): Promise<RegisterResponse> =>
    odooPost<RegisterResponse>("/api/auth/register", payload),
};