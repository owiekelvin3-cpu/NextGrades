import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeZoomCode, fetchZoomUser } from "@/lib/zoom/oauth";
import { saveZoomConnection } from "@/lib/zoom/tokens";
import { getAppUrl } from "@/lib/app-url";

const DEFAULT_RETURN = "/dashboard/teacher/settings";

function sanitizeReturnPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/dashboard/teacher")) return DEFAULT_RETURN;
  return path;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const returnPath = sanitizeReturnPath(cookieStore.get("zoom_oauth_return")?.value);

  const appUrl = getAppUrl();
  const redirectBase = `${appUrl}${returnPath}`;

  if (error) {
    cookieStore.delete("zoom_oauth_return");
    return NextResponse.redirect(`${redirectBase}?zoom=error&reason=${encodeURIComponent(error)}`);
  }

  const savedState = cookieStore.get("zoom_oauth_state")?.value;
  const teacherId = cookieStore.get("zoom_oauth_teacher")?.value;

  cookieStore.delete("zoom_oauth_state");
  cookieStore.delete("zoom_oauth_teacher");
  cookieStore.delete("zoom_oauth_return");

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
    const raw = e instanceof Error ? e.message : "auth_failed";
    const reason =
      raw.toLowerCase().includes("invalid_client") || raw.toLowerCase().includes("application not found")
        ? "invalid_client"
        : raw.toLowerCase().includes("token exchange")
          ? "token_exchange_failed"
          : "auth_failed";
    return NextResponse.redirect(`${redirectBase}?zoom=error&reason=${encodeURIComponent(reason)}`);
  }
}
