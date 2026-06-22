import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { publicCacheHeaders } from "@/lib/cache/public-cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const publicOnly = searchParams.get("public") === "1";

  try {
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);

    if (id) {
      const { data, error } = await db.from("blog_posts").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(data);
    }

    let query = db.from("blog_posts").select("*").order("updated_at", { ascending: false });
    if (publicOnly) query = query.eq("status", "published");

    const { data, error } = await query;
    if (error) {
      if (error.message.includes("blog_posts")) return NextResponse.json([]);
      throw error;
    }
    return NextResponse.json(data ?? [], { headers: publicOnly ? publicCacheHeaders() : undefined });
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
    const now = new Date().toISOString();
    const payload = {
      ...body,
      updated_at: now,
      published_at: body.status === "published" ? body.published_at ?? now : null,
    };
    const { data, error } = await gate.auth!.supabase.from("blog_posts").insert(payload).select().single();
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
    const payload = {
      ...updateData,
      updated_at: new Date().toISOString(),
      published_at:
        updateData.status === "published"
          ? updateData.published_at ?? new Date().toISOString()
          : updateData.status === "draft"
            ? null
            : updateData.published_at,
    };
    const { data, error } = await gate.auth!.supabase
      .from("blog_posts")
      .update(payload)
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
    const { error } = await gate.auth!.supabase.from("blog_posts").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
