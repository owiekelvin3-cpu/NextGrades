import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile } from "@/lib/quiz/auth";

type RouteParams = { params: Promise<{ id: string }> };

async function getOwnedSession(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, id: string) {
  const { data } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const session = await getOwnedSession(supabase, user.id, id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { data: messages, error: msgError } = await supabase
    .from("chat_messages")
    .select("id, role, content, model, created_at")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  return NextResponse.json({ session, messages: messages ?? [] });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const session = await getOwnedSession(supabase, user.id, id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const body = (await request.json()) as { title?: string };
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("chat_sessions")
    .update({ title: body.title.trim(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ session: data });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { user, profile, error } = await getAuthProfile(supabase);
  if (!user || !profile) {
    return NextResponse.json({ error: error ?? "Unauthorized" }, { status: 401 });
  }

  const session = await getOwnedSession(supabase, user.id, id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { error: deleteError } = await supabase.from("chat_sessions").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
