import { tokenStorage } from '../storage/tokenStorage';

const BASE_URL = process.env.EXPO_PUBLIC_ODOO_URL ?? 'https://jwfn4vcd-8079.use2.devtunnels.ms/';
const REQUEST_TIMEOUT_MS = 12000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  body?: object;
  requiresAuth?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, requiresAuth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (requiresAuth) {
    const token = await tokenStorage.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: data?.error ?? `HTTP ${response.status}`,
          status: response.status,
        };
      }

      return { data, error: null, status: response.status };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (err) {
    const message =
      err instanceof Error && err.name === 'AbortError'
        ? `Tiempo de espera agotado al conectar con ${BASE_URL}`
        : err instanceof Error
          ? err.message
          : 'Network error';

    return {
      data: null,
      error: message,
      status: 0,
    };
  }
}

export const odooClient = {
  get:    <T>(endpoint: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...opts, method: 'GET' }),

  post:   <T>(endpoint: string, body: object, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...opts, method: 'POST', body }),

  put:    <T>(endpoint: string, body: object, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...opts, method: 'PUT', body }),

  delete: <T>(endpoint: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...opts, method: 'DELETE' }),
};
