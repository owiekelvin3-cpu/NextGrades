import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeZoomCode, fetchZoomUser } from "@/lib/zoom/oauth";
import { saveZoomConnection } from "@/lib/zoom/tokens";

const SETTINGS_URL = "/dashboard/teacher/settings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectBase = `${appUrl}${SETTINGS_URL}`;

  if (error) {
    return NextResponse.redirect(`${redirectBase}?zoom=error&reason=${encodeURIComponent(error)}`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("zoom_oauth_state")?.value;
  const teacherId = cookieStore.get("zoom_oauth_teacher")?.value;

  cookieStore.delete("zoom_oauth_state");
  cookieStore.delete("zoom_oauth_teacher");

  if (!code || !state || !savedState || state !== savedState || !teacherId) {
    return NextResponse.redirect(`${redirectBase}?zoom=error&reason=invalid_state`);
  }

  try {
    const tokens = await exchangeZoomCode(code);
    const zoomUser = await fetchZoomUser(tokens.access_token);

    await saveZoomConnection(teacherId, {
      zoomUserId: zoomUser.id,
      zoomEmail: zoomUser.email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      scopes: tokens.scope,
    });

    return NextResponse.redirect(`${redirectBase}?zoom=connected`);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "auth_failed";
    return NextResponse.redirect(`${redirectBase}?zoom=error&reason=${encodeURIComponent(reason)}`);
  }
}
