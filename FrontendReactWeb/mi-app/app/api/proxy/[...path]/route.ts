import { NextRequest, NextResponse } from "next/server";
import { getOdooUrl } from "@/lib/odooApi";

const ODOO_URL = getOdooUrl();

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
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText },
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
      const errorText = await response.text();
      console.error(`[PROXY POST ERROR] ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText },
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
      const errorText = await response.text();
      console.error(`[PROXY PUT ERROR] ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText },
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

    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PROXY DELETE ERROR] ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status}`, details: errorText },
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
