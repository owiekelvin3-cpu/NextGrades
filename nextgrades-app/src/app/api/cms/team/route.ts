import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";

export async function GET() {
  try {
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);
    const { data, error } = await db.from("cms_team").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  try {
    const body = await request.json();
    const { data, error } = await gate.auth!.supabase.from("cms_team").insert(body).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const { data, error } = await gate.auth!.supabase
      .from("cms_team")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const { error } = await gate.auth!.supabase.from("cms_team").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
