import { NextResponse } from "next/server";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  const { id } = await context.params;
  const supabase = gate.auth!.supabase;
  const user = gate.auth!.user;

  const body = (await request.json()) as { is_read?: boolean };
  const isRead = body.is_read !== false;

  const { data, error } = await supabase
    .from("notifications")
    .update({
      is_read: isRead,
      read_at: isRead ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notification: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  const { id } = await context.params;
  const supabase = gate.auth!.supabase;
  const user = gate.auth!.user;

  const { error } = await supabase.from("notifications").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
