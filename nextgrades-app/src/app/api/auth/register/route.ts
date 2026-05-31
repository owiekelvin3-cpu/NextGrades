import { NextResponse } from "next/server";

/** @deprecated Use POST /api/auth/signup instead */
export async function POST() {
  return NextResponse.json(
    { error: "This registration endpoint is deprecated. Use /api/auth/signup." },
    { status: 410 }
  );
}
