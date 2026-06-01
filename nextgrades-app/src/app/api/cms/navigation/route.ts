import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);
    let query = db.from("cms_navigation").select("*").order("sort_order", { ascending: true });
    if (location) query = query.eq("location", location);
    const { data, error } = await query;
    if (error) {
      if (error.message.includes("cms_navigation")) return NextResponse.json([]);
      throw error;
    }
    return NextResponse.json(data ?? []);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  try {
    const body = await request.json();
    const { data, error } = await gate.auth!.supabase.from("cms_navigation").insert(body).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  try {
    const body = await request.json();
    const { items } = body as { items: Array<Record<string, unknown>> };
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items array required" }, { status: 400 });
    }
    for (const item of items) {
      const { id, ...rest } = item;
      if (!id) continue;
      const { error } = await gate.auth!.supabase
        .from("cms_navigation")
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq("id", id as string);
      if (error) throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { error } = await gate.auth!.supabase.from("cms_navigation").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
