import { NextRequest, NextResponse } from "next/server";
import { getOdooUrl } from "@/lib/odooApi";

const ODOO_URL = getOdooUrl();

function buildTargetUrl(path: string[], queryString = ""): string {
  const pathStr = "/" + path.join("/");
  return `${ODOO_URL}${pathStr}${queryString}`;
}

function buildForwardHeaders(request: NextRequest, extraHeaders?: HeadersInit): Headers {
  const headers = new Headers(extraHeaders);
  const cookie = request.headers.get("cookie");
  const authSession = request.headers.get("x-auth-session");
  const accept = request.headers.get("accept");

  if (cookie) {
    headers.set("cookie", cookie);
  }

  if (authSession) {
    headers.set("x-auth-session", authSession);
  }

  if (accept) {
    headers.set("accept", accept);
  }

  return headers;
}

function copyResponseHeaders(source: Response, target: NextResponse) {
  const setCookie = source.headers.get("set-cookie");
  const contentType = source.headers.get("content-type");

  if (setCookie) {
    target.headers.set("set-cookie", setCookie);
  }

  if (contentType) {
    target.headers.set("content-type", contentType);
  }
}

async function toNextResponse(response: Response): Promise<NextResponse> {
  const text = await response.text();
  const nextResponse = new NextResponse(text, { status: response.status });
  copyResponseHeaders(response, nextResponse);
  return nextResponse;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const queryString = request.nextUrl.search;
    const fullUrl = buildTargetUrl(path, queryString);

    console.log("[PROXY GET]", fullUrl);

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: buildForwardHeaders(request),
    });

    return toNextResponse(response);
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
    const body = await request.text();
    const fullUrl = buildTargetUrl(path);

    console.log("[PROXY POST]", fullUrl, body);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: buildForwardHeaders(request, {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
      }),
      body,
    });

    return toNextResponse(response);
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
    const body = await request.text();
    const fullUrl = buildTargetUrl(path);

    console.log("[PROXY PUT]", fullUrl, body);

    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: buildForwardHeaders(request, {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
      }),
      body,
    });

    return toNextResponse(response);
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
    const fullUrl = buildTargetUrl(path);

    console.log("[PROXY DELETE]", fullUrl);

    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: buildForwardHeaders(request),
    });

    return toNextResponse(response);
  } catch (error) {
    console.error("[PROXY DELETE EXCEPTION]", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
