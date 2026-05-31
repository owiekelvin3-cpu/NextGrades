import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { isZoomOAuthConfigured } from "@/lib/zoom/config";
import { buildZoomAuthorizeUrl } from "@/lib/zoom/oauth";

export async function GET() {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  if (!isZoomOAuthConfigured()) {
    return NextResponse.json({ error: "Zoom OAuth is not configured on the server" }, { status: 503 });
  }

  const state = crypto.randomBytes(24).toString("hex");
  const cookieStore = await cookies();

  cookieStore.set("zoom_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  cookieStore.set("zoom_oauth_teacher", gate.auth!.profile!.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const url = buildZoomAuthorizeUrl(state);
  return NextResponse.redirect(url);
}
