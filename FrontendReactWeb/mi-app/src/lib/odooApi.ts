const RAW_ODOO_URL =
  process.env.NEXT_PUBLIC_ODOO_URL ??
  (typeof window === "undefined" ? process.env.ODOO_URL : undefined) ??
  "http://localhost:8079";

export const ODOO_URL = RAW_ODOO_URL.replace(/\/+$/, "");
const AUTH_API_BASE = "/api/auth";
const NEXT_PROXY_BASE = "/api/proxy";

function getStoredSessionToken(): string | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const localValue = window.localStorage.getItem("billnova.auth.user");
    const sessionValue = window.sessionStorage.getItem("billnova.auth.user");
    const rawValue = localValue ?? sessionValue;
    if (!rawValue) return undefined;

    const parsed = JSON.parse(rawValue) as { user?: { sessionToken?: string } };
    return parsed?.user?.sessionToken;
  } catch {
    return undefined;
  }
}

export function getOdooUrl(): string {
  if (!ODOO_URL) {
    throw new Error("Odoo URL is not configured. Check your environment variables.");
  }

  return ODOO_URL;
}

function buildRequestUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`Invalid API path: ${path}`);
  }

  if (typeof window !== "undefined") {
    return `${NEXT_PROXY_BASE}${path}`;
  }

  return `${ODOO_URL}${path}`;
}

export function authPath(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`Invalid auth path: ${path}`);
  }
  return `${AUTH_API_BASE}${path}`;
}

interface RequestOptions {
  sessionToken?: string;
  allowedStatuses?: number[];
  cache?: RequestCache;
}

interface ApiEnvelope<T> {
  data?: T;
  error?: string;
  message?: string;
  id?: number;
  ok?: boolean;
}

export async function odooPost<TRes>(
  path: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<TRes> {
  const response = await fetch(buildRequestUrl(path), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.sessionToken ? { "X-Auth-Session": options.sessionToken } : {}),
    },
    body: JSON.stringify(body),
  });

  const allowed = options.allowedStatuses ?? [];
  if (!response.ok && !allowed.includes(response.status)) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<TRes>;
}

export async function odooGet<TRes>(
  path: string,
  options: RequestOptions = {},
): Promise<TRes> {
  const response = await fetch(buildRequestUrl(path), {
    method: "GET",
    credentials: "include",
    cache: options.cache,
    headers: options.sessionToken
      ? { "X-Auth-Session": options.sessionToken }
      : undefined,
  });

  const allowed = options.allowedStatuses ?? [];
  if (!response.ok && !allowed.includes(response.status)) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
  }

  const text = await response.text();
  if (!text) {
    return { ok: false } as TRes;
  }

  try {
    return JSON.parse(text) as TRes;
  } catch {
    return { ok: false } as TRes;
  }
}

export async function odooPut<TRes>(
  path: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<TRes> {
  const response = await fetch(buildRequestUrl(path), {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.sessionToken ? { "X-Auth-Session": options.sessionToken } : {}),
    },
    body: JSON.stringify(body),
  });

  const allowed = options.allowedStatuses ?? [];
  if (!response.ok && !allowed.includes(response.status)) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<TRes>;
}

export async function odooDelete<TRes>(
  path: string,
  options: RequestOptions = {},
): Promise<TRes> {
  const response = await fetch(buildRequestUrl(path), {
    method: "DELETE",
    credentials: "include",
    headers: options.sessionToken
      ? { "X-Auth-Session": options.sessionToken }
      : undefined,
  });

  const allowed = options.allowedStatuses ?? [];
  if (!response.ok && !allowed.includes(response.status)) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();
  if (!text) {
    return { ok: true } as TRes;
  }

  try {
    return JSON.parse(text) as TRes;
  } catch {
    return { ok: true } as TRes;
  }
}

export async function odooRequest<TRes>(
  path: string,
  init?: RequestInit,
): Promise<TRes> {
  const sessionToken = getStoredSessionToken();
  const res = await fetch(buildRequestUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken ? { "X-Auth-Session": sessionToken } : {}),
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  const text = await res.text();

  if (!text) {
    return { ok: true } as TRes;
  }

  try {
    const payload = JSON.parse(text) as ApiEnvelope<TRes>;
    if (!res.ok) {
      throw new Error(payload?.error || payload?.message || `HTTP ${res.status}`);
    }
    return (payload?.data ?? payload) as TRes;
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(text);
  }
}
