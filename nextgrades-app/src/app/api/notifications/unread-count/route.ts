import { NextResponse } from "next/server";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";

export async function GET() {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  const supabase = gate.auth!.supabase;
  const user = gate.auth!.user;

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ count: count ?? 0 });
}
