"use client";

// Always call our same-origin proxy to avoid CORS/cookie issues in the browser.
// The proxy forwards requests to the configured Odoo backend.
const API_BASE = "/api/proxy";
const AUTH_API_BASE = "/api/auth";

export function authPath(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`Invalid auth path: ${path}`);
  }
  return `${AUTH_API_BASE}${path}`;
}

interface RequestOptions {
  sessionToken?: string;
  allowedStatuses?: number[];
}

async function buildHttpError(response: Response): Promise<string> {
  let details = "";
  try {
    const payload = (await response.clone().json()) as any;
    if (payload?.error) details += String(payload.error);
    if (payload?.details) details += (details ? " - " : "") + String(payload.details);
    if (payload?.url) details += (details ? " - " : "") + String(payload.url);
  } catch {
    // ignore non-JSON bodies; we'll fall back to text preview below
  }

  if (!details) {
    try {
      const text = await response.clone().text();
      const preview = text.replace(/\s+/g, " ").trim().slice(0, 300);
      if (preview) details = preview;
    } catch {
      // ignore body read errors
    }
  }

  const url = (response as any).url ? String((response as any).url) : "";
  const suffix = url ? ` (${url})` : "";
  return `HTTP ${response.status}: ${details || response.statusText}${suffix}`;
}

export async function odooPost<TRes>(
  path: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<TRes> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include", // 👈 ESTO FALTABA
    headers: {
      "Content-Type": "application/json",
      ...(options.sessionToken ? { "X-Auth-Session": options.sessionToken } : {}),
    },
    body: JSON.stringify(body),
  });

  const allowed = options.allowedStatuses ?? [];
  if (!response.ok && !allowed.includes(response.status)) {
    throw new Error(await buildHttpError(response));
  }

  return response.json() as Promise<TRes>;
}

export async function odooPut<TRes>(
  path: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<TRes> {
  const response = await fetch(`${API_BASE}${path}`, {
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
    throw new Error(await buildHttpError(response));
  }

  return response.json() as Promise<TRes>;
}

export async function odooDelete<TRes>(path: string, options: RequestOptions = {}): Promise<TRes> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
    headers: options.sessionToken ? { "X-Auth-Session": options.sessionToken } : undefined,
  });

  const allowed = options.allowedStatuses ?? [];
  if (!response.ok && !allowed.includes(response.status)) {
    throw new Error(await buildHttpError(response));
  }

  return response.json() as Promise<TRes>;
}

export async function odooGet<TRes>(path: string, options: RequestOptions = {}): Promise<TRes> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    credentials: "include", // 👈 ESTO TAMBIÉN
    headers: options.sessionToken
      ? { "X-Auth-Session": options.sessionToken }
      : undefined,
  });

  const allowed = options.allowedStatuses ?? [];
  if (!response.ok && !allowed.includes(response.status)) {
    throw new Error(await buildHttpError(response));
  }

  return response.json() as Promise<TRes>;
}
