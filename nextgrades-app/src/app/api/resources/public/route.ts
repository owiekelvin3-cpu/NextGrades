import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();
    const access = searchParams.get("access");
    const categoryId = searchParams.get("category");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const baseSelect = `
        id,
        title,
        description,
        type,
        url,
        thumbnail_url,
        file_size,
        is_premium,
        download_count,
        view_count,
        created_at,
        subject:subjects(id, name)
      `;

    const extendedSelect = `
        ${baseSelect},
        access_type,
        category:resource_categories(id, name, icon)
      `;

    let data: Record<string, unknown>[] | null = null;
    let error: { message: string } | null = null;

    const primary = await db
      .from("materials")
      .select(extendedSelect)
      .order("created_at", { ascending: false })
      .limit(limit)
      .eq("status", "published")
      .eq("moderation_status", "approved");

    data = primary.data;
    error = primary.error;

    if (error?.message?.includes("status") || error?.message?.includes("moderation_status")) {
      const fallback = await db
        .from("materials")
        .select(baseSelect)
        .order("created_at", { ascending: false })
        .limit(limit)
        .or("is_premium.eq.false,is_premium.is.null");
      data = fallback.data;
      error = fallback.error;
    } else if (error?.message?.includes("resource_categories")) {
      const fallback = await db
        .from("materials")
        .select(`${baseSelect}, access_type`)
        .eq("status", "published")
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .limit(limit);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw error;

    let results = data || [];

    if (access === "free") {
      results = results.filter(
        (item) =>
          (item as { access_type?: string; is_premium?: boolean }).access_type === "free" ||
          !(item as { is_premium?: boolean }).is_premium
      );
    } else if (access === "premium") {
      results = results.filter(
        (item) =>
          (item as { access_type?: string; is_premium?: boolean }).access_type === "premium" ||
          (item as { is_premium?: boolean }).is_premium === true
      );
    }

    if (categoryId) {
      results = results.filter(
        (item) => (item as { category?: { id?: string } }).category?.id === categoryId
      );
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter((item) => {
        const row = item as { title?: string; description?: string };
        return (
          row.title?.toLowerCase().includes(q) ||
          row.description?.toLowerCase().includes(q)
        );
      });
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load resources";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
