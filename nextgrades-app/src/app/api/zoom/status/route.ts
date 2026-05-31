import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { getZoomOAuthEnvironment, isMultiUserOAuthReady, isZoomOAuthConfigured } from "@/lib/zoom/config";
import { getZoomConnection, getZoomAccessToken } from "@/lib/zoom/tokens";

export async function GET() {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  const configured = isZoomOAuthConfigured();

  if (!configured) {
    return NextResponse.json({
      configured: false,
      connected: false,
    });
  }

  const connection = await getZoomConnection(teacherId);
  let connected = Boolean(connection);
  let expired = false;

  if (connection) {
    const token = await getZoomAccessToken(teacherId);
    connected = Boolean(token);
    expired = !token;
  }

  return NextResponse.json({
    configured: true,
    connected,
    zoomEmail: connection?.zoomEmail ?? null,
    expiresAt: connection?.expiresAt.toISOString() ?? null,
    connectedAt: connection?.connectedAt.toISOString() ?? null,
    expired,
    oauthEnv: getZoomOAuthEnvironment(),
    multiUserReady: isMultiUserOAuthReady(),
  });
}
