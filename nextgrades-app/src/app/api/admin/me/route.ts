import { NextResponse } from "next/server";
import { getApiAuth } from "@/lib/auth/api-auth";

export async function GET() {
  const auth = await getApiAuth();
  if (!auth.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  return NextResponse.json({
    id: auth.user.id,
    email: auth.profile?.email ?? null,
    role: auth.profile?.role ?? null,
    fullName: auth.profile?.full_name ?? null,
    isAdmin: auth.profile?.role === "admin",
  });
}
