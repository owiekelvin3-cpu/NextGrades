import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { isZoomOAuthConfigured } from "@/lib/zoom/config";
import { getZoomConnection } from "@/lib/zoom/tokens";

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

  return NextResponse.json({
    configured: true,
    connected: Boolean(connection),
    zoomEmail: connection?.zoomEmail ?? null,
    expiresAt: connection?.expiresAt.toISOString() ?? null,
    connectedAt: connection?.connectedAt.toISOString() ?? null,
    expired: connection ? connection.expiresAt.getTime() < Date.now() : false,
  });
}
