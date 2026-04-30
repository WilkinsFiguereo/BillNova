import { tokenStorage } from '../storage/tokenStorage';

const BASE_URL = (process.env.EXPO_PUBLIC_ODOO_URL ?? 'https://jwfn4vcd-8079.use2.devtunnels.ms/').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_ODOO_TIMEOUT_MS ?? 20000);
const GET_RETRY_LIMIT = 1;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  body?: object;
  rawBody?: BodyInit;
  requiresAuth?: boolean;
  accept?: string | false;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === 'AbortError';
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  return executeRequest<T>(endpoint, options, 0);
}

async function executeRequest<T>(
  endpoint: string,
  options: RequestOptions,
  attempt: number,
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, rawBody, requiresAuth = false, accept, headers: customHeaders, timeoutMs } = options;
  const fullUrl = `${BASE_URL}${endpoint}`;
  const effectiveTimeoutMs = timeoutMs ?? REQUEST_TIMEOUT_MS;

  const headers: Record<string, string> = { ...(customHeaders ?? {}) };
  if (body && !headers['Content-Type']) {
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
      fullUrl,
      method,
      requiresAuth,
      hasToken: Boolean(token),
    });
  }

  try {
    const controller = new AbortController();
    const startedAt = Date.now();
    const timeoutId = setTimeout(() => controller.abort(), effectiveTimeoutMs);
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : rawBody,
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
            fullUrl,
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
        fullUrl,
        method,
        attempt,
        durationMs: Date.now() - startedAt,
        timeoutMs: effectiveTimeoutMs,
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
    if (method === 'GET' && isAbortError(err) && attempt < GET_RETRY_LIMIT) {
      console.log('[mobile][odooClient] retrying aborted request', {
        endpoint,
        fullUrl,
        method,
        attempt,
        nextAttempt: attempt + 1,
      });
      return executeRequest<T>(endpoint, options, attempt + 1);
    }

    console.log('[mobile][odooClient] request error', {
      endpoint,
      fullUrl,
      method,
      requiresAuth,
      attempt,
      error: err instanceof Error ? err.message : String(err),
      timeoutMs: effectiveTimeoutMs,
    });
    const message =
      isAbortError(err)
        ? `Tiempo de espera agotado en ${fullUrl} (${effectiveTimeoutMs} ms)`
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

  request:  <T>(endpoint: string, opts?: RequestOptions) =>
    request<T>(endpoint, opts),

  get:    <T>(endpoint: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...opts, method: 'GET' }),

  post:   <T>(endpoint: string, body: object, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...opts, method: 'POST', body }),

  put:    <T>(endpoint: string, body: object, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(endpoint, { ...opts, method: 'PUT', body }),

  delete: <T>(endpoint: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(endpoint, { ...opts, method: 'DELETE' }),
};
