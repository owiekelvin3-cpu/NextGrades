import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";

async function getDb() {
  const supabase = await createClient();
  return createServerReadClient(supabase);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim().toLowerCase();
    const db = await getDb();
    const { data, error } = await db
      .from("cms_marketing_resources")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      if (error.message.includes("cms_marketing_resources")) return NextResponse.json([]);
      throw error;
    }
    let items = data ?? [];
    if (q) {
      items = items.filter(
        (r) =>
          r.title_en?.toLowerCase().includes(q) ||
          r.title_de?.toLowerCase().includes(q) ||
          r.category?.toLowerCase().includes(q)
      );
    }
    return NextResponse.json(items);
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
    const { data, error } = await gate.auth!.supabase.from("cms_marketing_resources").insert(body).select().single();
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
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { data, error } = await gate.auth!.supabase
      .from("cms_marketing_resources")
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
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
    const { error } = await gate.auth!.supabase.from("cms_marketing_resources").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
