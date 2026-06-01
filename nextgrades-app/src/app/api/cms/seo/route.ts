import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";

export async function GET() {
  try {
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);
    const { data, error } = await db.from("cms_seo").select("*").order("page_name", { ascending: true });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    if (message.includes("og_title") || message.includes("og_description") || message.includes("structured_data")) {
      try {
        const supabase = await createClient();
        const db = await createServerReadClient(supabase);
        const { data } = await db
          .from("cms_seo")
          .select("id, page_name, title, description, keywords, og_image_url, twitter_image_url")
          .order("page_name", { ascending: true });
        return NextResponse.json(data ?? []);
      } catch {
        return NextResponse.json([]);
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  try {
    const body = await request.json();
    const { page_name, title, description, keywords, og_image_url, og_title, og_description, id } = body;
    if (!page_name) return NextResponse.json({ error: "page_name is required" }, { status: 400 });

    const payload = {
      page_name,
      title: title ?? null,
      description: description ?? null,
      keywords: keywords ?? null,
      og_image_url: og_image_url ?? null,
      og_title: og_title ?? null,
      og_description: og_description ?? null,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      let { data, error } = await gate.auth!.supabase
        .from("cms_seo")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error?.message?.includes("og_title")) {
        const { og_title: _t, og_description: _d, ...legacy } = payload;
        ({ data, error } = await gate.auth!.supabase
          .from("cms_seo")
          .update(legacy)
          .eq("id", id)
          .select()
          .single());
      }
      if (error) throw error;
      return NextResponse.json(data);
    }

    let { data, error } = await gate.auth!.supabase
      .from("cms_seo")
      .upsert(payload, { onConflict: "page_name" })
      .select()
      .single();
    if (error?.message?.includes("og_title")) {
      const { og_title: _t, og_description: _d, ...legacy } = payload;
      ({ data, error } = await gate.auth!.supabase
        .from("cms_seo")
        .upsert(legacy, { onConflict: "page_name" })
        .select()
        .single());
    }
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
