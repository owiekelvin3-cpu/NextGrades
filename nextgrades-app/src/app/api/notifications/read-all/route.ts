import { NextResponse } from "next/server";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";

export async function POST() {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  const supabase = gate.auth!.supabase;
  const user = gate.auth!.user;

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
