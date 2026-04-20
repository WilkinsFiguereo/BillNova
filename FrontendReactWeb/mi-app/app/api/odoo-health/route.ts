import { getOdooUrl } from "@/lib/odooServer";

const TIMEOUT_MS = Number(process.env.ODOO_HEALTH_TIMEOUT_MS ?? 10000);

export async function GET() {
  const baseUrl = getOdooUrl();
  const url = `${baseUrl}/api/auth/session`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const startedAt = Date.now();
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    const elapsedMs = Date.now() - startedAt;
    const text = await res.text();

    return Response.json(
      {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        elapsedMs,
        url,
        contentType: res.headers.get("content-type"),
        bodyPreview: text.slice(0, 200),
      },
      { status: 200 },
    );
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    return Response.json(
      {
        ok: false,
        url,
        error: isAbort ? `Timeout after ${TIMEOUT_MS}ms` : (error instanceof Error ? error.message : String(error)),
      },
      { status: 200 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
