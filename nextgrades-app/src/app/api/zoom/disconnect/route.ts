import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { disconnectZoom } from "@/lib/zoom/tokens";

export async function POST() {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  try {
    await disconnectZoom(gate.auth!.profile!.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Disconnect failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
