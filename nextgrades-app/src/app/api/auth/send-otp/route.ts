import { NextResponse } from "next/server";

/** @deprecated OTP registration removed — use POST /api/auth/signup with email link verification */
export async function POST() {
  return NextResponse.json({ error: "OTP verification is no longer used." }, { status: 410 });
}
