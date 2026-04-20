import { getOdooUrl } from "@/lib/odooServer";

const BACKEND_TIMEOUT_MS = Number(process.env.ODOO_FETCH_TIMEOUT_MS ?? 15000);

export async function GET() {
  try {
    const baseUrl = getOdooUrl();
    const url = `${baseUrl}/api/billnova-users`;
    console.log("[BillnovaUsers API] Fetching from:", url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[BillnovaUsers API] Backend error ${response.status}:`, errorText);
      return Response.json(
        { error: `Backend error ${response.status}: ${response.statusText}`, details: errorText, debugUrl: url },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json({ ...data, meta: { source: "backend", debugUrl: url } }, { status: 200 });
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    console.error("[BillnovaUsers API] Error fetching users:", error);
    return Response.json(
      { error: isAbort ? `Timeout after ${BACKEND_TIMEOUT_MS}ms` : "Fetch error", details: error instanceof Error ? error.message : String(error) },
      { status: isAbort ? 504 : 500 },
    );
  }
}

