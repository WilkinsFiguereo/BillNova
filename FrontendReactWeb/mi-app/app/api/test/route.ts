import { NextResponse } from "next/server";
import { ODOO_URL } from "@/lib/odooApi";

export async function GET() {
  return NextResponse.json({
    message: "API works",
    env: {
      odooUrl: ODOO_URL,
      has_next_public: !!process.env.NEXT_PUBLIC_ODOO_URL,
    },
  });
}
