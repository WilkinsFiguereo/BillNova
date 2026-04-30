import { tokenStorage } from '../storage/tokenStorage';

const BASE_URL = (process.env.EXPO_PUBLIC_ODOO_URL ?? 'https://jwfn4vcd-8079.use2.devtunnels.ms/').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 12000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  body?: object;
  requiresAuth?: boolean;
  accept?: string | false;
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
  const { method = 'GET', body, requiresAuth = false, accept } = options;

  const headers: Record<string, string> = {};
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  if (accept) {
    headers.Accept = accept;
  }

  if (requiresAuth) {
    const token = await tokenStorage.getToken();
    if (token) {
      headers['X-Auth-Session'] = token;
      headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('[mobile][odooClient] auth request', {
      endpoint,
      method,
      requiresAuth,
      hasToken: Boolean(token),
    });
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

      const rawText = await response.text();
      let data: any = null;
      if (rawText.trim()) {
        try {
          data = JSON.parse(rawText);
        } catch (parseError) {
          console.log('[mobile][odooClient] invalid json response', {
            endpoint,
            method,
            status: response.status,
            ok: response.ok,
            contentType: response.headers.get('content-type'),
            bodyPreview: rawText.slice(0, 300),
            parseError: parseError instanceof Error ? parseError.message : String(parseError),
          });
          return {
            data: null,
            error: `Respuesta invalida del servidor (${response.status})`,
            status: response.status,
          };
        }
      }
      console.log('[mobile][odooClient] response', {
        endpoint,
        method,
        status: response.status,
        ok: response.ok,
        requiresAuth,
        hasData: Boolean(data),
        hasBody: Boolean(rawText.trim()),
        dataOk: data?.ok ?? null,
        error: data?.error ?? null,
      });

      if (!response.ok) {
        return {
          data: null,
          error: data?.error ?? rawText.trim() ?? `HTTP ${response.status}`,
          status: response.status,
        };
      }

      if (!data) {
        return {
          data: null,
          error: `Respuesta vacia del servidor (${response.status})`,
          status: response.status,
        };
      }

      return { data, error: null, status: response.status };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (err) {
    console.log('[mobile][odooClient] request error', {
      endpoint,
      method,
      requiresAuth,
      error: err instanceof Error ? err.message : String(err),
    });
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
  buildUrl: (endpoint: string) => `${BASE_URL}${endpoint}`,

  get:    <T>(endpoint: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...opts, method: 'GET' }),

  post:   <T>(endpoint: string, body: object, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...opts, method: 'POST', body }),

  put:    <T>(endpoint: string, body: object, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...opts, method: 'PUT', body }),

  delete: <T>(endpoint: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...opts, method: 'DELETE' }),
};
