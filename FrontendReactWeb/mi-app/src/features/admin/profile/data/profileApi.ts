import { odooGet, odooPut } from "@/lib/odooApi";

export type ProfileDto = {
  uid: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  address?: string;
  avatar_base64?: string | null;
  avatar_mime?: string | null;
};

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export async function apiGetProfile(sessionToken?: string): Promise<ProfileDto> {
  const res = await odooGet<Envelope<ProfileDto>>("/api/profile", {
    sessionToken,
    allowedStatuses: [401, 403],
  });

  if (!res?.ok || !res.data) {
    throw new Error(res?.error || "No hay sesión activa");
  }

  return res.data;
}

export async function apiUpdateProfile(
  payload: Partial<Pick<ProfileDto, "name" | "email" | "phone" | "department" | "address">>,
  sessionToken?: string,
): Promise<ProfileDto> {
  const res = await odooPut<Envelope<ProfileDto>>("/api/profile", payload, {
    sessionToken,
    allowedStatuses: [400, 401, 403, 409],
  });

  if (!res?.ok || !res.data) {
    throw new Error(res?.error || "No se pudo actualizar el perfil");
  }

  return res.data;
}

export async function apiUpdateAvatar(
  dataUrl: string,
  sessionToken?: string,
): Promise<ProfileDto> {
  const res = await odooPut<Envelope<ProfileDto>>(
    "/api/profile/avatar",
    { data_url: dataUrl },
    { sessionToken, allowedStatuses: [400, 401, 403, 404] },
  );

  if (!res?.ok || !res.data) {
    throw new Error(res?.error || "No se pudo actualizar el avatar");
  }

  return res.data;
}

export async function apiClearAvatar(sessionToken?: string): Promise<ProfileDto> {
  const res = await odooPut<Envelope<ProfileDto>>(
    "/api/profile/avatar",
    { clear: true },
    { sessionToken, allowedStatuses: [400, 401, 403, 404] },
  );

  if (!res?.ok || !res.data) {
    throw new Error(res?.error || "No se pudo eliminar el avatar");
  }

  return res.data;
}

