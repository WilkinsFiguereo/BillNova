import { NextRequest, NextResponse } from "next/server";

const ODOO_URL = (
  process.env.ODOO_URL ??
  process.env.NEXT_PUBLIC_ODOO_URL ??
  "http://localhost:8079"
).replace(/\/+$/, "");

async function forwardError(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();

  if (contentType.includes("application/json")) {
    try {
      return NextResponse.json(JSON.parse(rawBody), { status: response.status });
    } catch {
      // Fall through to the generic response below if the backend sent invalid JSON.
    }
  }

  return NextResponse.json(
    {
      error: `Backend error: ${response.status}`,
      details: rawBody,
    },
    { status: response.status }
  );
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

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PROXY GET ERROR] ${response.status}:`, errorText);
      return forwardError(
        new Response(errorText, {
          status: response.status,
          headers: response.headers,
        })
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

    console.log("[PROXY POST]", fullUrl, body);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`[PROXY POST ERROR] ${response.status}`);
      return forwardError(response);
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

    console.log("[PROXY PUT]", fullUrl, body);

    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`[PROXY PUT ERROR] ${response.status}`);
      return forwardError(response);
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

    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`[PROXY DELETE ERROR] ${response.status}`);
      return forwardError(response);
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
