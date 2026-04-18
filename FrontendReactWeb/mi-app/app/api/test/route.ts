import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "API works",
    env: {
      odooUrl: process.env.ODOO_URL,
      has_next_public: !!process.env.NEXT_PUBLIC_ODOO_URL,
    },
  });
}
