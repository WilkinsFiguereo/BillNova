import { NextRequest, NextResponse } from "next/server";

let ODOO_URL = process.env.ODOO_URL ?? process.env.NEXT_PUBLIC_ODOO_URL ?? "https://jwfn4vcd-8079.use2.devtunnels.ms";
while (ODOO_URL.endsWith("/")) {
  ODOO_URL = ODOO_URL.slice(0, -1);
}
const PROXY_TIMEOUT_MS = Number(process.env.ODOO_PROXY_TIMEOUT_MS ?? 60000);

function buildForwardHeaders(request: NextRequest) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Forward token-based session as an Odoo session cookie.
  const sessionToken = request.headers.get("x-auth-session");
  if (sessionToken) {
    headers.Cookie = `session_id=${sessionToken}`;
  }

  return headers;
}

function withTimeout(request: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  return { signal: controller.signal, clear: () => clearTimeout(timeout), headers: buildForwardHeaders(request) };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathStr = "/" + path.join("/");
    const queryString = request.nextUrl.search;
    const fullUrl = `${ODOO_URL}${pathStr}${queryString}`;

    console.log("[PROXY GET]", fullUrl);

    const t = withTimeout(request);
    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method: "GET",
        headers: t.headers,
        signal: t.signal,
        cache: "no-store",
      });
    } catch (error) {
      const isAbort = error instanceof Error && error.name === "AbortError";
      console.error("[PROXY GET EXCEPTION]", error);
      return NextResponse.json(
        { error: isAbort ? `Proxy timeout after ${PROXY_TIMEOUT_MS}ms` : String(error), url: fullUrl },
        { status: isAbort ? 504 : 500 },
      );
    } finally {
      t.clear();
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PROXY GET ERROR] ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText, url: fullUrl },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[PROXY GET EXCEPTION]", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathStr = "/" + path.join("/");
    const body = await request.json();
    const fullUrl = `${ODOO_URL}${pathStr}`;

    // Never log request bodies (credentials / PII may be included).
    console.log("[PROXY POST]", fullUrl);

    const t = withTimeout(request);
    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method: "POST",
        headers: t.headers,
        signal: t.signal,
        body: JSON.stringify(body),
      });
    } catch (error) {
      const isAbort = error instanceof Error && error.name === "AbortError";
      console.error("[PROXY POST EXCEPTION]", error);
      return NextResponse.json(
        { error: isAbort ? `Proxy timeout after ${PROXY_TIMEOUT_MS}ms` : String(error), url: fullUrl },
        { status: isAbort ? 504 : 500 },
      );
    } finally {
      t.clear();
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PROXY POST ERROR] ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText, url: fullUrl },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[PROXY POST EXCEPTION]", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathStr = "/" + path.join("/");
    const body = await request.json();
    const fullUrl = `${ODOO_URL}${pathStr}`;

    // Never log request bodies (credentials / PII may be included).
    console.log("[PROXY PUT]", fullUrl);

    const t = withTimeout(request);
    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method: "PUT",
        headers: t.headers,
        signal: t.signal,
        body: JSON.stringify(body),
      });
    } catch (error) {
      const isAbort = error instanceof Error && error.name === "AbortError";
      console.error("[PROXY PUT EXCEPTION]", error);
      return NextResponse.json(
        { error: isAbort ? `Proxy timeout after ${PROXY_TIMEOUT_MS}ms` : String(error), url: fullUrl },
        { status: isAbort ? 504 : 500 },
      );
    } finally {
      t.clear();
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PROXY PUT ERROR] ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText, url: fullUrl },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[PROXY PUT EXCEPTION]", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathStr = "/" + path.join("/");
    const fullUrl = `${ODOO_URL}${pathStr}`;

    console.log("[PROXY DELETE]", fullUrl);

    const t = withTimeout(request);
    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method: "DELETE",
        headers: t.headers,
        signal: t.signal,
      });
    } catch (error) {
      const isAbort = error instanceof Error && error.name === "AbortError";
      console.error("[PROXY DELETE EXCEPTION]", error);
      return NextResponse.json(
        { error: isAbort ? `Proxy timeout after ${PROXY_TIMEOUT_MS}ms` : String(error), url: fullUrl },
        { status: isAbort ? 504 : 500 },
      );
    } finally {
      t.clear();
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PROXY DELETE ERROR] ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText, url: fullUrl },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[PROXY DELETE EXCEPTION]", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
